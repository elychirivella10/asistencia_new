import { createScopeFilter, validateAreaAccess } from "@/features/shared/services/policy-core.service";
import { SUPERVISION_CONFIG } from "../config/supervision.constants";
import { AREA_CONFIG } from "@/features/areas/config/area.constants";

/**
 * Determina el alcance de los permisos de supervisión visibles para el usuario actual.
 * @param {Object} currentUser - Usuario autenticado.
 * @returns {Promise<Object>} Filtro Prisma 'where' clause parcial.
 */
export async function getSupervisionScope(currentUser) {
  return createScopeFilter({
    currentUser,
    readAllPermission: SUPERVISION_CONFIG.PERMISSIONS.READ_ALL,
    fieldMap: {
      areaField: 'area_id',
      // Supervision doesn't have a 'user' field in the same way (it's the supervisor relation, but usually we filter by area)
      // Actually the original code just returned DENIED if no area access. 
      // If we pass a dummy userField it might try to match it.
      // But wait, the original code returned { id: "DENIED" } if denied.
      // createScopeFilter returns { userField: "DENIED" } if denied.
      // So if I pass userField: 'id' (of the supervision record), it works.
      userField: 'id' 
    },
    allowSelf: false // Supervisors don't necessarily see themselves in the supervision list unless they supervise their own area (covered by area logic)
  });
}

/**
 * Valida si el usuario actual puede asignar supervisión a un área específica.
 * @param {string} areaId - ID del área objetivo.
 * @param {Object} currentUser - Usuario autenticado.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateSupervisionAssignment(areaId, currentUser) {
  return validateAreaAccess({
    currentUser,
    areaId,
    globalPermission: AREA_CONFIG.PERMISSIONS.READ_ALL // Or supervision:create if preferred, but reusing areas:read_all as per original hint
  });
}
