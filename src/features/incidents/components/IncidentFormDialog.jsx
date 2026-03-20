"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncidentForm } from "./IncidentForm";

export function IncidentFormDialog({ 
  open, 
  onOpenChange, 
  incident, 
  incidentTypes, 
  onSuccess 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {incident ? "Editar Novedad" : "Registrar Novedad"}
          </DialogTitle>
        </DialogHeader>
        <IncidentForm 
          incident={incident}
          incidentTypes={incidentTypes}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
