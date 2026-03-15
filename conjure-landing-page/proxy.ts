import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login')

  if (isAdminRoute) {
    const cookie = request.cookies.get('admin_session')?.value
    const session = await decrypt(cookie)
    if (!session?.authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
