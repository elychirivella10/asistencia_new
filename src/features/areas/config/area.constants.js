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
    }
  }
};
