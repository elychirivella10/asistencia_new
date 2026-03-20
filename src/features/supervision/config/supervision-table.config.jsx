import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, User, Building2, Pencil } from "lucide-react";
import { SUPERVISION_CONFIG } from "./supervision.constants";

export const getSupervisionTableColumns = (onEdit, onDelete, can = () => true) => {
  const { PERMISSIONS } = SUPERVISION_CONFIG;
  return [
    {
      header: "Supervisor",
      accessorKey: "usuario_nombre",
      cell: (row) => (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-primary/10 p-1 rounded-full shrink-0">
                <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-medium truncate" title={row.usuario_nombre}>{row.usuario_nombre}</span>
                <span className="text-xs text-muted-foreground truncate" title={row.usuario_email}>{row.usuario_email}</span>
            </div>
          </div>
      )
    },
    {
      header: "Área Supervisada",
      accessorKey: "area_nombre",
      cell: (row) => (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="shrink-0">
               <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="font-medium truncate" title={row.area_nombre}>{row.area_nombre}</span>
            {row.area_tipo && (
                <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                    {row.area_tipo}
                </Badge>
            )}
          </div>
      )
    },
    {
        header: "Acciones",
        className: "text-right w-[100px]",
        cell: (row) => (
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
                        {can(PERMISSIONS.UPDATE) && (
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.DELETE) && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => onDelete(row)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }
  ];
}
