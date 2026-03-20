import prisma from "@/features/shared/lib/prisma";

/**
 * Validates role name uniqueness.
 * 
 * @param {string} nombre - Role name
 * @param {string|number} [current_id] - Current role ID (for updates)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateRoleName(nombre, current_id) {
  const existing = await prisma.roles.findUnique({
    where: { nombre },
  });

  if (existing && (!current_id || existing.id !== parseInt(current_id))) {
    return { success: false, error: "Ya existe un rol con ese nombre." };
  }

  return { success: true };
}

/**
 * Validates if a role can be deleted.
 * 
 * @param {string|number} id - Role ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateRoleDeletion(id) {
  const role = await prisma.roles.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { usuarios: true },
      },
    },
  });

  if (!role) {
    return { success: false, error: "El rol no existe." };
  }

  if (role._count.usuarios > 0) {
    return { 
      success: false, 
      error: `No se puede eliminar: Hay ${role._count.usuarios} usuarios asignados a este rol.` 
    };
  }

  return { success: true };
}
