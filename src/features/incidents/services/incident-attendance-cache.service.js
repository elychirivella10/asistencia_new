import { eachDayOfInterval } from "date-fns";

export async function invalidateAttendanceCache(tx, userId, startDate, endDate, reason) {
  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
  await tx.resumen_diario.updateMany({
    where: { usuario_id: userId, fecha: { in: days } },
    data: { last_processed_at: null, observaciones: reason },
  });
}

