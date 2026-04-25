"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { SUPERVISION_CONFIG } from "../config/supervision.constants";
import { Toolbar } from "@/components/shared/Toolbar";

export function SupervisionToolbar({
  searchTerm,
  onSearchChange,
  onCreate
}) {
  const { can } = usePermission();
  const { UI: { LABELS } } = SUPERVISION_CONFIG;

  return (
    <Toolbar>
      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={searchTerm ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          {can(SUPERVISION_CONFIG.PERMISSIONS.WRITE) && (
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
