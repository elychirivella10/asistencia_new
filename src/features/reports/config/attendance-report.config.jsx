import { Badge } from "@/components/ui/badge";
import { formatHM } from "@/features/shared/lib/date-utils";
import { ATTENDANCE_CONFIG } from "@/features/attendance/config/attendance.constants";

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
    cell: (row) => (
      <span className={row.NotificadoTardia ? ATTENDANCE_CONFIG.BUSINESS.LATE_NOTIFICATION_COLOR : ""}>
        {row.HoraEntrada}
      </span>
    ),
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
    header: "Debe (m)",
    accessorKey: "MinutosDebe",
    className: "text-right",
    cell: (row) =>
      row.MinutosDebe > 0 ? (
        <span className="text-destructive font-medium">{formatHM(row.MinutosDebe)}</span>
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
  { header: "Cédula", dataKey: "Cédula", halign: "center" },
  { header: "Área", dataKey: "Área" },
  { header: "Fecha", dataKey: "Fecha", halign: "center" },
  { header: "Entrada", dataKey: "Entrada", halign: "center" },
  { header: "Salida", dataKey: "Salida", halign: "center" },
  { header: "Permiso", dataKey: "Permiso", halign: "center" },
  { header: "T. Bruto", dataKey: "T. Bruto", halign: "right" },
  { header: "T. Neto", dataKey: "T. Neto", halign: "right" },
  { header: "Extra", dataKey: "Extra", halign: "right" },
  { header: "Debe (m)", dataKey: "Debe (m)", halign: "right" },
  { header: "Estado", dataKey: "Estado", halign: "center" },
];

/**
 * Maps raw data into a friendly format for Excel/PDF exports,
 * exactly aligned with the visible table columns.
 */
export const getAttendanceExportData = (data) => {
  return data.map(row => ({
    "Empleado": row.Empleado ?? '—',
    "Cédula": row.Cedula ?? '—',
    "Área": row.Area ?? '—',
    "Fecha": row.Fecha ?? '—',
    "Entrada": row.HoraEntrada ?? '—',
    "Salida": row.HoraSalida ?? '—',
    "Permiso": row.Permiso ? row.Permiso.replace(/_/g, ' ') : '—',
    "T. Bruto": formatHM(row.MinutosBruto),
    "T. Neto": formatHM(row.MinutosNeto),
    "Extra": row.MinutosExtras > 0 ? `+${formatHM(row.MinutosExtras)}` : '—',
    "Debe (m)": row.MinutosDebe > 0 ? formatHM(row.MinutosDebe) : '—',
    "Estado": row.Estado ?? '—'
  }));
};

