import prisma from "@/features/shared/lib/prisma";

export async function getAttendanceStats(where) {
  const [
    distinctUsers,
    totalPuntuales,
    totalLlegadasEvaluadas,
    totalTardias,
    totalFaltas,
    sumBruto,
    sumNeto,
    sumBrutoWhenNetoNull,
    sumDescuento,
    sumExtras,
    sumDebe,
    sumSaldo,
  ] = await Promise.all([
    prisma.resumen_diario.findMany({ where, distinct: ["usuario_id"], select: { usuario_id: true } }),
    prisma.resumen_diario.count({
      where: { AND: [where, { estado_excepcion_slug: null }, { llegada_slug: { equals: "llegada_puntual" } }] },
    }),
    prisma.resumen_diario.count({
      where: { AND: [where, { estado_excepcion_slug: null }, { llegada_slug: { in: ["llegada_puntual", "llegada_tardia"] } }] },
    }),
    prisma.resumen_diario.count({
      where: {
        AND: [
          where,
          { estado_excepcion_slug: null },
          { OR: [{ llegada_slug: { equals: "llegada_tardia" } }, { notificado_tardia: true }] },
        ],
      },
    }),
    prisma.resumen_diario.count({ where: { AND: [where, { estado: { equals: "falta" } }] } }),
    prisma.resumen_diario.aggregate({ where, _sum: { minutos_trabajados: true } }),
    prisma.resumen_diario.aggregate({ where, _sum: { minutos_trabajados_neto: true } }),
    prisma.resumen_diario.aggregate({ where: { ...where, minutos_trabajados_neto: null }, _sum: { minutos_trabajados: true } }),
    prisma.resumen_diario.aggregate({ where, _sum: { comedor_descuento_min: true } }),
    prisma.resumen_diario.aggregate({ where, _sum: { extras_informativas_min: true } }),
    prisma.resumen_diario.aggregate({ where, _sum: { minutos_debe: true } }),
    prisma.resumen_diario.aggregate({ where, _sum: { saldo_minutos: true } }),
  ]);

  const uniqueEmployees = distinctUsers?.length || 0;
  const totalMinutos = sumBruto?._sum?.minutos_trabajados || 0;
  const netoSum = sumNeto?._sum?.minutos_trabajados_neto || 0;
  const brutoWhenNetoNull = sumBrutoWhenNetoNull?._sum?.minutos_trabajados || 0;
  const totalMinutosNeto = netoSum + brutoWhenNetoNull;
  const totalDescuento = sumDescuento?._sum?.comedor_descuento_min || 0;
  const totalExtrasMin = sumExtras?._sum?.extras_informativas_min || 0;
  const totalDebeMin = sumDebe?._sum?.minutos_debe || 0;
  const totalSaldoMin = sumSaldo?._sum?.saldo_minutos || 0;
  const pctPuntualidad = totalLlegadasEvaluadas > 0 ? Math.round((totalPuntuales / totalLlegadasEvaluadas) * 100) : 0;

  return {
    uniqueEmployees,
    totalPuntuales,
    totalTardias,
    totalFaltas,
    pctPuntualidad,
    totalHoras: Math.round(totalMinutos / 60),
    totalHorasNeto: Math.round(totalMinutosNeto / 60),
    totalDescuento,
    totalHorasExtras: Math.round(totalExtrasMin / 60),
    totalHorasDebe: Math.round(totalDebeMin / 60),
    saldoHoras: Math.round(totalSaldoMin / 60),
  };
}

