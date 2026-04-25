import { useMemo, useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { REPORT_CONFIG } from "../config/report.constants";

const { ALL } = REPORT_CONFIG.FILTERS;

/**
 * Manages the specific filters for the Novedades Report.
 */
export function useNovedadesReportToolbar({ onFilter, areas = [], tiposPermiso = [] }) {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const todayVal = format(new Date(), 'yyyy-MM-dd');
    const firstDayVal = format(new Date(new Date().setDate(1)), 'yyyy-MM-dd');
    setFechaDesde((prev) => prev || firstDayVal);
    setFechaHasta((prev) => prev || todayVal);
  }, []);
  
  const [areaId, setAreaId] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Novedades specific filters (Multi-select)
  const [status, setStatus] = useState([]);
  const [tipoPermisoId, setTipoPermisoId] = useState([]);

  // Mapped options for CustomMultiSelect
  const statusOptions = useMemo(() => [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'ANULADO', label: 'Anulado' },
  ], []);

  const tiposPermisoOptions = useMemo(() => {
    return tiposPermiso.map(tp => ({ value: String(tp.id), label: tp.nombre }));
  }, [tiposPermiso]);

  // AsyncMultiSelect helpers for Area
  const selectedArea = useMemo(() => {
    return areas.filter((a) => areaId.includes(String(a.id)));
  }, [areaId, areas]);

  const areasFetcher = useCallback(async (query) => {
    const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
    if (!q) return areas;
    return areas.filter((a) => a.nombre?.toLowerCase().includes(q));
  }, [areas]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (areaId.length > 0) count++;
    if (searchTerm) count++;
    if (status.length > 0) count++;
    if (tipoPermisoId.length > 0) count++;
    return count;
  }, [areaId, searchTerm, status, tipoPermisoId]);

  const handleSearch = () => {
    if (!fechaDesde || !fechaHasta) return;
    
    onFilter({
      fechaDesde,
      fechaHasta,
      areaId: areaId.length > 0 ? areaId : undefined,
      searchTerm: searchTerm || undefined,
      status: status.length > 0 ? status : undefined,
      tipoPermisoId: tipoPermisoId.length > 0 ? tipoPermisoId : undefined
    });
  };

  const handleReset = () => {
    setAreaId([]);
    setSearchTerm("");
    setStatus([]);
    setTipoPermisoId([]);
    
    // We preserve current dates for better UX (Gap #3 alignment)
    onFilter({
      fechaDesde,
      fechaHasta,
      areaId: undefined,
      searchTerm: undefined,
      status: undefined,
      tipoPermisoId: undefined
    });
  };

  return {
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    areaId, setAreaId,
    searchTerm, setSearchTerm,
    status, setStatus,
    tipoPermisoId, setTipoPermisoId,
    activeFilterCount,
    statusOptions,
    tiposPermisoOptions,
    selectedArea,
    areasFetcher,
    handleSearch,
    handleReset,
  };
}
