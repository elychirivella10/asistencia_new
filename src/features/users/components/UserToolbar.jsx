"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  UserPlus,
  Settings2,
  RefreshCw,
  Contact,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { USER_CONFIG } from "../config/user.constants";
import { Toolbar } from "@/components/shared/Toolbar";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";

export function UserToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  areaFilter,
  onAreaChange,
  areas = [],
  onReset,
  onCreate,
  onSyncBiometrics,
  isSyncing = false
}) {
  const { can } = usePermission();
  const { UI: { LABELS } } = USER_CONFIG;

  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sincronizar estado local si el prop cambia (ej: reset)
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Debounce para la búsqueda
  useEffect(() => {
    if (localSearch === searchTerm) return; // No disparar si ya coinciden

    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchTerm]);

  const handleInputChange = (e) => setLocalSearch(e.target.value);

  const areasFetcher = useCallback(async (query) => {
    const q = typeof query === "string" ? query.trim().toLowerCase() : "";
    if (!q) return areas;
    return areas.filter((a) => a.nombre?.toLowerCase().includes(q));
  }, [areas]);

  const selectFilters = useMemo(() => [
    {
      key: "status",
      label: LABELS.TOOLBAR.STATUS_PLACEHOLDER,
      value: statusFilter,
      onChange: onStatusChange,
      placeholder: LABELS.TOOLBAR.STATUS_PLACEHOLDER,
      options: [
        { label: LABELS.TOOLBAR.STATUS_ALL, value: "all" },
        { label: LABELS.TOOLBAR.STATUS_ACTIVE, value: "active" },
        { label: LABELS.TOOLBAR.STATUS_INACTIVE, value: "inactive" },
      ],
      component: "select",
    }
  ], [statusFilter, onStatusChange, LABELS]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters>
          <Toolbar.FilterItem label={LABELS.TOOLBAR.AREA_PLACEHOLDER} width={220}>
            <AsyncSelect
              value={areaFilter}
              onChange={onAreaChange}
              fetcher={areasFetcher}
              placeholder={LABELS.TOOLBAR.AREA_PLACEHOLDER}
              getLabel={(option) => option.nombre}
              getValue={(option) => option.id}
              fetchOnOpen
              allowEmptyQuery
              initialQuery=""
              triggerClassName="h-9 bg-background/60 border-none hover:bg-background/70 focus-visible:ring-1 focus-visible:ring-ring"
              useFormControl={false}
            />
          </Toolbar.FilterItem>

          {selectFilters.map((f) => (
            <Toolbar.FilterItem key={f.key} label={f.label}>
              {f.component === "select" ? (
                <Select value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className="h-9 w-full bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring">
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
              ) : null}
            </Toolbar.FilterItem>
          ))}
        </Toolbar.Filters>
      </Toolbar.Main>

      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={localSearch}
          onChange={handleInputChange}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          <Button variant="secondary" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{LABELS.CLEAN_BUTTON}</span>
          </Button>

          {can(USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS) && (
            <Toolbar.ActionGroup
              label={LABELS.BIOMETRICS.ACTIONS.TITLE}
              icon={Settings2}
            >
              <Button
                variant="outline"
                onClick={() => onSyncBiometrics("pull")}
                disabled={isSyncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{LABELS.BIOMETRICS.ACTIONS.PULL}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => onSyncBiometrics("push")}
                disabled={isSyncing}
              >
                <Contact className="mr-2 h-4 w-4" />
                <span>{LABELS.BIOMETRICS.ACTIONS.PUSH}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => onSyncBiometrics("total")}
                disabled={isSyncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{LABELS.BIOMETRICS.ACTIONS.TOTAL}</span>
              </Button>
            </Toolbar.ActionGroup>
          )}

          {can(USER_CONFIG.PERMISSIONS.WRITE) && (
            <Button onClick={onCreate} className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span>{LABELS.TOOLBAR.NEW_BUTTON}</span>
            </Button>
          )}
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
