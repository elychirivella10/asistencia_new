import prisma from "@/features/shared/lib/prisma";

/**
 * Función auxiliar para convertir "HH:mm" a Date de Prisma (1970-01-01) en UTC
 */
export const parseStringToTime = (timeStr) => {
  if (!timeStr) return null;
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
};

export async function createShift(data) {
  const { nombre, margen_tolerancia_min, dias_laborales, cruza_medianoche, hora_entrada, hora_salida } = data;

  const newShift = await prisma.turnos.create({
    data: {
      nombre,
      margen_tolerancia_min: parseInt(margen_tolerancia_min),
      dias_laborales: dias_laborales.map(Number),
      cruza_medianoche,
      hora_entrada: parseStringToTime(hora_entrada),
      hora_salida: parseStringToTime(hora_salida),
    }
  });

  return newShift;
}

export async function updateShift(id, data) {
  const { nombre, margen_tolerancia_min, dias_laborales, cruza_medianoche, hora_entrada, hora_salida } = data;

  const updatedShift = await prisma.turnos.update({
    where: { id },
    data: {
      nombre,
      margen_tolerancia_min: parseInt(margen_tolerancia_min),
      dias_laborales: dias_laborales.map(Number),
      cruza_medianoche,
      hora_entrada: parseStringToTime(hora_entrada),
      hora_salida: parseStringToTime(hora_salida),
    }
  });

  return updatedShift;
}

export async function deleteShift(id) {
  const usersCount = await prisma.usuarios.count({
    where: { turno_id: id }
  });

  if (usersCount > 0) {
    throw new Error(`No se puede eliminar. Hay ${usersCount} usuarios asignados a este turno.`);
  }

  return await prisma.turnos.delete({
    where: { id }
  });
}
