/**
 * Configuración centralizada para el módulo de Roles.
 */

export const ROLE_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'roles:read',
    READ_ALL: 'roles:read_all',
    // Permiso para crear roles (coincide con slugs de DB)
    WRITE: 'roles:create',
    UPDATE: 'roles:update',
    DELETE: 'roles:delete',
  },

  // Configuración de visualización (Frontend)
  UI: {
    MAX_VISIBLE_PERMISSIONS: 3,
    ITEMS_PER_PAGE: 10,
  }
};
