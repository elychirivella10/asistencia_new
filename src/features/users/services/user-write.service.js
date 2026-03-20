import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateUserDeletion } from "./user-validation.service";
import { validateAreaAssignment } from "./user-policy.service";

const DEFAULT_ROLE_NAME = "EMPLEADO";

/**
 * Creates a new user.
 * @param {Object} data - User data.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createUser(data, currentUser) {
  // Validate Area Permission
  if (data.area_id) {
    const areaValidation = await validateAreaAssignment(data.area_id, currentUser);
    if (!areaValidation.success) return areaValidation;
  }

  const hashedPassword = await bcrypt.hash(data.cedula, 10);
  
  // Resolve role
  let rolId = data.rol_id;
  if (!rolId) {
      const rolEmpleado = await prisma.roles.findFirst({
        where: { nombre: DEFAULT_ROLE_NAME },
      });
      rolId = rolEmpleado?.id;
  }

  try {
    const user = await prisma.usuarios.create({
      data: {
        ...data,
        password: hashedPassword,
        rol_id: rolId,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Error al crear el usuario." };
  }
}

/**
 * Updates an existing user.
 * @param {string} id - User ID.
 * @param {Object} data - Data to update.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updateUser(id, data, currentUser) {
  // Validate Area Permission if changing area
  if (data.area_id) {
    const areaValidation = await validateAreaAssignment(data.area_id, currentUser);
    if (!areaValidation.success) return areaValidation;
  }

  try {
    const user = await prisma.usuarios.update({
      where: { id },
      data,
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Error al actualizar el usuario." };
  }
}

/**
 * Deletes a user, validating dependencies.
 * @param {string} id - User ID.
 * @returns {Promise<{success: boolean, error?: string, message?: string}>}
 */
export async function deleteUser(id) {
  // Validate business rules before deletion
  const validation = await validateUserDeletion(id);
  if (!validation.success) {
    return validation;
  }

  try {
    await prisma.usuarios.delete({
      where: { id },
    });
    return { success: true, message: "Usuario eliminado." };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Error al eliminar el usuario." };
  }
}

/**
 * Assigns multiple users to an area.
 * @param {string[]} userIds - Array of user IDs.
 * @param {string} areaId - Target Area ID.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function bulkAssignArea(userIds, areaId, currentUser) {
  // Validate Area Permission
  const areaValidation = await validateAreaAssignment(areaId, currentUser);
  if (!areaValidation.success) return areaValidation;

  try {
    await prisma.usuarios.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        area_id: areaId
      }
    });

    return { success: true, message: "Usuarios asignados correctamente." };
  } catch (error) {
    console.error("Error bulk assigning users:", error);
    return { success: false, error: "Error al asignar usuarios." };
  }
}
