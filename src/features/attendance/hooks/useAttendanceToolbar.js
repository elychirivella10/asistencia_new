import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

const buildEventOptions = (statusMap, tipoEvento) => {
  const options = [];
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
  const [isPending, startTransition] = useTransition();
  
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  useEffect(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (!searchParams.get("from")) setFrom(todayStr);
    if (!searchParams.get("to")) setTo(todayStr);
  }, [searchParams]);
  const parseArrayParam = (param) => param ? param.split(',').filter(Boolean) : [];

  const [areaId, setAreaId] = useState(parseArrayParam(searchParams.get("areaId")));
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
  const [status, setStatus] = useState(parseArrayParam(searchParams.get("status")));
  const [llegada, setLlegada] = useState(parseArrayParam(searchParams.get("llegada")));
  const [salida, setSalida] = useState(parseArrayParam(searchParams.get("salida")));
  const [excepcion, setExcepcion] = useState(parseArrayParam(searchParams.get("excepcion")));

  const options = useMemo(() => {
    return {
      statusOptions: buildEventOptions(statusMap, "DIA"),
      arrivalOptions: buildEventOptions(statusMap, "LLEGADA"),
      departureOptions: buildEventOptions(statusMap, "SALIDA"),
      exceptionOptions: buildEventOptions(statusMap, "EXCEPCION"),
    };
  }, [statusMap]);

  const selectedArea = useMemo(() => {
    if (!areaId || areaId.length === 0) return [];
    return areas.filter((a) => areaId.includes(a.id));
  }, [areaId, areas]);

  const areasFetcher = async (query) => {
    const q = typeof query === "string" ? query.trim().toLowerCase() : "";
    if (!q) return areas;
    return areas.filter((area) => area.nombre.toLowerCase().includes(q));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (areaId.length > 0) params.set("areaId", areaId.join(","));
    if (searchTerm) params.set("searchTerm", searchTerm);
    if (status.length > 0) params.set("status", status.join(","));
    if (llegada.length > 0) params.set("llegada", llegada.join(","));
    if (salida.length > 0) params.set("salida", salida.join(","));
    if (excepcion.length > 0) params.set("excepcion", excepcion.join(","));
    params.set("page", "1");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleReset = () => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    setFrom(todayStr);
    setTo(todayStr);
    setAreaId([]);
    setSearchTerm("");
    setStatus([]);
    setLlegada([]);
    setSalida([]);
    setExcepcion([]);
    startTransition(() => {
      router.push("?");
    });
  };

  return {
    from, to, areaId, searchTerm, status, llegada, salida, excepcion,
    setFrom, setTo, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion,
    ...options,
    selectedArea,
    areasFetcher,
    handleSearch,
    handleReset,
    isPending,
  };
}
