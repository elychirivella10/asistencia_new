"use client";

import { useMemo } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsyncMultiSelect } from "@/components/shared/form/AsyncMultiSelect";
import { CustomMultiSelect } from "@/components/shared/form/CustomMultiSelect";
import { useAttendanceToolbar } from "../hooks/useAttendanceToolbar";
import { Toolbar } from "@/components/shared/Toolbar";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

export function AttendanceToolbar({ 
  areas = [],
  statusMap = {}
}) {
  const {
    from,
    setFrom,
    to,
    setTo,
    areaId,
    setAreaId,
    searchTerm,
    setSearchTerm,
    status,
    setStatus,
    excepcion,
    setExcepcion,
    llegada,
    setLlegada,
    salida,
    setSalida,
    statusOptions,
    exceptionOptions,
    arrivalOptions,
    departureOptions,
    selectedArea,
    areasFetcher,
    handleSearch,
    handleReset,
    isPending
  } = useAttendanceToolbar({ areas, statusMap });

  const { UI: { LABELS } } = ATTENDANCE_CONFIG;

  const selectFilters = useMemo(() => [
    { key: "status",    label: LABELS.TOOLBAR.STATUS,    value: status,    onChange: setStatus,    options: statusOptions,    placeholder: LABELS.TOOLBAR.STATUS_PLACEHOLDER },
    { key: "excepcion", label: LABELS.TOOLBAR.EXCEPTION, value: excepcion, onChange: setExcepcion, options: exceptionOptions, placeholder: LABELS.TOOLBAR.EXCEPTION_PLACEHOLDER },
    { key: "llegada",   label: LABELS.TOOLBAR.ARRIVAL,   value: llegada,   onChange: setLlegada,   options: arrivalOptions,   placeholder: LABELS.TOOLBAR.ARRIVAL_PLACEHOLDER },
    { key: "salida",    label: LABELS.TOOLBAR.DEPARTURE, value: salida,    onChange: setSalida,    options: departureOptions, placeholder: LABELS.TOOLBAR.DEPARTURE_PLACEHOLDER },
  ], [status, setStatus, statusOptions, excepcion, setExcepcion, exceptionOptions, llegada, setLlegada, arrivalOptions, salida, setSalida, departureOptions, LABELS]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Toolbar.FilterItem label={LABELS.TOOLBAR.FROM} width="100%">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" />
          </Toolbar.FilterItem>
          
          <Toolbar.FilterItem label={LABELS.TOOLBAR.TO} width="100%">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" />
          </Toolbar.FilterItem>

          {areas.length > 0 && (
            <Toolbar.FilterItem label={LABELS.TOOLBAR.AREA} width="100%">
              <AsyncMultiSelect
                value={areaId}
                onChange={setAreaId}
                fetcher={areasFetcher}
                placeholder={LABELS.TOOLBAR.AREA_PLACEHOLDER}
                getLabel={(option) => option.nombre}
                getValue={(option) => option.id}
                initialData={selectedArea}
                fetchOnOpen
                allowEmptyQuery
                initialQuery=""
                triggerClassName="h-9 bg-background/60 border-none hover:bg-background/70 focus-visible:ring-1 focus-visible:ring-ring"
                useFormControl={false}
              />
            </Toolbar.FilterItem>
          )}

          {selectFilters.map((f) => (
            <Toolbar.FilterItem key={f.key} label={f.label} width="100%">
              <CustomMultiSelect 
                value={f.value} 
                onChange={f.onChange} 
                options={f.options} 
                placeholder={f.placeholder} 
                triggerClassName="h-9 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" 
                useFormControl={false} 
              />
            </Toolbar.FilterItem>
          ))}
        </Toolbar.Filters>
      </Toolbar.Main>

      <Toolbar.Footer>
        <Toolbar.Search 
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.SEARCH_PLACEHOLDER} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          <Button variant="secondary" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{LABELS.CLEAN_BUTTON}</span>
          </Button>
          <Button onClick={handleSearch} disabled={isPending} className="gap-2">
            <Filter className="h-4 w-4" />
            <span>{isPending ? LABELS.FILTER_LOADING : LABELS.FILTER_BUTTON}</span>
          </Button>
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
