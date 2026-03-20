"use client";

import { IncidentDeleteDialog } from "./IncidentDeleteDialog";
import { IncidentFormDialog } from "./IncidentFormDialog";

export function IncidentTableDialogs({
  open,
  onOpenChange,
  editingIncident,
  incidentTypes,
  deletingIncident,
  setDeletingIncident,
  handleSuccess
}) {
  return (
    <>
      <IncidentFormDialog
        open={open}
        onOpenChange={onOpenChange}
        incident={editingIncident}
        incidentTypes={incidentTypes}
        onSuccess={handleSuccess}
      />

      {deletingIncident && (
        <IncidentDeleteDialog
          incident={deletingIncident}
          onOpenChange={(isOpen) => !isOpen && setDeletingIncident(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
