/**
 * Configuración centralizada para el módulo de Usuarios.
 */

export const USER_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'users:read',
    READ_ALL: 'users:read_all',
    WRITE: 'users:write',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },

  // Estados de usuario
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Configuración de visualización (Frontend)
  UI: {
    BADGE_VARIANTS: {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
    },
    LABELS: {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      NO_ROLE: 'Sin Rol',
      NO_AREA: 'Sin Área',
      NOT_LINKED: 'No vinculado',
    }
  }
};
