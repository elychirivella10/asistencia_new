import prisma from "@/lib/prisma";

/**
 * Verifies if a role has access to a specific permission (Backend Check).
 * @param {string} roleName - Role name (from session)
 * @param {string} requiredSlug - Required permission slug (e.g. 'users:create')
 * @returns {Promise<boolean>}
 */
export async function verifyPermission(roleName, requiredSlug) {
  // 1. If no specific permission required, allow access
  if (!requiredSlug) return true;

  // 2. Check if Role <-> Permission relation exists
  const count = await prisma.roles_permisos.count({
    where: {
      roles: { nombre: roleName },
      permisos_sistema: { slug: requiredSlug }
    }
  });

  return count > 0;
}

/**
 * Retrieves all permissions assigned to a role (Frontend Load).
 * Used to inject into PermissionsProvider.
 * @param {string} roleName 
 * @returns {Promise<string[]>} Array of slugs
 */
export async function getUserPermissions(roleName) {
  if (!roleName) return [];

  const permissions = await prisma.roles_permisos.findMany({
    where: {
      roles: { nombre: roleName }
    },
    include: {
      permisos_sistema: true
    }
  });

  return permissions.map(p => p.permisos_sistema.slug);
}
