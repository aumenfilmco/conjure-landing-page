'use client'
import { useActionState } from 'react'
import { login } from './actions'
import type { LoginState } from './actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[oklch(0.04_0_0)]">
      <form action={action} className="flex flex-col gap-4 w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold text-white">Admin login</h1>
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="rounded-lg px-4 py-2 bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[oklch(0.92_0.18_142)]"
        />
        {state?.error && (
          <p role="alert" className="text-red-400 text-sm">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2 bg-[oklch(0.92_0.18_142)] text-black font-medium disabled:opacity-50"
        >
          {pending ? 'Logging in\u2026' : 'Log in'}
        </button>
      </form>
    </main>
  )
}
