import { createScopeFilter, validateAreaAccess } from "@/features/permissions/services/permission-scoping.service";
import { REPORT_CONFIG } from "../config/report.constants";

/**
 * Determines the visible scope of report data for a given user.
 * Mirrors attendance-policy.service.js — centralizes all scope logic for the reports module.
 *
 * @param {Object} currentUser - Authenticated session user.
 * @param {string|string[]|undefined} requestedAreaId - Area filter from toolbar (optional).
 * @returns {Promise<Object>} Partial Prisma 'where' clause to apply to the query.
 * @throws {Error} If user requests an area they don't have access to.
 */
export async function getReportScope(currentUser, requestedAreaId) {
  const { ALL } = REPORT_CONFIG.FILTERS;

  // Case 1: Specific area requested — validate access first
  if (requestedAreaId && requestedAreaId !== ALL && requestedAreaId?.length !== 0) {
    const areaToCheck = Array.isArray(requestedAreaId) ? requestedAreaId[0] : requestedAreaId;

    const access = await validateAreaAccess({
      currentUser,
      areaId: areaToCheck,
      globalPermission: REPORT_CONFIG.PERMISSIONS.READ_ALL,
    });

    if (!access.success) {
      throw new Error("Access Denied: No tienes permiso para ver esta área.");
    }

    const ids = Array.isArray(requestedAreaId) ? requestedAreaId : [requestedAreaId];
    return { usuario: { area_id: { in: ids } } };
  }

  // Case 2: General view — scoped by role/hierarchy
  return createScopeFilter({
    currentUser,
    readAllPermission: REPORT_CONFIG.PERMISSIONS.READ_ALL,
    fieldMap: { areaField: 'usuario.area_id', userField: 'usuario_id' },
    allowSelf: true,
  });
}
