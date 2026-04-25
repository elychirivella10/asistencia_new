"use client";

import { useEffect, useMemo } from "react";
import { Filter, X, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsyncMultiSelect } from "@/components/shared/form/AsyncMultiSelect";
import { CustomMultiSelect } from "@/components/shared/form/CustomMultiSelect";
import { useAttendanceReportToolbar } from "../hooks/useAttendanceReportToolbar";
import { Toolbar } from "@/components/shared/Toolbar";
import { REPORT_CONFIG } from "../config/report.constants";

/**
 * Filter bar exclusively tailored for the Attendance Report.
 */
export function AttendanceReportToolbar({ 
  onFilter, 
  onExportExcel, 
  onExportPDF, 
  isPending, 
  hasData,
  areas = [],
  statusMap = {}
}) {
  const {
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
    handleReset
  } = useAttendanceReportToolbar({ onFilter, areas, statusMap });

  const { UI: { LABELS: { TOOLBAR } } } = REPORT_CONFIG;

  // Load initial data silently on mount
  useEffect(() => { handleSearch(); }, []); 

  const selectFilters = useMemo(() => [
    { key: "status", label: TOOLBAR.FILTERS.ESTADO_DIA, value: status, onChange: setStatus, options: statusOptions, placeholder: TOOLBAR.PLACEHOLDERS.ALL_STATES },
    { key: "excepcion", label: TOOLBAR.FILTERS.JUSTIFICACION, value: excepcion, onChange: setExcepcion, options: exceptionOptions, placeholder: TOOLBAR.PLACEHOLDERS.ALL_EXCEPTIONS },
    { key: "llegada",   label: TOOLBAR.FILTERS.LLEGADA,   value: llegada,   onChange: setLlegada,   options: arrivalOptions,   placeholder: TOOLBAR.PLACEHOLDERS.ALL_ARRIVALS },
    { key: "salida",    label: TOOLBAR.FILTERS.SALIDA,    value: salida,    onChange: setSalida,    options: departureOptions, placeholder: TOOLBAR.PLACEHOLDERS.ALL_DEPARTURES },
  ], [status, setStatus, statusOptions, excepcion, setExcepcion, exceptionOptions, llegada, setLlegada, arrivalOptions, salida, setSalida, departureOptions, TOOLBAR]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Toolbar.FilterItem label={TOOLBAR.FILTERS.DATE_FROM} width="100%">
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Toolbar.FilterItem>

          <Toolbar.FilterItem label={TOOLBAR.FILTERS.DATE_TO} width="100%">
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Toolbar.FilterItem>

          {areas.length > 0 && (
            <Toolbar.FilterItem label={TOOLBAR.FILTERS.AREA} width="100%">
              <AsyncMultiSelect
                value={areaId}
                onChange={setAreaId}
                fetcher={areasFetcher}
                placeholder={TOOLBAR.PLACEHOLDERS.ALL_AREAS}
                getLabel={(o) => o.nombre}
                getValue={(o) => o.id}
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
          label={TOOLBAR.FILTERS.SEARCH_LABEL}
          placeholder={TOOLBAR.PLACEHOLDERS.SEARCH_REPORTS}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <Toolbar.Actions label={TOOLBAR.FILTERS.DIVIDER_ACTIONS}>
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={!hasData || isPending}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{REPORT_CONFIG.UI.LABELS.EXPORT_EXCEL}</span>
          </Button>
          <Button
            variant="outline"
            onClick={onExportPDF}
            disabled={!hasData || isPending}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>{REPORT_CONFIG.UI.LABELS.EXPORT_PDF}</span>
          </Button>

          <Button variant="secondary" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{REPORT_CONFIG.UI.LABELS.CLEAN_BUTTON}</span>
          </Button>
          <Button onClick={handleSearch} disabled={isPending || !fechaDesde || !fechaHasta} className="gap-2">
            <Filter className="h-4 w-4" />
            <span>{isPending ? REPORT_CONFIG.UI.LABELS.LOADING : REPORT_CONFIG.UI.LABELS.FILTER_BUTTON}</span>
          </Button>
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
