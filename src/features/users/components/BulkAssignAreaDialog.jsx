"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { searchVisibleAreas } from "@/features/areas/actions/area-read.action";

export function BulkAssignAreaDialog({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}) {
  const [selectedArea, setSelectedArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedArea) return;
    setIsSubmitting(true);
    await onConfirm(selectedArea);
    setIsSubmitting(false);
    setSelectedArea("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar Área Masivamente</DialogTitle>
          <DialogDescription>
            Se asignará el área seleccionada a <strong>{selectedCount}</strong>{" "}
            usuarios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <AsyncSelect
              value={selectedArea}
              onChange={setSelectedArea}
              fetcher={searchVisibleAreas}
              placeholder="Seleccionar Área"
              getLabel={(area) => area.nombre}
              getValue={(area) => area.id}
              fetchOnOpen
              allowEmptyQuery
              initialQuery=""
              useFormControl={false}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedArea || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar Área
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
