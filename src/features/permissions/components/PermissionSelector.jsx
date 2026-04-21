"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Circle, ShieldCheck, Eraser } from "lucide-react";
import { PermissionGroup } from "./PermissionGroup";
import { groupPermissionsByModule, filterPermissions } from "../services/permission-logic.service";

/**
 * PermissionSelector
 * Componente orquestador para la selección múltiple de permisos.
 * Implementa el patrón de desacoplamiento de estado y sincronización diferida (debounce)
 * para garantizar la fluidez máxima en formularios grandes.
 */
export function PermissionSelector({
  permissions = [],
  selectedIds = [],
  onChange,
  label = "Permisos del Sistema"
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState([]);
  const isInternalUpdate = useRef(false);
  const debounceRef = useRef(null);

  // 1. Sincronizar entrada (Prop -> Local)
  useEffect(() => {
    // Solo sincronizar si el cambio viene de fuera (no es nuestro propio debounce)
    if (!isInternalUpdate.current) {
      setLocalSelected(selectedIds.map(id => Number(id)));
    }
    isInternalUpdate.current = false;
  }, [selectedIds]);

  // 2. Sincronizar salida diferida (Debounce 300ms)
  const notifyChanges = useCallback((newSelection) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      isInternalUpdate.current = true;
      onChange(newSelection);
    }, 300);
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // 3. Procesar datos usando el Servicio de Lógica
  const groupedPermissions = useMemo(() => {
    const filtered = filterPermissions(permissions, searchTerm);
    return groupPermissionsByModule(filtered);
  }, [permissions, searchTerm]);

  // 4. Manejadores de interacción local (Rápidos)
  const togglePermission = useCallback((id) => {
    const numericId = Number(id);
    setLocalSelected(prev => {
      const isSelected = prev.includes(numericId);
      const next = isSelected 
        ? prev.filter(sid => sid !== numericId) 
        : [...prev, numericId];
      
      notifyChanges(next);
      return next;
    });
  }, [notifyChanges]);

  const selectGroup = useCallback((moduleName, select) => {
    const groupIds = groupedPermissions[moduleName].map(p => Number(p.id));
    setLocalSelected(prev => {
      let next;
      if (select) {
        next = Array.from(new Set([...prev, ...groupIds]));
      } else {
        next = prev.filter(id => !groupIds.includes(id));
      }
      notifyChanges(next);
      return next;
    });
  }, [groupedPermissions, notifyChanges]);

  const selectAll = useCallback((select) => {
    const next = select ? permissions.map(p => Number(p.id)) : [];
    setLocalSelected(next);
    notifyChanges(next);
  }, [permissions, notifyChanges]);

  const totalSelected = localSelected.length;

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold tracking-tight">{label}</h2>
          </div>
          <p className="text-xs text-muted-foreground pl-8">
            Seleccionados: {totalSelected} de {permissions.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px] font-semibold gap-1.5"
            onClick={() => selectAll(true)}
          >
            Marcar Todos
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-[11px] font-semibold gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => selectAll(false)}
          >
            <Eraser className="w-3.5 h-3.5" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar permiso o módulo..."
          className="pl-9 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Grupos */}
      <ScrollArea className="h-[450px] pr-4">
        <div className="space-y-6 pr-2">
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <PermissionGroup
              key={module}
              moduleName={module}
              permissions={perms}
              selectedIds={localSelected}
              onToggle={togglePermission}
              onSelectGroup={selectGroup}
            />
          ))}

          {Object.keys(groupedPermissions).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Circle className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm italic">No se encontraron permisos registrados.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
