import prisma from "@/lib/prisma";
import { validateRoleName, validateRoleDeletion } from "./role-validation.service";

/**
 * Creates a new role with permissions.
 * @param {Object} data - Role data.
 * @param {string} data.nombre - Role name.
 * @param {string} data.descripcion - Role description.
 * @param {Array<string|number>} data.permisos - List of permission IDs.
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createRole(data) {
  const { nombre, descripcion, permisos } = data;

  // 1. Validate
  const validation = await validateRoleName(nombre);
  if (!validation.success) {
    return validation;
  }

  try {
    const newRole = await prisma.roles.create({
      data: {
        nombre,
        descripcion,
        roles_permisos: {
          create: permisos.map((permisoId) => ({
            permiso_id: parseInt(permisoId),
          })),
        },
      },
    });

    return { success: true, data: newRole };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Error al crear el rol." };
  }
}

/**
 * Updates an existing role.
 * @param {string|number} id - Role ID.
 * @param {Object} data - Updated data.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateRole(id, data) {
  const { nombre, descripcion, permisos } = data;
  const roleId = parseInt(id);

  // 1. Validate
  const validation = await validateRoleName(nombre, roleId);
  if (!validation.success) {
    return validation;
  }

  try {
    // Check if role exists
    const existingRole = await prisma.roles.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      return { success: false, error: "El rol no existe." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.roles.update({
        where: { id: roleId },
        data: { nombre, descripcion },
      });

      if (permisos) {
        await tx.roles_permisos.deleteMany({
          where: { rol_id: roleId },
        });

        if (permisos.length > 0) {
          await tx.roles_permisos.createMany({
            data: permisos.map((pId) => ({
              rol_id: roleId,
              permiso_id: parseInt(pId),
            })),
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Error al actualizar el rol." };
  }
}

/**
 * Deletes a role if it has no assigned users.
 * @param {string|number} id - Role ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteRole(id) {
  const roleId = parseInt(id);

  // 1. Validate
  const validation = await validateRoleDeletion(roleId);
  if (!validation.success) {
    return validation;
  }

  try {
    await prisma.roles.delete({
      where: { id: roleId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Error al eliminar el rol." };
  }
}
