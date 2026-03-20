"use client";

import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";

/**
 * Toolbar for bulk actions on selected users.
 */
export function UserBulkActions({ 
  selectedCount, 
  onClearSelection, 
  onBulkAssign 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-primary/20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-primary">
          {selectedCount} usuarios seleccionados
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onBulkAssign}>
          <Users className="h-4 w-4 mr-2" />
          Asignar Área
        </Button>
      </div>
    </div>
  );
}
