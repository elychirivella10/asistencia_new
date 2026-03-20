/**
 * Configuración centralizada para el módulo de Autenticación.
 */

export const AUTH_CONFIG = {
  // Roles por defecto
  ROLES: {
    ADMIN: 'ADMIN',
    SUPERVISOR: 'SUPERVISOR',
    USER: 'USER',
  },

  // Cookies y Sesión
  SESSION: {
    COOKIE_NAME: 'session',
    EXPIRES_IN_MS: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    EXPIRES_IN_STR: '8h', // Expiración en cadena para jose signJWT
  },

  // Mensajes de error
  ERRORS: {
    INVALID_CREDENTIALS: 'Credenciales incorrectas',
    SERVER_ERROR: 'Error del servidor al autenticar',
    UNAUTHORIZED: 'Usuario no autenticado',
    FORBIDDEN: 'No tienes permiso para realizar esta acción',
  }
};
