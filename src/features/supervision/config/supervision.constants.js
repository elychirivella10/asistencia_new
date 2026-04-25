/**
 * Configuración centralizada para el módulo de Supervisión.
 */

export const SUPERVISION_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'supervision:read',
    READ_ALL: 'supervision:read_all',
    WRITE: 'supervision:create',
    UPDATE: 'supervision:update',
    DELETE: 'supervision:delete',
  },

  // Configuración de visualización (Frontend)
  UI: {
    LABELS: {
      NO_TYPE: 'N/A',
      FORM: {
        FIELDS: {
          SUPERVISOR: 'Usuario Supervisor',
          AREA: 'Área a Supervisar',
        },
        PLACEHOLDERS: {
          SEARCH_SUPERVISOR: 'Buscar usuario...',
          SEARCH_AREA: 'Buscar área...',
        }
      },
      TABLE: {
        SUPERVISOR: 'Supervisor',
        AREA: 'Área Supervisada',
        STATUS: 'Estado',
        ACTIONS: 'Acciones',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar supervisor o área...',
        NEW_BUTTON: 'Asignar Supervisión',
        SEARCH_LABEL: 'Búsqueda de Supervisiones',
        DIVIDER_FILTERS: 'Filtros de Área y Estado',
        DIVIDER_SEARCH: 'Buscar por Nombre o Cédula',
        DIVIDER_ACTIONS: 'Herramientas de Supervisión',
      }
    }
  }
};
