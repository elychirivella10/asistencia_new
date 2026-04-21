"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PermissionItem } from "./PermissionItem";

/**
 * Agrupador de Permisos por Módulo.
 * Gestiona la visualización de un grupo y sus selecciones masivas.
 */
export const PermissionGroup = React.memo(({ 
  moduleName, 
  permissions, 
  selectedIds, 
  onToggle, 
  onSelectGroup 
}) => {
  const selectedInGroup = permissions.filter(p => selectedIds.includes(Number(p.id))).length;
  const allSelectedInGroup = selectedInGroup === permissions.length;

  return (
    <div className="space-y-3">
      {/* Encabezado del Grupo */}
      <div className="flex items-center justify-between py-2 border-b border-border/10 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground/60">
            {moduleName}
          </h3>
          <Badge variant={selectedInGroup > 0 ? "default" : "outline"} className="h-5 px-1.5 text-[10px]">
            {selectedInGroup} / {permissions.length}
          </Badge>
        </div>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[10px] uppercase font-bold text-primary"
          onClick={() => onSelectGroup(moduleName, !allSelectedInGroup)}
        >
          {allSelectedInGroup ? "Deseleccionar" : "Seleccionar Grupo"}
        </Button>
      </div>

      {/* Grid de Permisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1">
        {permissions.map((p) => (
          <PermissionItem
            key={p.id}
            permission={p}
            isSelected={selectedIds.includes(Number(p.id))}
            onToggle={onToggle}
          />
        ))}
      </div>
      <Separator className="mt-4 opacity-30" />
    </div>
  );
});

PermissionGroup.displayName = "PermissionGroup";
