import { createScopeFilter } from "@/features/permissions/services/permission-scoping.service";
import { INCIDENT_CONFIG } from "../config/incidents.constants";

/**
 * Determina el alcance de las novedades (incidencias) visibles para el usuario actual.
 * @param {Object} currentUser - Usuario autenticado.
 * @returns {Promise<Object>} Filtro Prisma 'where' clause parcial.
 */
export async function getIncidentScope(currentUser) {
  return createScopeFilter({
    currentUser,
    readAllPermission: INCIDENT_CONFIG.PERMISSIONS.READ_ALL,
    fieldMap: {
      areaField: 'usuario.area_id',
      userField: 'usuario_id'
    }
  });
}
