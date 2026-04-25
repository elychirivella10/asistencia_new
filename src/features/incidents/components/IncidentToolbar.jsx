"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { INCIDENT_CONFIG } from "../config/incidents.constants";
import { Toolbar } from "@/components/shared/Toolbar";
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
  const { UI: { LABELS } } = INCIDENT_CONFIG;
  const { can } = usePermission();

  const selectFilters = React.useMemo(() => [
    {
      key: "status",
      label: LABELS.TOOLBAR.STATUS_PLACEHOLDER,
      value: statusFilter,
      onChange: onStatusChange,
      placeholder: LABELS.TOOLBAR.STATUS_PLACEHOLDER,
      options: [
        { label: LABELS.TOOLBAR.STATUS_ALL, value: "all" },
        { label: LABELS.TOOLBAR.STATUS_PENDING, value: INCIDENT_CONFIG.STATUS.PENDING },
        { label: LABELS.TOOLBAR.STATUS_APPROVED, value: INCIDENT_CONFIG.STATUS.APPROVED },
        { label: LABELS.TOOLBAR.STATUS_REJECTED, value: INCIDENT_CONFIG.STATUS.REJECTED },
      ]
    }
  ], [statusFilter, onStatusChange, LABELS]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Divider label={LABELS.TOOLBAR.DIVIDER_FILTERS} />
        <Toolbar.Filters>
          {selectFilters.map((f) => (
            <Toolbar.FilterItem key={f.key} label={f.label}>
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
            </Toolbar.FilterItem>
          ))}
        </Toolbar.Filters>
      </Toolbar.Main>

      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          onChange={(e) => onSearchChange(e.target.value)}
          defaultValue={searchTerm}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          {can(INCIDENT_CONFIG.PERMISSIONS.WRITE) && (
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
