export function buildAttendanceOrderBy(sortKey, sortDirection) {
  const direction = sortDirection === "desc" ? "desc" : "asc";
  const allowed = new Set([
    "fecha",
    "usuarios.nombre",
    "usuarios.areas_pertenece.nombre",
    "minutos_trabajados",
    "extras_informativas_min",
    "minutos_esperados",
    "minutos_debe",
    "saldo_minutos",
    "minutos_trabajados_neto",
    "comedor_descuento_min",
  ]);

  if (!sortKey || !allowed.has(sortKey)) return [{ fecha: "desc" }];

  if (sortKey === "usuarios.nombre") return [{ usuarios: { nombre: direction } }, { fecha: "desc" }];

  if (sortKey === "usuarios.areas_pertenece.nombre") {
    return [{ usuarios: { areas_pertenece: { nombre: direction } } }, { fecha: "desc" }];
  }

  return [{ [sortKey]: direction }, { fecha: "desc" }];
}

