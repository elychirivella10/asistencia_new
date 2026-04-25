"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { AREA_CONFIG } from "../config/area.constants";
import { Toolbar } from "@/components/shared/Toolbar";

import { List, Network } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AreaToolbar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  onCreate,
  onReset,
  tiposArea = [],
  viewMode = "table",
  onViewModeChange
}) {
  const { can } = usePermission();
  const { UI: { LABELS } } = AREA_CONFIG;

  const selectFilters = useMemo(() => [
    {
      key: "tipo",
      label: LABELS.TOOLBAR.TYPE_PLACEHOLDER,
      value: typeFilter,
      onChange: onTypeChange,
      placeholder: LABELS.TOOLBAR.TYPE_PLACEHOLDER,
      options: [
        { label: LABELS.TOOLBAR.TYPE_ALL, value: "all" },
        ...tiposArea.map((tipo) => ({ label: tipo.nombre, value: String(tipo.id) })),
      ],
    },
  ], [typeFilter, onTypeChange, tiposArea, LABELS]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters>
          <div className="flex items-center gap-2 mr-2">
            <Tabs value={viewMode} onValueChange={onViewModeChange} className="h-9">
              <TabsList className="h-9 p-1 bg-muted/50">
                <TabsTrigger value="table" className="h-7 gap-2 px-3 data-[state=active]:bg-background">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
                <TabsTrigger value="organigram" className="h-7 gap-2 px-3 data-[state=active]:bg-background">
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Estructura</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {selectFilters.map((f) => (
            <Toolbar.FilterItem key={f.key} label={f.label}>
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Toolbar.FilterItem>
          ))}
        </Toolbar.Filters>
      </Toolbar.Main>

      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          <Button variant="secondary" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{LABELS.CLEAN_BUTTON}</span>
          </Button>

          {can(AREA_CONFIG.PERMISSIONS.WRITE) && (
            <Button onClick={onCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{LABELS.TOOLBAR.NEW_BUTTON}</span>
            </Button>
          )}
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
