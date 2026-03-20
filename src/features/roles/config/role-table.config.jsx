import { Shield, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_CONFIG } from "./role.constants";

export const getRoleTableColumns = (onEdit, onDelete, can = () => true) => {
  const { PERMISSIONS, UI } = ROLE_CONFIG;
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);

  const columns = [
    {
      header: "Rol",
      accessorKey: "nombre",
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {item.nombre}
          </span>
        </div>
      ),
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      sortable: false,
      cell: (item) => (
        <span className="text-muted-foreground text-sm truncate max-w-[200px] block" title={item.descripcion}>
          {item.descripcion || "-"}
        </span>
      ),
    },
    {
      header: "Usuarios",
      accessorKey: "usuario_count",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{item.usuario_count}</span>
        </div>
      ),
    },
    {
      header: "Permisos",
      accessorKey: "permisos",
      sortable: false,
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permisos?.slice(0, UI.MAX_VISIBLE_PERMISSIONS).map((p) => (
            <Badge key={p.id} variant="outline" className="text-xs">
              {p.slug}
            </Badge>
          ))}
          {item.permisos?.length > UI.MAX_VISIBLE_PERMISSIONS && (
            <Badge variant="secondary" className="text-xs">
              +{item.permisos.length - UI.MAX_VISIBLE_PERMISSIONS}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      id: "actions",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            
            {canUpdate && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            
            {canUpdate && canDelete && <DropdownMenuSeparator />}
            
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
};
