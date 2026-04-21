export function buildAttendanceOrderBy(sortKey, sortDirection) {
  const direction = sortDirection === "desc" ? "desc" : "asc";
  const allowed = new Set([
    "fecha",
    "usuario.nombre",
    "usuario.area.nombre",
    "minutos_trabajados",
    "extras_informativas_min",
    "minutos_esperados",
    "minutos_debe",
    "saldo_minutos",
    "minutos_trabajados_neto",
    "comedor_descuento_min",
    "hora_entrada",
    "hora_salida",
    "estado",
  ]);

  if (!sortKey || !allowed.has(sortKey)) return [{ fecha: "desc" }];

  if (sortKey === "usuario.nombre") return [{ usuario: { nombre: direction } }, { fecha: "desc" }];

  if (sortKey === "usuario.area.nombre") {
    return [{ usuario: { area: { nombre: direction } } }, { fecha: "desc" }];
  }

  return [{ [sortKey]: direction }, { fecha: "desc" }];
}

