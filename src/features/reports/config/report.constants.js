/**
 * Centralized configuration for the Reports module.
 */
export const REPORT_CONFIG = {
  // Required permissions
  PERMISSIONS: {
    READ:     'reports:read',
    READ_ALL: 'reports:read_all',
  },

  // Shared "all" sentinel value used by toolbar selects
  FILTERS: {
    ALL: 'all',
  },

  // Pagination
  PAGINATION: {
    PAGE_SIZE: 25,
  },

  // Report types available in the system
  TYPES: {
    ATTENDANCE: 'attendance',
    TARDINESS: 'tardiness',
    INCIDENTS: 'incidents',
  },

  // UI Labels
  UI: {
    LABELS: {
      LOADING:       'Generando reporte...',
      NO_DATA:       'No se encontraron registros en el rango seleccionado.',
      EMPTY_TABLE:   'No hay datos para mostrar con los filtros seleccionados.',
      EXPORT_EXCEL:  'Exportar Excel',
      EXPORT_PDF:    'Exportar PDF',
      FILTER_BUTTON: 'Filtrar',
      CLEAN_BUTTON:  'Limpiar',
      SEARCH_RESULTS: 'resultados encontrados',
      NO_RESULTS:    'No se encontraron resultados para los filtros aplicados.',
      TOOLBAR: {
        FILTERS: {
          ESTADO_SOLICITUD: 'Estado de Solicitud',
          TIPO_PERMISO:     'Tipo de Permiso',
          ESTADO_DIA:       'Estado (Día)',
          JUSTIFICACION:    'Justificación/Excepción',
          LLEGADA:          'Llegada',
          SALIDA:           'Salida',
          DATE_FROM:        'Desde',
          DATE_TO:          'Hasta',
          AREA:             'Área',
          SEARCH_LABEL:     'Búsqueda en Reportes',
          DIVIDER_FILTERS:  'Criterios del Reporte',
          DIVIDER_SEARCH:   'Filtrar Resultados',
          DIVIDER_ACTIONS:  'Acciones y Exportación',
        },
        PLACEHOLDERS: {
          ALL_STATES:      'Todos los Estados',
          ANY_PERMISSION:  'Cualquier Permiso',
          ALL_EXCEPTIONS:  'Todas las Excepciones',
          ALL_ARRIVALS:    'Todas las Llegadas',
          ALL_DEPARTURES:  'Todas las Salidas',
          ALL_AREAS:       'Todas las Áreas',
          SEARCH_REPORTS:  'Buscar por nombre, apellido o cédula...',
        }
      }
    },
  },
};
