"use client";

import { useMemo, useState } from "react";
import { REPORT_CONFIG } from "../config/report.constants";

const { ALL } = REPORT_CONFIG.FILTERS;

const buildEventOptions = (statusMap, tipoEvento, allLabel) => {
  const options = [{ value: ALL, label: allLabel }];
  Object.entries(statusMap || {}).forEach(([key, val]) => {
    if (tipoEvento === 'DIA') {
      if (val.tipo_evento === 'DIA' || !val.tipo_evento) options.push({ value: key, label: val.label });
      return;
    }
    if (val.tipo_evento === tipoEvento) options.push({ value: key, label: val.label });
  });
  return options;
};

/**
 * Manages all filter states for the report toolbar.
 * Mirrors useAttendanceToolbar — no react-hook-form.
 *
 * @param {function} onFilter - Receives the full filters object on Filtrar / Limpiar
 * @param {Array}    areas
 * @param {Object}   statusMap
 */
export function useReportToolbar({ onFilter, areas = [], statusMap = {} }) {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(firstDayOfMonth);
  const [fechaHasta, setFechaHasta] = useState(today);
  const [areaId, setAreaId] = useState(ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState(ALL);
  const [llegada, setLlegada] = useState(ALL);
  const [salida, setSalida] = useState(ALL);
  const [excepcion, setExcepcion] = useState(ALL);

  const options = useMemo(() => ({
    statusOptions:    buildEventOptions(statusMap, 'DIA',       'Todos los Estados'),
    arrivalOptions:   buildEventOptions(statusMap, 'LLEGADA',   'Todas las Llegadas'),
    departureOptions: buildEventOptions(statusMap, 'SALIDA',    'Todas las Salidas'),
    exceptionOptions: buildEventOptions(statusMap, 'EXCEPCION', 'Todas las Excepciones'),
  }), [statusMap]);

  const selectedArea = useMemo(() => {
    if (areaId === ALL) return { id: ALL, nombre: 'Todas las Áreas' };
    return areas.find((a) => a.id === areaId) ?? null;
  }, [areaId, areas]);

  const areasFetcher = async (query) => {
    const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
    const allOption = { id: ALL, nombre: 'Todas las Áreas' };
    if (!q) return [allOption, ...areas];
    return [allOption, ...areas.filter((a) => a.nombre.toLowerCase().includes(q))];
  };

  const buildFilters = () => ({
    fechaDesde,
    fechaHasta,
    areaId:     areaId !== ALL ? areaId : undefined,
    searchTerm: searchTerm || undefined,
    status:     status !== ALL ? status : undefined,
    llegada:    llegada !== ALL ? llegada : undefined,
    salida:     salida !== ALL ? salida : undefined,
    excepcion:  excepcion !== ALL ? excepcion : undefined,
  });

  const handleFilter = () => {
    if (!fechaDesde || !fechaHasta) return;
    onFilter(buildFilters());
  };

  const handleReset = () => {
    setAreaId(ALL); setSearchTerm(''); setStatus(ALL);
    setLlegada(ALL); setSalida(ALL); setExcepcion(ALL);
    onFilter({ fechaDesde, fechaHasta });
  };

  return {
    fechaDesde, fechaHasta, areaId, searchTerm, status, llegada, salida, excepcion,
    setFechaDesde, setFechaHasta, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion,
    ...options, selectedArea, areasFetcher,
    handleFilter, handleReset,
  };
}
