"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreaForm } from "./AreaForm";

export function AreaFormDialog({ 
  open, 
  onOpenChange, 
  area, 
  areas, 
  tiposArea, 
  onSuccess 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{area ? "Editar Área" : "Nueva Área"}</DialogTitle>
        </DialogHeader>
        <AreaForm
          area={area}
          tiposArea={tiposArea}
          areas={areas}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
