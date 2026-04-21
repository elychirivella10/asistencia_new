import prisma from "@/features/shared/lib/prisma";

/**
 * Retrieves all available system permissions from the database.
 * @returns {Promise<Array>} List of system permissions.
 */
export const getAllSystemPermissions = async () => {
  try {
    return await prisma.permisos_sistema.findMany({
      orderBy: {
        slug: "asc",
      },
      select: {
        id: true,
        slug: true,
        descripcion: true,
      },
    });
  } catch (error) {
    console.error("Error fetching system permissions:", error);
    throw error;
  }
};
