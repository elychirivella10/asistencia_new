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
    }
  }
};
