"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { usePermission } from "@/providers/permissions-provider";
import { SUPERVISION_CONFIG } from "../config/supervision.constants";

export function SupervisionToolbar({
  searchTerm,
  onSearchChange,
  onCreate,
}) {
  const { can } = usePermission();

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por supervisor o área..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {can(SUPERVISION_CONFIG.PERMISSIONS.WRITE) && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Permiso
        </Button>
      )}
    </div>
  );
}
