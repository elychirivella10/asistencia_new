import prisma from "@/lib/prisma";

/**
 * Validates user uniqueness (ID card and email).
 * 
 * @param {string} cedula - User ID card
 * @param {string} email - User email
 * @param {string|null} current_id - User ID if editing
 * @returns {Promise<{success: boolean, error?: string, details?: Object}>}
 */
export async function validateUserUniqueness(cedula, email, current_id) {
  const whereUnique = {
    OR: [{ cedula }, { email }],
    NOT: current_id ? { id: current_id } : undefined,
  };

  const existing = await prisma.usuarios.findFirst({
    where: whereUnique,
    select: { id: true, cedula: true, email: true },
  });

  if (existing) {
    if (existing.cedula === cedula) {
      return { 
        success: false, 
        error: "La cédula ya está registrada.",
        details: { cedula: ["La cédula ya está registrada."] }
      };
    }
    if (existing.email === email) {
      return { 
        success: false, 
        error: "El email ya está registrado.",
        details: { email: ["El email ya está registrado."] }
      };
    }
  }

  return { success: true };
}

/**
 * Verifies if a user can be deleted.
 * 
 * @param {string} id - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateUserDeletion(id) {
    // Validate if it has punch records
    const marcajes = await prisma.marcajes.count({
      where: { usuario_id: id }
    });

    if (marcajes > 0) {
        return { success: false, error: "No se puede eliminar: El usuario tiene marcajes asociados. Intenta inactivarlo." };
    }

    // Validate if is area boss
    const jefeDe = await prisma.areas.count({
        where: { jefe_id: id }
    });

    if (jefeDe > 0) {
        return { success: false, error: "No se puede eliminar: El usuario es jefe de una o más áreas." };
    }

    return { success: true };
}
