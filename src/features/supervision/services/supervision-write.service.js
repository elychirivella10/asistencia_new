import prisma from "@/lib/prisma";
import { validateSupervisionAssignment } from "./supervision-policy.service";

/**
 * Creates a new supervision permission.
 * @param {Object} data - Permission data.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createSupervision = async (data, currentUser) => {
  // Validate Area Permission
  if (data.area_id) {
    const policy = await validateSupervisionAssignment(data.area_id, currentUser);
    if (!policy.success) return policy;
  }

  try {
    const supervision = await prisma.permiso_supervision.create({
      data
    });
    return { success: true, data: supervision };
  } catch (error) {
    console.error("Error creating supervision:", error);
    return { success: false, error: "Error al crear el permiso de supervisión." };
  }
};

/**
 * Deletes a supervision permission.
 * @param {string} id - Permission ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteSupervision = async (id) => {
  try {
    await prisma.permiso_supervision.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting supervision:", error);
    return { success: false, error: "Error al eliminar el permiso de supervisión." };
  }
};

/**
 * Updates a supervision permission.
 * @param {string} id - ID.
 * @param {Object} data - Data.
 * @param {Object} currentUser - Authenticated user.
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const updateSupervision = async (id, data, currentUser) => {
    // Validate Area Permission
    if (data.area_id) {
      const policy = await validateSupervisionAssignment(data.area_id, currentUser);
      if (!policy.success) return policy;
    }

    try {
        const supervision = await prisma.permiso_supervision.update({
            where: { id },
            data
        });
        return { success: true, data: supervision };
    } catch (error) {
        console.error("Error updating supervision:", error);
        return { success: false, error: "Error al actualizar el permiso de supervisión." };
    }
}
