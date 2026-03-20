import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { formatDateUTC, formatTimeUTC } from "@/features/shared/lib/date-utils";
import { INCIDENT_CONFIG } from "./incidents.constants";

export const getIncidentColumns = (onView, onEdit, onDelete, can = () => true) => {
  const { PERMISSIONS, UI } = INCIDENT_CONFIG;
  const canRead = can(PERMISSIONS.READ);
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);

  const columns = [
    {
      accessorKey: "fecha_inicio",
      header: "Fecha Inicio",
      cell: (row) => <span className="font-medium">{formatDateUTC(row.fecha_inicio)}</span>,
      sortable: true,
      width: "120px",
    },
    {
      accessorKey: "fecha_fin",
      header: "Fecha Fin",
      cell: (row) => formatDateUTC(row.fecha_fin),
      sortable: true,
      width: "120px",
    },
    {
      accessorKey: "usuario.nombre",
      header: "Empleado",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.usuario?.nombre} {row.usuario?.apellido}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.usuario?.cedula}
          </span>
        </div>
      ),
      width: "200px",
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: (row) => (
        <div className="flex flex-col">
          <Badge variant="outline">{row.cat_tipos_permiso?.nombre || "N/A"}</Badge>
          {!row.es_dia_completo && row.hora_inicio && row.hora_fin && (
            <span className="text-xs text-muted-foreground mt-1">
              {formatTimeUTC(row.hora_inicio)} - 
              {formatTimeUTC(row.hora_fin)}
            </span>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: (row) => (
        <Badge variant={UI.BADGE_VARIANTS[row.estado] || 'outline'}>
          {row.estado}
        </Badge>
      ),
      width: "120px",
    },
    {
      accessorKey: "observaciones",
      header: "Observaciones",
      cell: (row) => (
        <div className="truncate max-w-[300px]" title={row.observaciones}>
          {row.observaciones || "-"}
        </div>
      ),
      width: "300px",
    },
  ];

  if (canRead || canUpdate || canDelete) {
    columns.push({
      id: "actions",
      cell: (row) => {
        const requiereSoporte = row.cat_tipos_permiso?.requiere_soporte;
        return (
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
                {canRead && (
                  <DropdownMenuItem onClick={() => onView && onView(row)}>
                    <Link href={`/print/novedades/${row.id}`} target="_blank" className="flex items-center cursor-pointer">
                      <Printer className="mr-2 h-4 w-4" />
                      <span>Imprimir Soporte</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {canUpdate && (
                  <DropdownMenuItem onClick={() => onEdit(row)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem onClick={() => onDelete(row)} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return columns;
};
