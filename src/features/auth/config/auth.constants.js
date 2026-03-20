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
    EXPIRES_IN: 8 * 60 * 60 * 1000, // 8 horas (alineado con reglas y JWT)
  },

  // Mensajes de error
  ERRORS: {
    INVALID_CREDENTIALS: 'Credenciales incorrectas',
    SERVER_ERROR: 'Error del servidor al autenticar',
    UNAUTHORIZED: 'Usuario no autenticado',
    FORBIDDEN: 'No tienes permiso para realizar esta acción',
  }
};
