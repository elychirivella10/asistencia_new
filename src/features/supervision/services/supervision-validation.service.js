import prisma from "@/features/shared/lib/prisma";

/**
 * Validates if a supervision permission can be created (check duplicates).
 * @param {string} usuario_id
 * @param {string} area_id
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const validateSupervisionUniqueness = async (usuario_id, area_id) => {
  const existing = await prisma.permiso_supervision.findFirst({
    where: {
      usuario_id,
      area_id
    }
  });

  if (existing) {
    return { 
      success: false, 
      error: "Este usuario ya tiene permisos de supervisión sobre esta área.",
      details: { area_id: ["El usuario ya supervisa esta área."] }
    };
  }

  return { success: true };
};
