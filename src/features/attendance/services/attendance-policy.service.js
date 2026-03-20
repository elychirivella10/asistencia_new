import { createScopeFilter, validateAreaAccess } from "@/features/shared/services/policy-core.service";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

/**
 * Determina el alcance de los registros de asistencia visibles para un usuario.
 * @param {Object} currentUser - Usuario autenticado.
 * @param {string} requestedAreaId - Filtro de área solicitado (opcional).
 * @returns {Promise<Object>} Filtro Prisma 'where' clause parcial.
 * @throws {Error} Si el acceso es denegado.
 */
export async function getAttendanceScope(currentUser, requestedAreaId) {
  // Caso 1: Se solicita un área específica
  if (requestedAreaId && requestedAreaId !== ATTENDANCE_CONFIG.FILTERS.ALL) {
    const access = await validateAreaAccess({
      currentUser,
      areaId: requestedAreaId,
      globalPermission: ATTENDANCE_CONFIG.PERMISSIONS.READ_ALL
    });

    if (!access.success) {
      throw new Error("Access Denied: No tienes permiso para ver esta área.");
    }

    return { usuarios: { area_id: requestedAreaId } };
  }

  // Caso 2: Vista general (determinado por permisos/jerarquía)
  return createScopeFilter({
    currentUser,
    readAllPermission: ATTENDANCE_CONFIG.PERMISSIONS.READ_ALL,
    fieldMap: {
      areaField: 'usuarios.area_id',
      userField: 'usuario_id'
    }
  });
}
