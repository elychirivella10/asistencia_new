"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";
import { usePermission } from "@/providers/permissions-provider";
import { searchVisibleAreas } from "@/features/areas/actions/area-read.action";
import { USER_CONFIG } from "../config/user.constants";

export function UserToolbar({
  searchTerm,
  onSearchChange,
  areaFilter,
  onAreaChange,
  statusFilter,
  onStatusChange,
  onCreate,
}) {
  const { can } = usePermission();

  // Wrapper para llamar al Server Action
  const handleAreaSearch = async (term) => {
    return await searchVisibleAreas(term);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            key={searchTerm}
            placeholder="Buscar por nombre o cédula..."
            className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => onSearchChange(e.target.value)}
            defaultValue={searchTerm}
          />
        </div>
        
        <div className="w-[200px]">
          <AsyncSelect
            value={areaFilter}
            onChange={onAreaChange}
            fetcher={handleAreaSearch}
            placeholder="Filtrar por Área"
            getLabel={(option) => option.nombre}
            getValue={(option) => option.id}
            fetchOnOpen
            allowEmptyQuery
            initialQuery=""
            triggerClassName="h-9 bg-background/60 border-none hover:bg-background/70 focus-visible:ring-1 focus-visible:ring-ring"
            useFormControl={false}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[180px] bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={USER_CONFIG.STATUS.ALL}>Todos</SelectItem>
            <SelectItem value={USER_CONFIG.STATUS.ACTIVE}>Activos</SelectItem>
            <SelectItem value={USER_CONFIG.STATUS.INACTIVE}>Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {can(USER_CONFIG.PERMISSIONS.WRITE) && (
        <Button onClick={onCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      )}
    </div>
  );
}
