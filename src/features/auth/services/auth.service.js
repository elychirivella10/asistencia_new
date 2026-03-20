import prisma from '@/features/shared/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/features/auth/lib/auth'
import { AUTH_CONFIG } from '../config/auth.constants'

/**
 * Authenticates a user with their credentials.
 * 
 * @param {string} cedula 
 * @param {string} password 
 * @returns {Promise<{success: boolean, error?: string, user?: Object}>}
 */
export async function authenticateUser(cedula, password) {
  try {
    const user = await prisma.usuarios.findUnique({
      where: { cedula },
      include: { roles: true }
    })

    if (!user || !user.password || user.es_activo === false) {
      return { success: false, error: AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS }
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return { success: false, error: AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS }
    }

    // Return user so action can handle session if needed
    return { success: true, user }

  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: AUTH_CONFIG.ERRORS.SERVER_ERROR }
  }
}

/**
 * Creates a session for an authenticated user.
 * 
 * @param {Object} user - Authenticated user
 * @returns {Promise<void>}
 */
export async function loginUserSession(user) {
    await createSession({
      id: user.id,
      cedula: user.cedula,
      role: user.roles?.nombre || AUTH_CONFIG.ROLES.USER,
      area_id: user.area_id
    })
}
