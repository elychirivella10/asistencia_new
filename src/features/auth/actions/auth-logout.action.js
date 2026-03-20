'use server'

import { logout } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server Action to logout.
 * Removes session cookie and redirects to login.
 */
export async function logoutAction() {
  await logout()
  redirect('/login')
}
