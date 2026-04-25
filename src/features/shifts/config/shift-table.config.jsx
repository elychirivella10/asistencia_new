import { DIAS_LABORALES, SHIFT_CONFIG } from "./shift.constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export const getShiftTableColumns = (onEdit, onDelete, can = () => true) => {
  const { PERMISSIONS, UI } = SHIFT_CONFIG;
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);

  const columns = [
  {
    accessorKey: "nombre",
    header: UI.LABELS.TABLE.NAME,
  },
  {
    id: "horario",
    header: UI.LABELS.TABLE.SCHEDULE,
    cell: (shift) => {
      const entrada = shift.hora_entrada;
      const salida = shift.hora_salida;
      
      // Formatear si viene como DateTime (ISO) o texto normal. (En el read service lo formatearemos a string)
      return (
        <div className="flex flex-col">
          <span className="font-medium">{entrada} - {salida}</span>
          {shift.cruza_medianoche && (
            <span className="text-xs text-muted-foreground">({UI.LABELS.TABLE.NIGHT})</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "margen_tolerancia_min",
    header: UI.LABELS.TABLE.TOLERANCE,
    cell: (shift) => {
      return <span>{shift.margen_tolerancia_min} min</span>;
    }
  },
  {
    accessorKey: "dias_laborales",
    header: UI.LABELS.TABLE.DAYS,
    cell: (shift) => {
      const dias = shift.dias_laborales || [];
      
      return (
        <div className="flex flex-wrap gap-1">
          {DIAS_LABORALES.filter(d => dias.includes(d.value)).map(dia => (
            <Badge key={dia.value} variant="secondary" className="text-xs">
              {dia.short}
            </Badge>
          ))}
        </div>
      );
    },
  }
];

  if (canUpdate || canDelete) {
    columns.push({
      header: UI.LABELS.TABLE.ACTIONS,
      className: "text-right",
      cell: (shift) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{UI.LABELS.TABLE.ACTIONS}</DropdownMenuLabel>
              
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(shift)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {canUpdate && canDelete && <DropdownMenuSeparator />}
              
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(shift)}
                  variant="destructive"
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    });
  }

  return columns;
};
