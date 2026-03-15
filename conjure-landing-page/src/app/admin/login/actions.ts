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
  redirect('/admin') // Do NOT wrap in try/catch — redirect() throws NEXT_REDIRECT internally
}
