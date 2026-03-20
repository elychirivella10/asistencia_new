import { createScopeFilter } from "@/features/shared/services/policy-core.service";
import { verifyPermission } from "@/features/auth/services/permission.service";
import { getAreasPermitidas } from "@/features/areas/services/area-hierarchy.service";
import { USER_CONFIG } from "../config/user.constants";
import { AREA_CONFIG } from "@/features/areas/config/area.constants";

/**
 * Determina el alcance de los usuarios visibles para el usuario actual.
 * @param {Object} currentUser - Usuario autenticado.
 * @returns {Promise<Object>} Filtro Prisma 'where' clause parcial.
 */
export async function getUserScope(currentUser) {
  return createScopeFilter({
    currentUser,
    readAllPermission: USER_CONFIG.PERMISSIONS.READ_ALL,
    fieldMap: {
      areaField: 'area_id',
      userField: 'id'
    }
  });
}

/**
 * Validates if the current user can assign the target area.
 * @param {string|null} areaId - Target Area ID.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateAreaAssignment(areaId, currentUser) {
  if (!areaId) return { success: true };
  if (!currentUser) return { success: false, error: "Usuario no autenticado." };

  // Global admins can assign to any area
  const isGlobalAdmin = await verifyPermission(currentUser.role, AREA_CONFIG.PERMISSIONS.READ_ALL);
  if (isGlobalAdmin) return { success: true };

  // Check specific permissions
  const allowedAreas = await getAreasPermitidas(currentUser.id);
  if (!allowedAreas.includes(areaId)) {
    return { success: false, error: "No tienes permiso para asignar usuarios a esta área." };
  }
  return { success: true };
}
