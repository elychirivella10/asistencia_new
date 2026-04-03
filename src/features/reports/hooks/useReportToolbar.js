"use client";

import { useMemo, useState, useEffect } from "react";
import { REPORT_CONFIG } from "../config/report.constants";

const { ALL } = REPORT_CONFIG.FILTERS;

const buildEventOptions = (statusMap, tipoEvento) => {
  const options = [];
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
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const todayVal = new Date().toISOString().split('T')[0];
    const firstDayVal = new Date(new Date().setDate(1)).toISOString().split('T')[0];
    setFechaDesde((prev) => prev || firstDayVal);
    setFechaHasta((prev) => prev || todayVal);
  }, []);
  const [areaId, setAreaId] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState([]);
  const [llegada, setLlegada] = useState([]);
  const [salida, setSalida] = useState([]);
  const [excepcion, setExcepcion] = useState([]);

  const options = useMemo(() => ({
    statusOptions:    buildEventOptions(statusMap, 'DIA'),
    arrivalOptions:   buildEventOptions(statusMap, 'LLEGADA'),
    departureOptions: buildEventOptions(statusMap, 'SALIDA'),
    exceptionOptions: buildEventOptions(statusMap, 'EXCEPCION'),
  }), [statusMap]);

  const selectedArea = useMemo(() => {
    if (!areaId || areaId.length === 0) return [];
    return areas.filter((a) => areaId.includes(a.id));
  }, [areaId, areas]);

  const areasFetcher = async (query) => {
    const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
    if (!q) return areas;
    return areas.filter((a) => a.nombre.toLowerCase().includes(q));
  };

  const buildFilters = () => ({
    fechaDesde,
    fechaHasta,
    areaId:     areaId?.length > 0 ? areaId : undefined,
    searchTerm: searchTerm || undefined,
    status:     status?.length > 0 ? status : undefined,
    llegada:    llegada?.length > 0 ? llegada : undefined,
    salida:     salida?.length > 0 ? salida : undefined,
    excepcion:  excepcion?.length > 0 ? excepcion : undefined,
  });

  const handleFilter = () => {
    if (!fechaDesde || !fechaHasta) return;
    onFilter(buildFilters());
  };

  const handleReset = () => {
    setAreaId([]); setSearchTerm(''); setStatus([]);
    setLlegada([]); setSalida([]); setExcepcion([]);
    onFilter({ fechaDesde, fechaHasta });
  };

  return {
    fechaDesde, fechaHasta, areaId, searchTerm, status, llegada, salida, excepcion,
    setFechaDesde, setFechaHasta, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion,
    ...options, selectedArea, areasFetcher,
    handleFilter, handleReset,
  };
}
