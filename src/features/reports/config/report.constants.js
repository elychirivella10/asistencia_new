/**
 * Centralized configuration for the Reports module.
 */
export const REPORT_CONFIG = {
  // Required permissions
  PERMISSIONS: {
    READ: 'reports:read',
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
      LOADING: 'Generando reporte...',
      NO_DATA: 'No se encontraron registros en el rango seleccionado.',
      EXPORT_EXCEL: 'Exportar Excel',
      EXPORT_PDF: 'Exportar PDF',
      FILTER_BUTTON: 'Filtrar',
    },
  },
};
