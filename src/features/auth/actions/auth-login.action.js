'use server'

import { loginSchema } from '../schemas/login.schema'
import { authenticateUser, loginUserSession } from '../services/auth.service'

/**
 * Server Action for user login.
 * @param {any} prevState - Previous state from useActionState.
 * @param {FormData} formData - Form data.
 */
export async function loginAction(prevState, formData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: 'Datos inválidos', details: result.error.flatten().fieldErrors }
  }

  const { cedula, password } = result.data

  const authResult = await authenticateUser(cedula, password);

  if (!authResult.success) {
    return { error: authResult.error }
  }

  await loginUserSession(authResult.user);

  return { success: true }
}
