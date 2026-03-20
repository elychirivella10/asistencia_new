import prisma from "@/features/shared/lib/prisma";

/**
 * Validates if an incident exists and retrieves it.
 * Used for Update/Delete operations to ensure existence and get original data.
 * 
 * @param {string} id - Incident ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function validateIncidentExistence(id) {
  const incident = await prisma.novedades.findUnique({
    where: { id },
  });

  if (!incident) {
    return { success: false, error: "La novedad seleccionada no existe." };
  }

  return { success: true, data: incident };
}

/**
 * Validates user existence for creating incidents.
 * 
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateIncidentUser(userId) {
  const user = await prisma.usuarios.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    return { success: false, error: "El usuario seleccionado no existe." };
  }

  return { success: true };
}
