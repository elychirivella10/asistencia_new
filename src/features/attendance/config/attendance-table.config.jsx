import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal } from "lucide-react";
import { formatDateUTC, formatTimeUTC } from "@/lib/date-utils";
import { ATTENDANCE_CONFIG } from "./attendance.constants";

export const getAttendanceTableColumns = (statusMap, onDetails) => {
  const columns = [
    {
      header: "Usuario",
      accessorKey: "usuario",
      cell: (record) => (
        <div className="flex flex-col">
          <span className="font-medium truncate">
            {record.usuarios?.nombre} {record.usuarios?.apellido}
          </span>
          <span className="text-xs text-muted-foreground">{record.usuarios?.cedula}</span>
        </div>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "fecha",
      cell: (record) => formatDateUTC(record.fecha),
    },
    {
      header: "Entrada",
      accessorKey: "hora_entrada",
      cell: (record) => (
        <span className={record.notificado_tardia ? ATTENDANCE_CONFIG.BUSINESS.LATE_NOTIFICATION_COLOR : ""}>
          {formatTimeUTC(record.hora_entrada)}
        </span>
      ),
    },
    {
      header: "Salida",
      accessorKey: "hora_salida",
      cell: (record) => formatTimeUTC(record.hora_salida),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: (record) => {
        const slug = record.estado?.toLowerCase();
        const statusInfo = (statusMap && statusMap[slug]) || {
          label: record.estado,
          color: ATTENDANCE_CONFIG.UI.DEFAULT_STATUS_COLOR
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
    {
      accessorKey: "minutos_trabajados_neto",
      header: "Tiempo Neto",
      cell: (record) => {
        const mins = record.minutos_trabajados;
        const hours = Math.floor(mins / 60);
        const m = mins % 60;
        return `${hours}h ${m}m`;
      },
    },
    {
      id: "actions",
      cell: (record) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onDetails(record)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return columns;
};
