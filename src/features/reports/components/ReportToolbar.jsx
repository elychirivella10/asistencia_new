"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, FileSpreadsheet, FileText, Search } from "lucide-react";
import { AsyncMultiSelect } from "@/components/shared/form/AsyncMultiSelect";
import { CustomMultiSelect } from "@/components/shared/form/CustomMultiSelect";
import { useReportToolbar } from "../hooks/useReportToolbar";
import { REPORT_CONFIG } from "../config/report.constants";

/**
 * Toolbar for report filtering and export actions.
 * Mirrors AttendanceToolbar structure exactly.
 *
 * @param {function} onFilter
 * @param {function} onExportExcel
 * @param {function} onExportPDF
 * @param {boolean}  hasData
 * @param {boolean}  isPending
 * @param {Array}    areas
 * @param {Object}   statusMap
 */
export function ReportToolbar({
  onFilter,
  onExportExcel,
  onExportPDF,
  hasData,
  isPending,
  areas = [],
  statusMap = {},
}) {
  const {
    fechaDesde, fechaHasta, areaId, searchTerm, status, llegada, salida, excepcion,
    setFechaDesde, setFechaHasta, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion,
    statusOptions, arrivalOptions, departureOptions, exceptionOptions,
    selectedArea, areasFetcher,
    handleFilter, handleReset,
  } = useReportToolbar({ onFilter, areas, statusMap });

  const { UI: { LABELS } } = REPORT_CONFIG;

  const selectFilters = [
    { label: 'Estado (Día)',             value: status,    onChange: setStatus,    options: statusOptions,    placeholder: 'Todos los Estados' },
    { label: 'Justificación/Excepción',  value: excepcion, onChange: setExcepcion, options: exceptionOptions, placeholder: 'Todas las Excepciones' },
    { label: 'Llegada',                  value: llegada,   onChange: setLlegada,   options: arrivalOptions,   placeholder: 'Todas las Llegadas' },
    { label: 'Salida',                   value: salida,    onChange: setSalida,    options: departureOptions,  placeholder: 'Todas las Salidas' },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4">
      {/* Row 1: Dates + Area + Status selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Desde</span>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Hasta</span>
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {areas.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Área</span>
            <AsyncMultiSelect
              value={areaId}
              onChange={setAreaId}
              fetcher={areasFetcher}
              placeholder="Todas las Áreas"
              getLabel={(o) => o.nombre}
              getValue={(o) => o.id}
              initialData={selectedArea}
              fetchOnOpen
              allowEmptyQuery
              initialQuery=""
              triggerClassName="h-9 bg-background/60 border-none hover:bg-background/70 focus-visible:ring-1 focus-visible:ring-ring"
              useFormControl={false}
            />
          </div>
        )}

        {selectFilters.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">{f.label}</span>
            <CustomMultiSelect
              value={f.value}
              onChange={f.onChange}
              options={f.options}
              placeholder={f.placeholder}
              triggerClassName="h-9 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
              useFormControl={false}
            />
          </div>
        ))}
      </div>

      {/* Row 2: Search + Export + Filter actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o cédula..."
            className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            disabled={!hasData || isPending}
            className="h-9 px-4 flex-1 md:flex-none"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {LABELS.EXPORT_EXCEL}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            disabled={!hasData || isPending}
            className="h-9 px-4 flex-1 md:flex-none"
          >
            <FileText className="mr-2 h-4 w-4" />
            {LABELS.EXPORT_PDF}
          </Button>

          <Button variant="secondary" onClick={handleReset} className="h-9 px-4 flex-1 md:flex-none">
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleFilter} disabled={isPending} className="h-9 px-4 flex-1 md:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            {isPending ? LABELS.LOADING : LABELS.FILTER_BUTTON}
          </Button>
        </div>
      </div>
    </div>
  );
}
