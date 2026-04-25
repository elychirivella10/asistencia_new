/**
 * Configuración centralizada para el módulo de Incidencias (Novedades).
 */

export const INCIDENT_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'incidents:read',
    READ_ALL: 'incidents:read_all',
    WRITE: 'incidents:create',
    UPDATE: 'incidents:update',
    DELETE: 'incidents:delete',
  },

  // Estados de la novedad
  STATUS: {
    PENDING: 'PENDIENTE',
    APPROVED: 'APROBADO',
    REJECTED: 'RECHAZADO',
  },

  // Configuración de visualización (Frontend)
  UI: {
    BADGE_VARIANTS: {
      APROBADO: 'default',
      PENDIENTE: 'secondary',
      RECHAZADO: 'destructive',
    },
    LABELS: {
      FORM: {
        FIELDS: {
          EMPLOYEE: 'Empleado',
          TYPE: 'Tipo de Novedad',
          FROM: 'Fecha Desde',
          TO: 'Fecha Hasta',
          FULL_DAY: 'Día Completo',
          START_TIME: 'Hora Inicio',
          END_TIME: 'Hora Fin',
          OBSERVATIONS: 'Observaciones (Opcional)',
        },
        PLACEHOLDERS: {
          SEARCH_EMPLOYEE: 'Buscar empleado...',
          SELECT_TYPE: 'Seleccione tipo',
          OBSERVATIONS: 'Detalles adicionales...',
        },
        DESCRIPTIONS: {
          FULL_DAY: 'Aplica para toda la jornada',
        }
      },
      TABLE: {
        EMPLOYEE: 'Empleado',
        TYPE: 'Tipo',
        START_DATE: 'Fecha Inicio',
        END_DATE: 'Fecha Fin',
        OBSERVATIONS: 'Observaciones',
        STATUS: 'Estado',
        ACTIONS: 'Acciones',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar por empleado o cédula...',
        STATUS_PLACEHOLDER: 'Estado',
        STATUS_ALL: 'Todos los Estados',
        STATUS_PENDING: 'Pendientes',
        STATUS_APPROVED: 'Aprobados',
        STATUS_REJECTED: 'Rechazados',
        NEW_BUTTON: 'Nueva Novedad',
        SEARCH_LABEL: 'Búsqueda de Novedades',
        DIVIDER_FILTERS: 'Filtros de Estado',
        DIVIDER_SEARCH: 'Búsqueda Rápida de Personal',
        DIVIDER_ACTIONS: 'Acciones de Registro',
      }
    }
  }
};
