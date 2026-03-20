"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { Search, X, Filter } from "lucide-react";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { useAttendanceToolbar } from "../hooks/useAttendanceToolbar";

export function AttendanceToolbar({ areas = [], statusMap = {} }) {
  const { from, to, areaId, searchTerm, status, llegada, salida, excepcion, setFrom, setTo, setAreaId, setSearchTerm, setStatus, setLlegada, setSalida, setExcepcion, statusOptions, arrivalOptions, departureOptions, exceptionOptions, selectedArea, areasFetcher, handleSearch, handleReset } =
    useAttendanceToolbar({ areas, statusMap });

  const selectFilters = [
    { label: "Estado (Día)", value: status, onChange: setStatus, options: statusOptions, placeholder: "Todos los Estados" },
    { label: "Justificación/Excepción", value: excepcion, onChange: setExcepcion, options: exceptionOptions, placeholder: "Todas las Excepciones" },
    { label: "Llegada", value: llegada, onChange: setLlegada, options: arrivalOptions, placeholder: "Todas las Llegadas" },
    { label: "Salida", value: salida, onChange: setSalida, options: departureOptions, placeholder: "Todas las Salidas" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Desde</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Hasta</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        {areas.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Área</span>
            <AsyncSelect
              value={areaId}
              onChange={setAreaId}
              fetcher={areasFetcher}
              placeholder="Todas las Áreas"
              getLabel={(option) => option.nombre}
              getValue={(option) => option.id}
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
            <CustomFormSelect value={f.value} onChange={f.onChange} options={f.options} placeholder={f.placeholder} triggerClassName="h-9 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" useFormControl={false} />
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, apellido o cédula..." className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" onClick={handleReset} className="h-9 px-4 flex-1 md:flex-none">
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleSearch} className="h-9 px-4 flex-1 md:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  );
}
