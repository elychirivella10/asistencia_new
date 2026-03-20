/**
 * Configuración centralizada para el módulo de Asistencia.
 */

export const ATTENDANCE_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'attendance:read',
    READ_ALL: 'attendance:read_all',
  },

  FILTERS: {
    ALL: "all",
  },

  // Umbrales y lógica de negocio
  BUSINESS: {
    LATE_NOTIFICATION_COLOR: 'text-destructive font-semibold',
  },

  // Configuración de UI
  UI: {
    DEFAULT_STATUS_COLOR: '#6b7280', // Gray default
    ITEMS_PER_PAGE: 15,
    STATUS_VARIANTS: {
      'presente': { label: 'Presente', color: '#10b981' }, // Green
      'tardia': { label: 'Tardía', color: '#f59e0b' }, // Amber
      'falta': { label: 'Falta', color: '#ef4444' }, // Red
      'justificado': { label: 'Justificado', color: '#3b82f6' }, // Blue
      'descanso': { label: 'Descanso', color: '#6b7280' }, // Gray
      'feriado': { label: 'Feriado', color: '#8b5cf6' }, // Purple
      'incompleto': { label: 'Incompleto', color: '#f97316' }, // Orange
    }
  }
};
