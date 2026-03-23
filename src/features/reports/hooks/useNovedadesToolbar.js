import { useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { REPORT_CONFIG } from "../config/report.constants";

const { ALL } = REPORT_CONFIG.FILTERS;

/**
 * Manages the specific filters for the Novedades Report.
 */
export function useNovedadesToolbar({ onFilter, areas = [], tiposPermiso = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const firstDayOfMonth = format(new Date(new Date().setDate(1)), 'yyyy-MM-dd');

  const [fechaDesde, setFechaDesde] = useState(firstDayOfMonth);
  const [fechaHasta, setFechaHasta] = useState(today);
  
  const [areaId, setAreaId] = useState(ALL);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Novedades specific filters
  const [status, setStatus] = useState(ALL);           // APROBADO, PENDIENTE, RECHAZADO, all
  const [tipoPermisoId, setTipoPermisoId] = useState(ALL);

  // Mapped options for CustomFormSelect
  const statusOptions = useMemo(() => [
    { value: ALL, label: 'Todos los Estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'ANULADO', label: 'Anulado' },
  ], []);

  const tiposPermisoOptions = useMemo(() => {
    return [
      { value: ALL, label: 'Cualquier Permiso' },
      ...tiposPermiso.map(tp => ({ value: String(tp.id), label: tp.nombre }))
    ];
  }, [tiposPermiso]);

  // AsyncSelect helpers for Area
  const selectedArea = useMemo(() => {
    if (areaId === ALL) return { id: ALL, nombre: 'Todas las Áreas' };
    return areas.find((a) => String(a.id) === String(areaId)) ?? null;
  }, [areaId, areas]);

  const areasFetcher = useCallback(async (query) => {
    const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
    const allOption = { id: ALL, nombre: 'Todas las Áreas' };
    if (!q) return [allOption, ...areas];
    return [allOption, ...areas.filter((a) => a.nombre.toLowerCase().includes(q))];
  }, [areas]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (areaId && areaId !== ALL) count++;
    if (searchTerm) count++;
    if (status !== ALL) count++;
    if (tipoPermisoId !== ALL) count++;
    return count;
  }, [areaId, searchTerm, status, tipoPermisoId]);

  const handleApplyFilters = () => {
    if (!fechaDesde || !fechaHasta) return;
    
    onFilter({
      fechaDesde,
      fechaHasta,
      areaId: areaId !== ALL ? areaId : undefined,
      searchTerm: searchTerm || undefined,
      status: status !== ALL ? status : undefined,
      tipoPermisoId: tipoPermisoId !== ALL ? tipoPermisoId : undefined
    });
  };

  const handleClearFilters = () => {
    setAreaId(ALL);
    setSearchTerm("");
    setStatus(ALL);
    setTipoPermisoId(ALL);
    const today = format(new Date(), 'yyyy-MM-dd');
    setFechaDesde(today);
    setFechaHasta(today);
    
    onFilter({
      fechaDesde: today,
      fechaHasta: today,
      areaId: undefined,
      searchTerm: undefined,
      status: undefined,
      tipoPermisoId: undefined
    });
  };

  return {
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    areaId,
    setAreaId,
    searchTerm,
    setSearchTerm,
    status,
    setStatus,
    tipoPermisoId,
    setTipoPermisoId,
    activeFilterCount,
    statusOptions,
    tiposPermisoOptions,
    selectedArea,
    areasFetcher,
    handleApplyFilters,
    handleClearFilters,
  };
}
