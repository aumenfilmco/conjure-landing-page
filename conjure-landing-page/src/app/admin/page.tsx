import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase-admin'

interface WaitlistRow {
  name: string | null
  email: string
  created_at: string
}

export default async function AdminPage() {
  // Re-verify session in Server Component body.
  // This is the CVE-2025-29927 mitigation — proxy.ts can be bypassed via
  // x-middleware-subrequest header; this check cannot be bypassed.
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value
  const session = await decrypt(sessionCookie)

  if (!session?.authenticated) {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()
  const { data: signups, error } = await supabase
    .from('waitlist')
    .select('name, email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }

  const total = signups?.length ?? 0

  return (
    <main className="min-h-screen bg-[oklch(0.04_0_0)] text-white px-8 py-12">
      <h1 className="text-2xl font-semibold mb-2">Waitlist signups</h1>
      <p className="text-white/60 mb-8">Total: {total}</p>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/20">
            <th className="pb-3 pr-8 text-white/60 font-medium">Name</th>
            <th className="pb-3 pr-8 text-white/60 font-medium">Email</th>
            <th className="pb-3 text-white/60 font-medium">Signed up</th>
          </tr>
        </thead>
        <tbody>
          {(signups as WaitlistRow[])?.map((row, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="py-3 pr-8">{row.name || '\u2014'}</td>
              <td className="py-3 pr-8">{row.email}</td>
              <td className="py-3 text-white/60">
                {new Date(row.created_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
