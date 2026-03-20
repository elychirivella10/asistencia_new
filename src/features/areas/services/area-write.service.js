import prisma from "@/lib/prisma";
import { validateAreaDeletion } from "./area-validation.service";

/**
 * Creates a new area.
 * @param {Object} data - Area data.
 * @returns {Promise<{success: boolean, data?: Object}>} Created area result.
 */
export const createArea = async (data) => {
  const area = await prisma.areas.create({
    data
  });
  return { success: true, data: area };
};

/**
 * Updates an existing area.
 * @param {string} id - Area ID.
 * @param {Object} data - Updated data.
 * @returns {Promise<{success: boolean, data?: Object}>} Updated area result.
 */
export const updateArea = async (id, data) => {
  const area = await prisma.areas.update({
    where: { id },
    data
  });
  return { success: true, data: area };
};

/**
 * Deletes an area, validating dependencies first.
 * @param {string} id - Area ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteArea = async (id) => {
  // Validate before deleting
  const validation = await validateAreaDeletion(id);
  if (!validation.success) {
    return validation;
  }

  await prisma.areas.delete({
    where: { id }
  });

  return { success: true };
};
