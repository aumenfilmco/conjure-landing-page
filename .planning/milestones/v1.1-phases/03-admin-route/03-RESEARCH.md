# Phase 3: Admin Route - Research

**Researched:** 2026-03-14
**Domain:** Next.js 16 App Router authentication, CVE-2025-29927 mitigation, Supabase server-side data access
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMIN-01 | `/admin` route protected by password check against `ADMIN_PASSWORD` env var — verified in the Server Component (not middleware-only, due to CVE-2025-29927) | Defense-in-depth pattern: proxy.ts optimistic redirect + Server Component body re-verify via `verifySession()` |
| ADMIN-02 | Unauthenticated requests to `/admin` redirect to `/admin/login` | proxy.ts matcher `/admin` + `/admin/:path*` reads cookie; if absent → `NextResponse.redirect('/admin/login')` |
| ADMIN-03 | Login page: single password field, submits to set a session cookie, redirects to `/admin` on success | Server Action with `cookies()` from `next/headers`, sets httpOnly cookie via `jose` encrypt or `iron-session`; wrong password returns error state, never sets cookie |
| ADMIN-04 | Admin page queries Supabase `waitlist` table using service role key — displays name (or "—"), email, created_at | `@supabase/supabase-js` `createClient` with `SUPABASE_SERVICE_ROLE_KEY` in Server Component only; never imported in any `'use client'` file |
| ADMIN-05 | Table sorted most recent first; total count shown | `.select('*').order('created_at', { ascending: false })` in the same Server Component query |
</phase_requirements>

---

## Summary

Phase 3 builds a simple but genuinely secure admin route. The threat model is narrow: a single human operator checks waitlist signups. There is no user registration, no roles, no per-row access control. The password is stored as a plain env var and compared server-side. A session cookie (httpOnly, Secure, SameSite=lax) proves the operator authenticated.

The primary security concern is CVE-2025-29927: an attacker can send `x-middleware-subrequest: middleware` (or `middleware:middleware:middleware:middleware:middleware` on Next.js 15+) to skip all proxy/middleware execution and reach the route directly. The fix is defense-in-depth: proxy.ts does an optimistic cookie check (fast redirect for normal browsers), but the Server Component body independently re-reads and re-validates the session cookie. If proxy is bypassed, the Server Component still calls `redirect('/admin/login')` before rendering any data. This is the pattern Vercel explicitly recommends in their CVE postmortem.

The project runs Next.js 16.1.6. In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts` (function exported as `proxy`). The API is otherwise identical — `NextRequest`, `NextResponse`, `request.cookies.get()`. The file still works as `middleware.ts` for Edge runtime but should be written as `proxy.ts` for this project (Node.js runtime).

Supabase is accessed with `@supabase/supabase-js` using `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })`. This must live in a Server Component file — never imported from any `'use client'` file. The `server-only` npm package can be added as an import guard. The project's existing `env.ts` convention already documents this: `SUPABASE_SERVICE_ROLE_KEY` is accessed via `process.env` in Server Components only, never re-exported from env.ts.

**Primary recommendation:** Use `jose` (already ecosystem-standard, zero new deps if treating it as part of the Next.js auth pattern) or `iron-session@^8.0.4` for session sealing/unsealing. Jose is lighter and used by the official Next.js docs example. Either works; research recommends `jose` to avoid a new production dependency.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `jose` | `^5.x` (latest) | JWT sign/verify for session cookie | Used in official Next.js App Router auth docs example; works in Node.js and Edge; no additional deps |
| `@supabase/supabase-js` | `^2.x` | Supabase client for server-side queries | Only client library for Supabase JS; service-role usage is documented pattern |
| `server-only` | latest | Compile-time guard preventing server modules from entering client bundle | Official Next.js recommendation for files with secrets |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `iron-session` | `^8.0.4` | Encrypted stateless cookie sessions | Alternative to jose; slightly higher-level API; use if devs prefer it over raw JWT |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `jose` (manual JWT) | `iron-session` | iron-session is slightly simpler API but adds a production dep; jose ships with Next.js's own auth example |
| `jose` | `@auth/core` / NextAuth | Massive overkill for a single-operator password check; adds significant complexity |
| `@supabase/supabase-js` direct | `@supabase/ssr` | `@supabase/ssr` is for auth-session cookie management with Supabase auth — not needed here; service role does not use cookies |

**Installation:**
```bash
npm install jose @supabase/supabase-js server-only
```

---

## Architecture Patterns

### Recommended File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # (optional) shared admin shell — Server Component
│       ├── page.tsx            # /admin — Server Component, verifies session + queries Supabase
│       └── login/
│           ├── page.tsx        # /admin/login — renders LoginForm
│           └── actions.ts      # Server Actions: login(), logout()
├── lib/
│   ├── session.ts              # encrypt/decrypt helpers (jose) + createSession/deleteSession
│   └── supabase-admin.ts       # createAdminClient() — server-only guard
proxy.ts                        # (project root or src/) — optimistic cookie check
```

### Pattern 1: Defense-in-Depth (ADMIN-01 + ADMIN-02)

**What:** Two independent auth checks — proxy.ts for fast redirect, Server Component body for data protection.

**When to use:** Always, for every protected route. Middleware bypass (CVE-2025-29927) is a real attack; single-layer auth is insufficient.

**Proxy layer (optimistic):**
```typescript
// proxy.ts — project root or src/proxy.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login')

  if (isAdminRoute) {
    const sessionCookie = request.cookies.get('admin_session')?.value
    const session = await decrypt(sessionCookie)

    if (!session?.authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

**Server Component layer (secure — CVE mitigation):**
```typescript
// src/app/admin/page.tsx
// Source: https://nextjs.org/docs/app/guides/authentication#server-components
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function AdminPage() {
  // Re-verify session in Server Component body — proxy bypass does not skip this
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value
  const session = await decrypt(sessionCookie)

  if (!session?.authenticated) {
    redirect('/admin/login')
  }

  // Only reached if session is valid — fetch Supabase data here
  const supabase = createAdminClient()
  // ... see ADMIN-04 pattern
}
```

**Why two layers:** CVE-2025-29927 allows an attacker to bypass proxy entirely by sending `x-middleware-subrequest: middleware`. The Server Component's call to `cookies()` and `decrypt()` happens inside the route render pipeline — it cannot be bypassed by a header. Vercel's CVE postmortem explicitly states: "We do not recommend Middleware to be the sole method of protecting routes."

### Pattern 2: Session Management with jose (ADMIN-03)

```typescript
// src/lib/session.ts
// Source: https://nextjs.org/docs/app/guides/authentication#stateless-sessions
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET)
const COOKIE_NAME = 'admin_session'
const EXPIRY_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function encrypt(payload: { authenticated: true }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function decrypt(token: string | undefined) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] })
    return payload as { authenticated: boolean }
  } catch {
    return null
  }
}

export async function createSession() {
  const token = await encrypt({ authenticated: true })
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EXPIRY_SECONDS,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
```

### Pattern 3: Login Server Action (ADMIN-03)

```typescript
// src/app/admin/login/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createSession } from '@/lib/session'

export type LoginState = { error?: string } | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password' }
  }

  await createSession()
  redirect('/admin')
}
```

**Key points:**
- Wrong password: return error state — cookie is never set (ADMIN-03 criterion 3)
- `redirect()` inside a Server Action throws a Next.js redirect — it does not return to the client
- `process.env.ADMIN_PASSWORD` is only accessible server-side (no `NEXT_PUBLIC_` prefix)

### Pattern 4: Supabase Service Role Query (ADMIN-04, ADMIN-05)

```typescript
// src/lib/supabase-admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
```

```typescript
// In src/app/admin/page.tsx (after session is verified)
const supabase = createAdminClient()
const { data: signups, error } = await supabase
  .from('waitlist')
  .select('name, email, created_at')
  .order('created_at', { ascending: false })

const total = signups?.length ?? 0
```

**Why `import 'server-only'` matters:** If any Client Component ever imports `supabase-admin.ts`, the build will throw at compile time: `You're importing a component that needs "server-only"`. This is a hard compile-time guard. Without it, accidental import in a `'use client'` file would silently include `SUPABASE_SERVICE_ROLE_KEY` in the browser bundle.

### Pattern 5: Login Form with useActionState (ADMIN-03)

```typescript
// src/app/admin/login/page.tsx — must be Server Component wrapper
import LoginForm from './LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
```

```typescript
// src/app/admin/login/LoginForm.tsx
'use client'
import { useActionState } from 'react'
import { login } from './actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action}>
      <input type="password" name="password" required />
      {state?.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>Log in</button>
    </form>
  )
}
```

### Anti-Patterns to Avoid

- **Middleware-only protection:** Single-layer auth is bypassed by CVE-2025-29927. Always verify in the Server Component body too.
- **Returning session cookie on wrong password:** The `login` action must return an error state without calling `createSession()`. Verify this in tests.
- **Importing `supabase-admin.ts` or `session.ts` from a `'use client'` file:** Compile-time guard (`import 'server-only'`) prevents this, but never use `NEXT_PUBLIC_` prefix on `SUPABASE_SERVICE_ROLE_KEY` or `SESSION_SECRET`.
- **Storing `SESSION_SECRET` in the session payload:** The secret is the signing key, not a payload field. The payload only needs `{ authenticated: true }` — there are no user IDs in this single-operator scheme.
- **Using `redirect()` without a try/catch in Server Actions:** `redirect()` throws internally. If wrapped in try/catch it will be caught as an error. Call `redirect()` outside any try block.
- **Checking `x-middleware-subrequest` in proxy:** The CVE is patched in Next.js >= 15.2.3 (this project runs 16.1.6 which exceeds the floor). The proxy layer is an optimistic UX convenience, not the security layer.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT sign/verify | Custom HMAC with crypto.subtle | `jose` SignJWT / jwtVerify | Timing-safe comparison, header parsing, expiry enforcement, algorithm confusion attacks — all handled |
| Cookie encryption | XOR / base64 "encryption" | `jose` or `iron-session` | Security requires authenticated encryption (AES-GCM or similar); hand-rolled approaches are routinely broken |
| Constant-time password compare | `password === env.ADMIN_PASSWORD` | Fine for single-operator CLI-style password; timing attacks require many requests and are not realistic here — this is acceptable | N/A |
| Supabase client | Custom fetch wrapper | `@supabase/supabase-js` | Handles PostgREST encoding, errors, pagination, TLS; service role docs tested against this client |

**Key insight:** The session cryptography is the one area where hand-rolling is genuinely dangerous. `jose` is the single correct choice — it's used in the official Next.js docs and handles all the edge cases (algorithm confusion, expired tokens, malformed inputs) that home-grown implementations miss.

---

## Common Pitfalls

### Pitfall 1: proxy.ts Bypass via CVE-2025-29927
**What goes wrong:** Attacker sends `curl -H "x-middleware-subrequest: middleware" /admin` — proxy is skipped entirely; if the Server Component doesn't re-verify, Supabase data is returned.
**Why it happens:** Next.js used `x-middleware-subrequest` internally to prevent infinite loops; the check trusted externally-supplied values.
**How to avoid:** Always call `decrypt(cookie)` and `redirect('/admin/login')` inside the Server Component body, independent of the proxy check.
**Warning signs:** If removing `proxy.ts` entirely doesn't break your `/admin` route's auth, the Server Component layer is working correctly (good). If removing `proxy.ts` exposes data, the Server Component layer is missing (bad).

### Pitfall 2: `redirect()` Inside try/catch
**What goes wrong:** `redirect()` in Next.js 15+ throws a special `NEXT_REDIRECT` error internally. If you wrap it in `try/catch`, the catch block swallows it and the redirect never fires.
**Why it happens:** Next.js signals the redirect via a thrown error that the framework intercepts upstream.
**How to avoid:** Call `redirect()` outside any try/catch block. Pattern: validate inside try/catch, redirect after.
**Warning signs:** User stays on the login page after correct password; no cookie set in DevTools.

### Pitfall 3: `SUPABASE_SERVICE_ROLE_KEY` in Client Bundle
**What goes wrong:** Service role key appears in `_next/static/chunks/*.js` — any visitor can extract it and bypass Row Level Security on all Supabase tables.
**Why it happens:** Importing `supabase-admin.ts` from a Client Component (or a shared module imported by one) causes Next.js to include it in the client bundle.
**How to avoid:** `import 'server-only'` at top of `supabase-admin.ts` causes a build-time error if imported from client code. Verify with browser DevTools network search after deploy.
**Warning signs:** The service role key (a long JWT beginning with `eyJ`) is visible in any `_next/static` JS file.

### Pitfall 4: `SESSION_SECRET` Too Short or Missing
**What goes wrong:** `jose` requires the secret key to be cryptographically strong. A short or missing secret key causes `jwtVerify` to throw or allows brute-force.
**Why it happens:** Developer forgets to add `SESSION_SECRET` to `.env.local` or Vercel env vars; defaults to empty string.
**How to avoid:** Generate with `openssl rand -base64 32` (produces a 32-byte / 256-bit key). Validate at startup: if `process.env.SESSION_SECRET` is falsy, throw a descriptive error.
**Warning signs:** All login attempts fail; server logs show `jose` key errors.

### Pitfall 5: Cookie Not Set on Correct Path/Domain
**What goes wrong:** Cookie set with `path: '/admin'` is not sent with requests to `/` — fine for this use case — but if the cookie uses `secure: true` on `localhost` (HTTP), the browser discards it silently.
**Why it happens:** `secure: true` requires HTTPS. `localhost` is HTTP.
**How to avoid:** `secure: process.env.NODE_ENV === 'production'` — only enforce HTTPS in production.
**Warning signs:** Login succeeds in Vercel preview but fails on localhost; DevTools shows `Set-Cookie` header but cookie doesn't appear in the cookies panel.

### Pitfall 6: `await cookies()` Required in Next.js 16
**What goes wrong:** `cookies()` without `await` throws: "cookies() should be awaited before using its value."
**Why it happens:** Next.js 16 made `cookies()`, `headers()`, `draftMode()` async (breaking change listed in upgrade guide).
**How to avoid:** Always `const cookieStore = await cookies()` — note this project's `env.ts` already uses the async pattern.
**Warning signs:** TypeScript errors on `cookieStore.get()`; runtime throws during session read.

---

## Code Examples

### Generating SESSION_SECRET
```bash
# Run once; store result as SESSION_SECRET in .env.local and Vercel env vars
openssl rand -base64 32
```

### Verifying the CVE-2025-29927 Mitigation (from success criteria)
```bash
# This curl should return a redirect (302), NOT the admin page HTML
curl -I -H "x-middleware-subrequest: middleware" http://localhost:3000/admin
# Expected: HTTP/1.1 302 Found
# Location: http://localhost:3000/admin/login
```

### Supabase waitlist query (ADMIN-04, ADMIN-05)
```typescript
// Source: https://github.com/orgs/supabase/discussions/30739
const { data: signups, error } = await supabase
  .from('waitlist')
  .select('name, email, created_at')
  .order('created_at', { ascending: false })

if (error) throw new Error(`Supabase error: ${error.message}`)
const total = signups?.length ?? 0
```

### Login action with correct redirect pattern
```typescript
// Source: https://nextjs.org/docs/app/guides/authentication
'use server'
import { redirect } from 'next/navigation'
import { createSession } from '@/lib/session'

export async function login(_prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string

  // Validation OUTSIDE redirect — avoid wrapping redirect in try/catch
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password' }
  }

  await createSession()  // Sets httpOnly cookie
  redirect('/admin')     // Throws NEXT_REDIRECT — do not wrap in try/catch
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0 (Oct 2025) | File rename required; old name still works but deprecated with warning |
| Edge runtime only for middleware | Node.js runtime default for proxy | Next.js 15.5 (stable) | `crypto`, Node.js builtins available — `jose` works without runtime restrictions |
| `cookies()` synchronous | `cookies()` async — must `await` | Next.js 15.0 | Breaking change; all cookie reads need `await` |
| `getServerSession()` (next-auth pattern) | `decrypt(await cookies().get(...))` manual pattern | Ongoing | For single-operator password auth, no full auth library needed |

**Deprecated/outdated:**
- `middleware.ts` filename: Use `proxy.ts` — deprecated in Next.js 16, removed in a future version.
- Synchronous `cookies()` / `headers()`: Removed as synchronous in Next.js 16 (async is now required).
- Protecting routes in middleware only: Official Vercel guidance post-CVE-2025-29927 says "do not use middleware as the sole method."

---

## Open Questions

1. **Does the Supabase `waitlist` table schema match the expected columns?**
   - What we know: REQUIREMENTS.md says the table has `name`, `email`, `created_at`; WAIT-02 says form POSTs to `conjurestudio.app/api/waitlist` with `{ email, name? }`
   - What's unclear: Exact column names and nullability as created in the Conjure app database — `name` may be nullable or absent
   - Recommendation: Admin page renders `row.name || '—'` for the null/empty case (already specified in ADMIN-04); this is safe regardless of whether `name` is a column or null

2. **Does `SESSION_SECRET` need to be added to Vercel env vars?**
   - What we know: It must exist server-side; it's not in FOUND-04 env var list
   - What's unclear: Whether it's already in the Vercel project env or needs to be added during Phase 3
   - Recommendation: Wave 0 task should document this as a prerequisite; plan task should verify env var presence in deployment checklist

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | Server Component re-verifies session independent of proxy | unit (source scan) | `npm test -- src/app/admin/page.test.ts` | ❌ Wave 0 |
| ADMIN-02 | proxy.ts redirects unauthenticated `/admin` requests to `/admin/login` | unit (proxy matcher) | `npm test -- src/proxy.test.ts` | ❌ Wave 0 |
| ADMIN-03a | Correct password sets httpOnly cookie and redirects to `/admin` | unit (server action) | `npm test -- src/app/admin/login/actions.test.ts` | ❌ Wave 0 |
| ADMIN-03b | Incorrect password returns error, sets no cookie | unit (server action) | `npm test -- src/app/admin/login/actions.test.ts` | ❌ Wave 0 |
| ADMIN-04 | `SUPABASE_SERVICE_ROLE_KEY` not in any client bundle | unit (source scan / bundle guard) | `npm test -- src/lib/supabase-admin.test.ts` | ❌ Wave 0 |
| ADMIN-05 | Table sorted newest-first; total count shown | unit (source/query scan) | `npm test -- src/app/admin/page.test.ts` | ❌ Wave 0 |

**Notes on test approach:** Existing tests in this project use a mix of source-scan (fs.readFileSync + string assertions) and React Testing Library renders. For server-side-only patterns (Server Components, Server Actions), the viable strategy is source scanning — assert that `order('created_at', { ascending: false })`, `redirect('/admin/login')`, and `import 'server-only'` appear in the correct files. This matches the project's established pattern (see `page.test.tsx`, `glass.test.ts`).

Proxy matcher logic can be tested with `unstable_doesProxyMatch` from `next/experimental/testing/server` (available since Next.js 15.1).

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/app/admin/page.test.ts` — covers ADMIN-01, ADMIN-05 (source scan)
- [ ] `src/proxy.test.ts` — covers ADMIN-02 (matcher + redirect logic)
- [ ] `src/app/admin/login/actions.test.ts` — covers ADMIN-03a, ADMIN-03b
- [ ] `src/lib/supabase-admin.test.ts` — covers ADMIN-04 (server-only guard import present)

---

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — session management patterns, Server Component verify, cookies() API, jose examples; version 16.1.6 confirmed
- [Next.js proxy.ts API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — matcher config, cookies API, migration from middleware.ts; version 16.1.6 confirmed
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) — middleware→proxy rename, async cookies() breaking change, Node.js runtime default
- [Vercel CVE Postmortem](https://vercel.com/blog/postmortem-on-next-js-middleware-bypass) — attack vector, fixed versions (>=15.2.3), "do not use middleware as sole auth method" recommendation

### Secondary (MEDIUM confidence)
- [Datadog Security Labs — CVE-2025-29927](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/) — exact header values for bypass attempts
- [Supabase service role in Next.js discussion](https://github.com/orgs/supabase/discussions/30739) — createClient pattern with auth options disabled
- [iron-session npm (v8.0.4)](https://www.npmjs.com/package/iron-session) — current version, getIronSession API

### Tertiary (LOW confidence, flag for validation)
- Various WebSearch results on iron-session + Next.js 14 examples — patterns are consistent but examples are pre-Next.js 16; `await cookies()` pattern confirmed via official docs overrides

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — jose and @supabase/supabase-js verified against official Next.js docs; versions confirmed
- Architecture: HIGH — proxy.ts + Server Component defense-in-depth is Vercel's own CVE-mitigation recommendation; async cookies() requirement confirmed in Next.js 16 docs
- CVE-2025-29927 mitigation: HIGH — verified against Vercel postmortem, Datadog analysis, and NVD entry; this project runs Next.js 16.1.6 which exceeds the patched floor of 15.2.3 (patch is included), but the Server Component re-verify is still required best practice
- Pitfalls: HIGH — all pitfalls sourced from official docs or directly traceable to framework behavior

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable ecosystem; jose and @supabase/supabase-js APIs are stable)
