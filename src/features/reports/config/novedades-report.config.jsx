import { Badge } from "@/components/ui/badge";

/**
 * Column definitions for the Novedades / Permissions report.
 */
const MAX_AREA_CHARS = 22;

export const novedadesReportColumns = [
  {
    header: "Empleado",
    accessorKey: "Empleado",
    cell: (row) => (
      <div className="flex flex-col min-w-[140px]">
        <span className="font-medium text-sm leading-tight">{row.Empleado}</span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {row.Cedula}
          {row.Area && row.Area !== 'Sin Área' && (
            <> · <span title={row.Area}>
              {row.Area.length > MAX_AREA_CHARS
                ? `${row.Area.slice(0, MAX_AREA_CHARS)}…`
                : row.Area}
            </span></>
          )}
        </span>
      </div>
    ),
  },
  {
    header: "Desde",
    accessorKey: "Desde",
    className: "text-center whitespace-nowrap",
  },
  {
    header: "Hasta",
    accessorKey: "Hasta",
    className: "text-center whitespace-nowrap",
  },
  {
    header: "Permiso",
    accessorKey: "TipoPermiso",
    className: "font-medium"
  },
  {
    header: "Duración / Horas",
    accessorKey: "Duracion",
    className: "text-center text-xs text-muted-foreground",
  },
  {
    header: "Estado",
    accessorKey: "Estado",
    className: "text-center",
    cell: (row) => {
      let colorClass = "bg-muted text-muted-foreground";
      if (row.Estado === 'APROBADO') colorClass = "bg-primary/10 text-primary hover:bg-primary/20";
      if (row.Estado === 'RECHAZADO') colorClass = "bg-destructive/10 text-destructive hover:bg-destructive/20";
      return (
        <Badge variant="outline" className={`border-0 uppercase ${colorClass}`}>
          {row.Estado}
        </Badge>
      );
    },
  },
  {
    header: "Aprobador",
    accessorKey: "Aprobador",
    className: "text-xs text-muted-foreground max-w-[120px] truncate",
  },
];

/**
 * PDF column mapping for the Novedades report.
 */
export const novedadesPdfColumns = [
  { header: "Empleado",       dataKey: "Empleado" },
  { header: "Cédula",         dataKey: "Cedula" },
  { header: "Área",           dataKey: "Area" },
  { header: "Desde",          dataKey: "Desde" },
  { header: "Hasta",          dataKey: "Hasta" },
  { header: "Tipo Permiso",   dataKey: "TipoPermiso" },
  { header: "Duración",       dataKey: "Duracion" },
  { header: "Aprobador",      dataKey: "Aprobador" },
  { header: "Estado",         dataKey: "Estado" },
];
