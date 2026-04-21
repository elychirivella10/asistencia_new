import prisma from "@/features/shared/lib/prisma";

/**
 * Función auxiliar para formatear Date a string "HH:mm"
 */
export const formatTimeToString = (date) => {
  if (!date) return "";
  // Como Prisma trae un objeto Date, extraemos la hora usando UTC
  // ya que asimilaremos que se guarda como 1970-01-01T[HH]:[mm]:00.000Z
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export async function getShifts() {
  const data = await prisma.turnos.findMany({
    orderBy: { nombre: "asc" }
  });

  return data.map(turno => ({
    ...turno,
    // Pre-formateamos la hora para la UI para evitar problemas de hidratación en Server Components
    hora_entrada: formatTimeToString(turno.hora_entrada),
    hora_salida: formatTimeToString(turno.hora_salida)
  }));
}

export async function getShiftById(id) {
  if (!id) return null;
  
  const turno = await prisma.turnos.findUnique({
    where: { id }
  });

  if (!turno) return null;

  return {
    ...turno,
    hora_entrada: formatTimeToString(turno.hora_entrada),
    hora_salida: formatTimeToString(turno.hora_salida)
  };
}
