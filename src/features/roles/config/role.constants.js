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
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre del Rol',
          DESCRIPTION: 'Descripción',
          PERMISSIONS: 'Permisos del Sistema',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Administrador',
          DESCRIPTION: 'Descripción del rol...',
        }
      },
      TABLE: {
        NAME: 'Rol',
        DESCRIPTION: 'Descripción',
        USERS: 'Usuarios',
        PERMISSIONS: 'Permisos',
        ACTIONS: 'Acciones',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar roles...',
        NEW_BUTTON: 'Nuevo Rol',
        SEARCH_LABEL: 'Búsqueda de Roles',
        DIVIDER_FILTERS: 'Filtros Disponibles',
        DIVIDER_SEARCH: 'Buscar Rol por Nombre',
        DIVIDER_ACTIONS: 'Gestión de Roles',
      }
    }
  }
};
