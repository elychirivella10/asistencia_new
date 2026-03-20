import { verifyPermission } from "@/features/auth/services/permission.service";
import { getAreasPermitidas } from "@/features/areas/services/area-hierarchy.service";

/**
 * Core Policy Service
 * Centralizes common logic for RBAC + Hierarchy scoping (Row Level Security).
 */

/**
 * Creates a Prisma 'where' clause based on user role and hierarchy.
 * 
 * @param {Object} params
 * @param {Object} params.currentUser - Authenticated user.
 * @param {string} params.readAllPermission - Permission slug that allows full access (e.g. 'users:read_all').
 * @param {Object} [params.fieldMap] - Mapping of Prisma fields.
 * @param {string} [params.fieldMap.areaField='area_id'] - Field name for Area relation (e.g. 'area_id' or 'usuario.area_id').
 * @param {string} [params.fieldMap.userField='id'] - Field name for User relation (e.g. 'id' or 'usuario_id').
 * @param {boolean} [params.allowSelf=true] - If true, allows users to see their own records even if they have no hierarchical power.
 * @returns {Promise<Object>} Prisma where clause.
 */
export async function createScopeFilter({ 
  currentUser, 
  readAllPermission, 
  fieldMap = { areaField: 'area_id', userField: 'id' },
  allowSelf = true 
}) {
  if (!currentUser) return { [fieldMap.userField]: "DENIED" };

  // 1. Global Admin Check
  if (readAllPermission) {
    const canReadAll = await verifyPermission(currentUser.role, readAllPermission);
    if (canReadAll) {
      return {}; // No filter = Access all
    }
  }

  // 2. Hierarchy Check (Manager of Areas)
  const allowedAreaIds = await getAreasPermitidas(currentUser.id);
  
  if (allowedAreaIds.length > 0) {
    // Can see records in their areas OR their own record
    const areaFilter = unflattenField(fieldMap.areaField, { in: allowedAreaIds });
    
    if (allowSelf) {
      const selfFilter = unflattenField(fieldMap.userField, currentUser.id);
      return {
        OR: [
          areaFilter,
          selfFilter
        ]
      };
    } else {
      return areaFilter;
    }
  }

  // 3. Self Access (Regular Employee)
  if (allowSelf) {
    return unflattenField(fieldMap.userField, currentUser.id);
  }

  // 4. Denied
  return { [fieldMap.userField]: "DENIED" };
}

/**
 * Validates if a user has permission to assign/write to a specific area.
 * 
 * @param {Object} params
 * @param {Object} params.currentUser - Authenticated user.
 * @param {string} params.areaId - Target Area ID.
 * @param {string} [params.globalPermission='areas:read_all'] - Permission that bypasses hierarchy check.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateAreaAccess({ currentUser, areaId, globalPermission = 'areas:read_all' }) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado." };
  if (!areaId) return { success: false, error: "Área no especificada." };

  // 1. Global Check
  const canManageAll = await verifyPermission(currentUser.role, globalPermission);
  if (canManageAll) return { success: true };

  // 2. Hierarchy Check
  const allowedAreas = await getAreasPermitidas(currentUser.id);
  if (!allowedAreas.includes(areaId)) {
    return { success: false, error: "No tienes permiso sobre esta área." };
  }

  return { success: true };
}

// Helper to handle nested fields like 'usuario.area_id'
function unflattenField(fieldPath, value) {
  const parts = fieldPath.split('.');
  if (parts.length === 1) {
    return { [parts[0]]: value };
  }
  // Recursive construction: 'usuario.area_id' -> { usuario: { area_id: value } }
  return {
    [parts[0]]: unflattenField(parts.slice(1).join('.'), value)
  };
}
