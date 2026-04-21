import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { SHIFT_CONFIG } from "../config/shift.constants";

export function ShiftToolbar({
  searchTerm,
  onSearchChange,
  onCreate
}) {
  const { can } = usePermission();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex flex-1 items-center space-x-2 w-full sm:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de turno..."
            className="pl-8 bg-card"
            value={searchTerm ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 block sm:flex">
        {can(SHIFT_CONFIG.PERMISSIONS.CREATE) && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Turno
          </Button>
        )}
      </div>
    </div>
  );
}
