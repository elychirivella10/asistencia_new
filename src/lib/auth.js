import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_default_123')
const ALG = 'HS256'

/**
 * Encrypts a payload into a JWT.
 * @param {Object} payload - Data to encrypt.
 * @returns {Promise<string>} JWT string.
 */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key)
}

/**
 * Decrypts and verifies a JWT.
 * @param {string} token - JWT string.
 * @returns {Promise<Object|null>} Payload or null if invalid.
 */
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] })
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Creates a session cookie.
 * @param {Object} user - User data.
 */
export async function createSession(user) {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
  const session = await encrypt({ 
    id: user.id, 
    cedula: user.cedula, 
    role: user.role, 
    area_id: user.area_id 
  })

  const cookieStore = await cookies()
  
  // Determinar si la cookie debe ser segura
  // Por defecto es segura en producción, pero permitimos override vía variable de entorno
  // Útil para despliegues locales en red (IP) sin HTTPS
  const isSecure = process.env.COOKIE_SECURE 
    ? process.env.COOKIE_SECURE === 'true' 
    : process.env.NODE_ENV === 'production'

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: isSecure,
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  return await decrypt(session)
}
