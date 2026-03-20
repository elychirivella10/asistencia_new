import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

const buildEventOptions = (statusMap, tipoEvento, allLabel) => {
  const options = [{ value: ATTENDANCE_CONFIG.FILTERS.ALL, label: allLabel }];
  Object.entries(statusMap || {}).forEach(([key, val]) => {
    if (tipoEvento === "DIA") {
      if (val.tipo_evento === "DIA" || !val.tipo_evento) options.push({ value: key, label: val.label });
      return;
    }
    if (val.tipo_evento === tipoEvento) options.push({ value: key, label: val.label });
  });
  return options;
};

export function useAttendanceToolbar({ areas = [], statusMap = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [areaId, setAreaId] = useState(searchParams.get("areaId") || ATTENDANCE_CONFIG.FILTERS.ALL);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
  const [status, setStatus] = useState(searchParams.get("status") || ATTENDANCE_CONFIG.FILTERS.ALL);
  const [llegada, setLlegada] = useState(searchParams.get("llegada") || ATTENDANCE_CONFIG.FILTERS.ALL);
  const [salida, setSalida] = useState(searchParams.get("salida") || ATTENDANCE_CONFIG.FILTERS.ALL);
  const [excepcion, setExcepcion] = useState(searchParams.get("excepcion") || ATTENDANCE_CONFIG.FILTERS.ALL);
  const options = useMemo(() => {
    return {
      statusOptions: buildEventOptions(statusMap, "DIA", "Todos los Estados (Día)"),
      arrivalOptions: buildEventOptions(statusMap, "LLEGADA", "Todas las Llegadas"),
      departureOptions: buildEventOptions(statusMap, "SALIDA", "Todas las Salidas"),
      exceptionOptions: buildEventOptions(statusMap, "EXCEPCION", "Todas las Excepciones"),
    };
  }, [statusMap]);

  const selectedArea = useMemo(() => {
    if (areaId === ATTENDANCE_CONFIG.FILTERS.ALL) return { id: ATTENDANCE_CONFIG.FILTERS.ALL, nombre: "Todas las Áreas" };
    if (!areaId) return null;
    return areas.find((a) => a.id === areaId);
  }, [areaId, areas]);

  const areasFetcher = async (query) => {
    const q = typeof query === "string" ? query.trim().toLowerCase() : "";
    const allOption = { id: ATTENDANCE_CONFIG.FILTERS.ALL, nombre: "Todas las Áreas" };
    if (!q) return [allOption, ...areas];
    return [allOption, ...areas.filter((area) => area.nombre.toLowerCase().includes(q))];
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (areaId && areaId !== ATTENDANCE_CONFIG.FILTERS.ALL) params.set("areaId", areaId);
    if (searchTerm) params.set("searchTerm", searchTerm);
    if (status && status !== ATTENDANCE_CONFIG.FILTERS.ALL) params.set("status", status);
    if (llegada && llegada !== ATTENDANCE_CONFIG.FILTERS.ALL) params.set("llegada", llegada);
    if (salida && salida !== ATTENDANCE_CONFIG.FILTERS.ALL) params.set("salida", salida);
    if (excepcion && excepcion !== ATTENDANCE_CONFIG.FILTERS.ALL) params.set("excepcion", excepcion);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setAreaId(ATTENDANCE_CONFIG.FILTERS.ALL);
    setSearchTerm("");
    setStatus(ATTENDANCE_CONFIG.FILTERS.ALL);
    setLlegada(ATTENDANCE_CONFIG.FILTERS.ALL);
    setSalida(ATTENDANCE_CONFIG.FILTERS.ALL);
    setExcepcion(ATTENDANCE_CONFIG.FILTERS.ALL);
    router.push("?");
  };

  return {
    from, to, areaId, searchTerm, status, llegada, salida, excepcion,
    setFrom, setTo, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion,
    ...options,
    selectedArea,
    areasFetcher,
    handleSearch,
    handleReset,
  };
}
