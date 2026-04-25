"use client";

import { User, Edit, Plus, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/features/shared/lib/shared-utils"
import { Card as CardUI, CardContent as CardContentUI } from "@/components/ui/card";
import { Button as ButtonUI } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { AREA_CONFIG } from "../config/area.constants";

export function AreaNode({ area, onEdit, onAddSubArea, onDelete, onDrillDown, isRoot = false }) {
  const hasChildren = area.children && area.children.length > 0;
  const childrenCount = area.children ? area.children.length : 0;
  const LABELS = AREA_CONFIG.UI.LABELS.ORGANIGRAM;

  return (
    <CardUI 
      onClick={() => hasChildren && onDrillDown && onDrillDown(area)}
      className={cn(
        "relative w-full transition-all duration-300 overflow-visible group",
        isRoot ? "border-t-4 border-t-primary shadow-md bg-card/95 backdrop-blur ring-1 ring-primary/20 scale-[1.02] cursor-default" : "border-l-4 border-l-primary/60 shadow-sm bg-card hover:shadow-md hover:border-l-primary",
        hasChildren && !isRoot ? "cursor-pointer hover:-translate-y-1" : ""
      )}
    >
      <CardContentUI className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <h3 className={cn("font-bold leading-tight text-foreground line-clamp-2", isRoot ? "text-[18px]" : "text-[15px]")} title={area.nombre}>
              {area.nombre}
            </h3>
            <BadgeUI variant="secondary" className="w-fit text-[10px] font-medium opacity-80">
              {area.cat_tipos_area?.nombre || AREA_CONFIG.UI.LABELS.NO_TYPE}
            </BadgeUI>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-1 bg-background border shadow-sm rounded-full p-1 z-20 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <ButtonUI variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onEdit(area); }}>
              <Edit className="w-3.5 h-3.5 text-primary" />
            </ButtonUI>
            <ButtonUI variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-green-500/10" onClick={(e) => { e.stopPropagation(); onAddSubArea(area); }}>
              <Plus className="w-3.5 h-3.5 text-green-600" />
            </ButtonUI>
            <ButtonUI variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(area); }}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </ButtonUI>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
            <User className="w-4 h-4 shrink-0 text-primary/70" />
            <span className="truncate font-medium" title={area.jefe?.nombre ? `${area.jefe.nombre} ${area.jefe.apellido}` : AREA_CONFIG.UI.LABELS.NO_CHIEF}>
              {area.jefe?.nombre ? `${area.jefe.nombre} ${area.jefe.apellido}` : AREA_CONFIG.UI.LABELS.NO_CHIEF}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            {hasChildren ? (
              <BadgeUI variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[11px] px-2 py-0.5">
                {LABELS.SUB_AREAS_COUNT(childrenCount)}
              </BadgeUI>
            ) : (
              <BadgeUI variant="outline" className="text-muted-foreground/50 border-dashed text-[11px] px-2 py-0.5 font-normal">
                {LABELS.TERMINAL_AREA}
              </BadgeUI>
            )}

            {hasChildren && !isRoot && (
              <div className="flex items-center text-primary text-xs font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                Explorar <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </CardContentUI>
    </CardUI>
  );
}
