"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supervisionSchema } from "../schemas/supervision.schema";
import { saveSupervision } from "../actions/supervision-write.action";
import { SupervisionForm } from "./SupervisionForm";

export function SupervisionFormDialog({ open, onOpenChange, supervision, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(supervisionSchema),
    defaultValues: {
      usuario_id: "",
      area_id: "",
    },
  });

  // Reset form when dialog opens or editing item changes
  useEffect(() => {
    if (open) {
      if (supervision) {
        form.reset({
          id: supervision.id,
          usuario_id: supervision.usuario_id || "",
          area_id: supervision.area_id || "",
        });
      } else {
        form.reset({
            id: undefined,
            usuario_id: "",
            area_id: "",
        });
      }
    }
  }, [open, supervision, form]);

  const onSubmit = (data) => {
    startTransition(async () => {
      const result = await saveSupervision(data);

      if (result.success) {
        toast.success(result.message);
        if (onSuccess) onSuccess();
        else onOpenChange(false);
      } else {
        if (result.validationErrors) {
            // Handle server-side Zod validation errors
            Object.keys(result.validationErrors).forEach((key) => {
                form.setError(key, { message: result.validationErrors[key][0] });
            });
        }
        toast.error(result.error || "Error al guardar el permiso");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {supervision ? "Editar Permiso de Supervisión" : "Asignar Permiso de Supervisión"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SupervisionForm form={form} supervision={supervision} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
