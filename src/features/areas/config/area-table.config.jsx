import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, MoreHorizontal, Pencil, Trash2, User, Plus } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AREA_CONFIG } from "./area.constants";

export const getAreaTableColumns = (onEdit, onAddSubArea, onDelete, can = () => true) => {
  const { PERMISSIONS, UI } = AREA_CONFIG;
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);
  const canCreate = can(PERMISSIONS.WRITE); // Para sub-área

  const columns = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      width: "300px",
      sortable: true,
      cell: (area) => (
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium flex items-center gap-2 truncate" title={area.nombre}>
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{area.nombre}</span>
          </span>
          {area.descripcion && (
            <span className="text-xs text-muted-foreground ml-6 truncate" title={area.descripcion}>
              {area.descripcion}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Tipo",
      accessorKey: "tipo",
      sortable: true,
      cell: (area) => (
        <Badge variant="outline" className="capitalize">
          {area.cat_tipos_area?.nombre || UI.LABELS.NO_TYPE}
        </Badge>
      ),
    },
    {
      header: "Área Padre",
      accessorKey: "parent",
      sortable: true,
      cell: (area) =>
        area.parent ? (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {area.parent.nombre}
          </span>
        ) : (
          <span className="text-muted-foreground/50 text-sm italic">
            {UI.LABELS.ROOT}
          </span>
        ),
    },
    {
      header: "Jefe / Encargado",
      accessorKey: "jefe",
      sortable: true,
      cell: (area) =>
        area.jefe ? (
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded-full">
              <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {area.jefe.nombre} {area.jefe.apellido}
              </span>
              <span className="text-xs text-muted-foreground">
                {area.jefe.email}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">
            {UI.LABELS.NO_CHIEF}
          </span>
        ),
    },
  ];

  if (canUpdate || canDelete || canCreate) {
    columns.push({
      header: "Acciones",
      className: "text-right",
      cell: (area) => (
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
              
              {canCreate && (
                <DropdownMenuItem onClick={() => onAddSubArea(area)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Sub-área
                </DropdownMenuItem>
              )}
              
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(area)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              
              {(canUpdate || canCreate) && canDelete && <DropdownMenuSeparator />}
              
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(area)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    });
  }

  return columns;
};
