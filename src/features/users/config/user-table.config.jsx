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
import { Fingerprint, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { USER_CONFIG } from "./user.constants";

export const getUserTableColumns = (onEdit, onDelete, can = () => false) => {
  const { PERMISSIONS, UI } = USER_CONFIG;
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);

  const columns = [
    {
      header: "Usuario",
      accessorKey: "nombre",
      sortable: true,
      width: "300px",
      cell: (user) => (
        <div className="flex flex-col">
          <span className="font-medium truncate" title={user.nombre}>
            {user.nombre} {user.apellido}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      ),
    },
    {
      header: "Área",
      accessorKey: "area",
      sortable: true,
      cell: (user) =>
        user.areas_pertenece?.nombre || (
          <span className="text-muted-foreground italic">{UI.LABELS.NO_AREA}</span>
        ),
    },
    {
      header: "Rol",
      accessorKey: "rol",
      sortable: true,
      cell: (user) => (
        <Badge variant="outline" className="font-medium">
          {user.roles?.nombre || UI.LABELS.NO_ROLE}
        </Badge>
      ),
    },
    {
      header: "ID Biométrico",
      accessorKey: "biometric_id",
      className: "text-center",
      cell: (user) => (
        <div className="flex justify-center">
          {user.biometric_id ? (
            <Badge
              variant="secondary"
              className="gap-1 font-mono"
            >
              <Fingerprint className="h-3 w-3" />
              {user.biometric_id}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              {UI.LABELS.NOT_LINKED}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "es_activo",
      sortable: true,
      cell: (user) => (
        <Badge variant={user.es_activo ? UI.BADGE_VARIANTS.ACTIVE : UI.BADGE_VARIANTS.INACTIVE}>
          {user.es_activo ? UI.LABELS.ACTIVE : UI.LABELS.INACTIVE}
        </Badge>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      header: "Acciones",
      className: "text-right",
      cell: (user) => (
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
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canUpdate && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(user.id)}
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
