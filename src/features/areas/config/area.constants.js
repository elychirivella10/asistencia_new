/**
 * Configuración centralizada para el módulo de Áreas.
 */

export const AREA_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'areas:read',
    READ_ALL: 'areas:read_all',
    WRITE: 'areas:create',
    UPDATE: 'areas:update',
    DELETE: 'areas:delete',
  },

  // Configuración de visualización (Frontend)
  UI: {
    LABELS: {
      ROOT: '- Raíz -',
      NO_CHIEF: 'Sin asignar',
      NO_TYPE: 'N/A',
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre del Área',
          TYPE: 'Tipo de Área',
          PARENT: 'Área Padre (Opcional)',
          CHIEF: 'Jefe de Área',
          EXEMPT_LATE: 'Exento de Tardanza/Inasistencia',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Recursos Humanos',
          SELECT_TYPE: 'Seleccionar Tipo',
          SEARCH_PARENT: 'Buscar Área Superior...',
          SEARCH_CHIEF: 'Buscar usuario...',
        },
        DESCRIPTIONS: {
          EXEMPT: 'Si se activa, no se enviarán correos automáticos si los empleados de esta área llegan tarde.',
        }
      },
      TABLE: {
        NAME: 'Nombre del Área',
        TYPE: 'Tipo',
        PARENT: 'Área Padre',
        CHIEF: 'Responsable',
        ACTIONS: 'Acciones',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar áreas...',
        TYPE_PLACEHOLDER: 'Tipo de Área',
        TYPE_ALL: 'Todos los tipos',
        NEW_BUTTON: 'Nueva Área',
        SEARCH_LABEL: 'Búsqueda de Áreas',
        DIVIDER_FILTERS: 'Configuración de Filtros',
        DIVIDER_SEARCH: 'Búsqueda por Nombre',
        DIVIDER_ACTIONS: 'Acciones Disponibles',
      },
      ORGANIGRAM: {
        BREADCRUMB_HOME: 'Inicio',
        SUB_AREAS_COUNT: (count) => count === 1 ? '1 área subordinada' : `${count} áreas subordinadas`,
        TERMINAL_AREA: 'Área terminal',
        GO_BACK: 'Volver',
        EMPTY_STATE: 'No se pudo generar la estructura.',
        EMPTY_STATE_SUB: 'Verifique que existan áreas registradas.',
        ROOT_TITLE: 'Área Actual',
        DEPENDENCIES_TITLE: 'Dependencias Directas',
        ACTIVE_VIEW: 'Vista por Niveles'
      }
    }
  }
};
