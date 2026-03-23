import prisma from "@/features/shared/lib/prisma";

export async function getAttendanceStats(where) {
  // Fetch minimal required fields to compute stats in memory
  // This reduces 12 distinct database aggregation queries to exactly 1 targeted query
  const records = await prisma.resumen_diario.findMany({
    where,
    select: {
      usuario_id: true,
      estado_excepcion_slug: true,
      llegada_slug: true,
      notificado_tardia: true,
      estado: true,
      minutos_trabajados: true,
      minutos_trabajados_neto: true,
      comedor_descuento_min: true,
      extras_informativas_min: true,
      minutos_debe: true,
      saldo_minutos: true
    }
  });

  const rStats = records.reduce((acc, r) => {
    acc.uniqueUsr.add(r.usuario_id);
    
    const isPuntual = r.llegada_slug === "llegada_puntual";
    const isTardia = r.llegada_slug === "llegada_tardia";
    
    if (!r.estado_excepcion_slug) {
      if (isPuntual) acc.totalPuntuales++;
      if (isPuntual || isTardia) acc.totalLlegadasEvaluadas++;
      if (isTardia || r.notificado_tardia) acc.totalTardias++;
    }
    
    if (r.estado === "falta") acc.totalFaltas++;
    
    acc.sumBruto += r.minutos_trabajados || 0;
    acc.sumNeto += r.minutos_trabajados_neto || 0;
    if (r.minutos_trabajados_neto == null) acc.sumBrutoWhenNetoNull += (r.minutos_trabajados || 0);
    
    acc.sumDescuento += r.comedor_descuento_min || 0;
    acc.sumExtras += r.extras_informativas_min || 0;
    acc.sumDebe += r.minutos_debe || 0;
    acc.sumSaldo += r.saldo_minutos || 0;
    
    return acc;
  }, {
    uniqueUsr: new Set(),
    totalPuntuales: 0,
    totalLlegadasEvaluadas: 0,
    totalTardias: 0,
    totalFaltas: 0,
    sumBruto: 0,
    sumNeto: 0,
    sumBrutoWhenNetoNull: 0,
    sumDescuento: 0,
    sumExtras: 0,
    sumDebe: 0,
    sumSaldo: 0
  });

  const totalMinutosNeto = rStats.sumNeto + rStats.sumBrutoWhenNetoNull;
  const pctPuntualidad = rStats.totalLlegadasEvaluadas > 0 ? Math.round((rStats.totalPuntuales / rStats.totalLlegadasEvaluadas) * 100) : 0;

  return {
    uniqueEmployees: rStats.uniqueUsr.size,
    totalPuntuales: rStats.totalPuntuales,
    totalTardias: rStats.totalTardias,
    totalFaltas: rStats.totalFaltas,
    pctPuntualidad,
    totalHoras: Math.round(rStats.sumBruto / 60),
    totalHorasNeto: Math.round(totalMinutosNeto / 60),
    totalDescuento: rStats.sumDescuento,
    totalHorasExtras: Math.round(rStats.sumExtras / 60),
    totalHorasDebe: Math.round(rStats.sumDebe / 60),
    saldoHoras: Math.round(rStats.sumSaldo / 60),
  };
}

