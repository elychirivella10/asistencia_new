"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { usePermission } from "@/providers/permissions-provider";
import { AREA_CONFIG } from "../config/area.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AreaToolbar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  onCreate,
  tiposArea,
}) {
  const { can } = usePermission();

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar áreas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="h-9 w-[180px] bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo de Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tiposArea.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {can(AREA_CONFIG.PERMISSIONS.WRITE) && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Área
        </Button>
      )}
    </div>
  );
}
