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
import { Fingerprint, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react";
import { USER_CONFIG } from "./user.constants";

export const getUserTableColumns = (onEdit, onDelete, onBiometrics, can = () => false) => {
  const { PERMISSIONS, UI } = USER_CONFIG;
  const canUpdate = can(PERMISSIONS.UPDATE);
  const canDelete = can(PERMISSIONS.DELETE);
  const canBiometrics = can(PERMISSIONS.MANAGE_BIOMETRICS);

  const columns = [
    {
      header: UI.LABELS.TABLE.NAME,
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
      header: UI.LABELS.TABLE.AREA,
      accessorKey: "area",
      sortable: true,
      cell: (user) =>
        user.area?.nombre || (
          <span className="text-muted-foreground italic">{UI.LABELS.NO_AREA}</span>
        ),
    },
    {
      header: UI.LABELS.TABLE.ROLE,
      accessorKey: "rol",
      sortable: true,
      cell: (user) => (
        <Badge variant="outline" className="font-medium">
          {user.roles?.nombre || UI.LABELS.NO_ROLE}
        </Badge>
      ),
    },
    {
      header: UI.LABELS.TABLE.BIOMETRIC,
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
      header: UI.LABELS.TABLE.STATUS,
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
      header: UI.LABELS.TABLE.ACTIONS,
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
              <DropdownMenuLabel>{UI.LABELS.TABLE.ACTIONS}</DropdownMenuLabel>
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canBiometrics && (
                <DropdownMenuItem onClick={() => onBiometrics(user)}>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Biometría
                </DropdownMenuItem>
              )}
              {(canUpdate || canBiometrics) && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(user)}
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
