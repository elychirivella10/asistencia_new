"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { IncidentFormField } from "./IncidentFormField";

import { incidentSchema } from "../schemas/incident.schema";
import { saveIncident } from "../actions/incident-write.action";
import { getIncidentFormConfig } from "../config/incident-form.config";
import { formatTimeUTC } from "@/features/shared/lib/date-utils";

const EMPTY_ARRAY = [];

export function IncidentForm({ incident, incidentTypes = EMPTY_ARRAY, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  
  const isEditing = !!incident;

  const form = useForm({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      usuario_id: incident?.usuario_id || "",
      tipo: incident?.tipo_id ? String(incident.tipo_id) : undefined,
      fecha_inicio: incident?.fecha_inicio ? new Date(incident.fecha_inicio) : undefined,
      fecha_fin: incident?.fecha_fin ? new Date(incident.fecha_fin) : undefined,
      es_dia_completo: incident?.es_dia_completo ?? true,
      hora_inicio: incident?.hora_inicio ? formatTimeUTC(incident.hora_inicio) : "",
      hora_fin: incident?.hora_fin ? formatTimeUTC(incident.hora_fin) : "",
      observaciones: incident?.observaciones || "",
    },
  });

  const watchedValues = form.watch();
  const formConfig = getIncidentFormConfig(incidentTypes);

  const onSubmit = (data) => {
    startTransition(async () => {
      const payload = isEditing ? { ...data, id: incident.id } : data;
      const result = await saveIncident(payload);

      if (result.success) {
        toast.success(result.message);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} novedad`);
        if (result.details) {
           Object.entries(result.details).forEach(([field, messages]) => {
                form.setError(field, { type: "server", message: messages[0] });
            });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {formConfig.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-4 ${row.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => {
              if (field.showIf && !field.showIf(watchedValues)) return null;

              return (
                <IncidentFormField
                  key={field.name}
                  field={field}
                  form={form}
                  incident={incident}
                />
              );
            })}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear Novedad"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
