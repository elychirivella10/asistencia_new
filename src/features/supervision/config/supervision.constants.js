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
    }
  }
};
