import { NextResponse } from 'next/server'
import { decrypt } from '@/features/auth/lib/auth'

const protectedRoutes = ['/']
const publicRoutes = ['/login']

export async function middleware(req) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route) && !publicRoutes.includes(path))
  
  // Skip static files
  if (path.startsWith('/_next') || path.startsWith('/static') || path.includes('.')) {
    return NextResponse.next()
  }

  // En Middleware (Edge), usamos req.cookies en lugar de cookies() de next/headers
  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
