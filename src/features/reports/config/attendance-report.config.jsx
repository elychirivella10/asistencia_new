import { Badge } from "@/components/ui/badge";
import { formatHM } from "@/features/shared/lib/date-utils";

/**
 * Column definitions for the Consolidated Attendance report table.
 */
const MAX_AREA_CHARS = 22;

export const getAttendanceReportColumns = (statusMap) => [
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
    header: "Fecha",
    accessorKey: "Fecha",
  },
  {
    header: "Entrada",
    accessorKey: "HoraEntrada",
    className: "text-center",
  },
  {
    header: "Salida",
    accessorKey: "HoraSalida",
    className: "text-center",
  },
  {
    header: "Permiso",
    accessorKey: "Permiso",
    className: "text-center",
    cell: (row) =>
      row.Permiso ? (
        <Badge variant="secondary" className="capitalize text-xs">
          {row.Permiso.replace(/_/g, ' ')}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    header: "T. Bruto (sin descuento de comedor)",
    accessorKey: "MinutosBruto",
    className: "text-right",
    cell: (row) => formatHM(row.MinutosBruto),
  },
  {
    header: "Extra",
    accessorKey: "MinutosExtras",
    className: "text-right",
    cell: (row) =>
      row.MinutosExtras > 0 ? (
        <span className="text-green-600 font-medium">+{formatHM(row.MinutosExtras)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    header: "Tardanza",
    accessorKey: "MinutosTardanza",
    className: "text-right",
    cell: (row) =>
      row.MinutosTardanza > 0 ? (
        <span className="text-destructive font-medium">{formatHM(row.MinutosTardanza)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    header: "Estado",
    accessorKey: "Estado",
    cell: (row) => {
      const slug = row.Estado?.toLowerCase();
      const statusInfo = (statusMap && statusMap[slug]) || {
        label: row.Estado,
        color: "#94a3b8"
      };
      return (
        <Badge
          style={{
            backgroundColor: statusInfo.color,
            color: 'white',
            borderColor: statusInfo.color
          }}
          className="hover:opacity-90 capitalize"
        >
          {statusInfo.label}
        </Badge>
      );
    },
  },
];

/**
 * PDF column mapping for the Consolidated Attendance report.
 */
export const attendancePdfColumns = [
  { header: "Empleado", dataKey: "Empleado" },
  { header: "Cédula", dataKey: "Cedula" },
  { header: "Área", dataKey: "Area" },
  { header: "Fecha", dataKey: "Fecha" },
  { header: "Entrada", dataKey: "HoraEntrada" },
  { header: "Salida", dataKey: "HoraSalida" },
  { header: "Permiso", dataKey: "Permiso" },
  { header: "T. Bruto", dataKey: "MinutosBruto" },
  { header: "T. Neto", dataKey: "MinutosNeto" },
  { header: "Extra", dataKey: "MinutosExtras" },
  { header: "Tardanza (m)", dataKey: "MinutosTardanza" },
  { header: "Estado", dataKey: "Estado" },
];

