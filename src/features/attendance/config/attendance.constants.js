/**
 * Configuración centralizada para el módulo de Asistencia.
 */

export const ATTENDANCE_CONFIG = {
  // Required permissions
  PERMISSIONS: {
    READ:     'attendance:read',
    READ_ALL: 'attendance:read_all',
  },

  // Common filters
  FILTERS: {
    ALL: "all",
  },

  // Business logic and categories
  BUSINESS: {
    CATEGORIES: {
      ATTENDANCE: 'ASISTENCIA',
      JUSTIFIED:  'JUSTIFICADO',
    },
    COLORS: {
      LATE_NOTIFICATION: 'text-destructive font-semibold',
    }
  },

  // UI Configuration and Labels
  UI: {
    DEFAULT_STATUS_COLOR: '#6b7280',
    ITEMS_PER_PAGE: 25,
    STATUS_VARIANTS: {
      'presente':    { label: 'Presente',    color: '#10b981' },
      'tardia':      { label: 'Tardía',      color: '#f59e0b' },
      'falta':       { label: 'Falta',       color: '#ef4444' },
      'justificado': { label: 'Justificado', color: '#3b82f6' },
      'descanso':    { label: 'Descanso',    color: '#6b7280' },
      'feriado':     { label: 'Feriado',     color: '#8b5cf6' },
      'incompleto':  { label: 'Incompleto',  color: '#f97316' },
    },
    LABELS: {
      EMPTY_TABLE:    'No se encontraron registros de asistencia.',
      SEARCH_RESULTS: 'registros encontrados.',
      NO_RESULTS:     'No se hallaron registros con estos filtros.',
      FILTER_BUTTON:  'Filtrar',
      CLEAN_BUTTON:   'Limpiar',
      FILTER_LOADING: 'Filtrando...',
      ENTITY_NAME:    'registros',
      SEARCH_PLACEHOLDER: 'Buscar por nombre, apellido o cédula...',
      TOOLBAR: {
        FROM: 'Desde',
        TO:   'Hasta',
        AREA: 'Área',
        AREA_PLACEHOLDER: 'Todas las Áreas',
        STATUS: 'Estado (Día)',
        STATUS_PLACEHOLDER: 'Todos los Estados',
        EXCEPTION: 'Justificación/Excepción',
        EXCEPTION_PLACEHOLDER: 'Todas las Excepciones',
        ARRIVAL: 'Llegada',
        ARRIVAL_PLACEHOLDER: 'Todas las Llegadas',
        DEPARTURE: 'Salida',
        DEPARTURE_PLACEHOLDER: 'Todas las Salidas',
        SEARCH_LABEL: 'Búsqueda de Asistencias',
        DIVIDER_FILTERS: 'Configurar Filtros de Fecha y Área',
        DIVIDER_SEARCH: 'Buscar por Nombre o Cédula',
        DIVIDER_ACTIONS: 'Acciones de Tabla',
      },
      STATS: {
        EMPLOYEES:     'Empleados',
        EMPLOYEES_SUB: 'Activos en periodo',
        GROSS_HOURS:   'Horas Bruto',
        GROSS_HOURS_SUB: 'Tiempo acumulado',
        NET_HOURS:     'Horas Neto',
        NET_HOURS_SUB: 'Con descuento de comedor',
        BALANCE:       'Balance',
        DINING_DISCOUNT: 'Descuento Comedor',
        DINING_DISCOUNT_SUB: 'Minutos descontados',
        PUNCTUALITY:   'Puntualidad',
        LATE_ARRIVALS: 'Tardías',
        LATE_ARRIVALS_SUB: 'Requieren atención',
        ABSENCES:      'Inasistencias',
        ABSENCES_SUB:  'Faltas registradas'
      }
    }
  }
};
