"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { usePermission } from "@/features/auth/components/permissions-provider";
import { INCIDENT_CONFIG } from "../config/incidents.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IncidentToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onCreate,
}) {
  const { can } = usePermission();

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado o cédula..."
            className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => onSearchChange(e.target.value)}
            defaultValue={searchTerm}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[180px] bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring">
              <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={INCIDENT_CONFIG.STATUS.PENDING}>Pendiente</SelectItem>
              <SelectItem value={INCIDENT_CONFIG.STATUS.APPROVED}>Aprobado</SelectItem>
              <SelectItem value={INCIDENT_CONFIG.STATUS.REJECTED}>Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {can(INCIDENT_CONFIG.PERMISSIONS.WRITE) && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Novedad
        </Button>
      )}
    </div>
  );
}
