"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shiftSchema } from "../schemas/shift.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { saveShift } from "../actions/shift-write.action";
import { Loader2 } from "lucide-react";
import { useTransition, useEffect } from "react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormCheckbox } from "@/components/shared/form/CustomFormCheckbox";
import { CustomFormCheckboxGroup } from "@/components/shared/form/CustomFormCheckboxGroup";
import { getShiftFormConfig } from "../config/shift-form.config";
import { SHIFT_DEFAULT_VALUES } from "../config/shift.constants";

export function ShiftForm({ shift, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  // 1. Define form setup
  const form = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: shift || SHIFT_DEFAULT_VALUES,
  });

  const formConfig = getShiftFormConfig();

  // Efecto para hidratar formulario si cambia el shift (útil en modales / edición)
  useEffect(() => {
    if (shift) {
      form.reset({
        ...shift,
        // Al resetear, debemos asegurar que las horas pasen a estring y los dias ya sean arrays
      });
    }
  }, [shift, form]);

  // 2. Submit handler
  function onSubmit(values) {
    startTransition(async () => {
      try {
        const result = await saveShift(values);

        if (result.success) {
          toast.success(result.message);
          onSuccess?.();
        } else {
          if (result.details) {
             Object.entries(result.details).forEach(([field, messages]) => {
                if (field in values) {
                   form.setError(field, { type: "server", message: messages[0] });
                } else {
                   toast.error(messages[0]);
                }
             });
          } else {
             toast.error(result.error || "Ocurrió un error.");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error inesperado al procesar solicitud.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {shift?.id && <input type="hidden" {...form.register("id")} />}

        {formConfig.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-4 ${row.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => {
              const commonProps = {
                control: form.control,
                name: field.name,
                label: field.label,
                placeholder: field.placeholder,
                description: field.description,
              };

              if (field.component === "checkbox") {
                return <CustomFormCheckbox key={field.name} {...commonProps} />;
              }
              if (field.component === "checkbox-group") {
                return (
                  <CustomFormCheckboxGroup 
                    key={field.name} 
                    {...commonProps} 
                    options={field.options}
                  />
                );
              }

              return (
                <CustomFormField
                  key={field.name}
                  {...commonProps}
                  type={field.type || "text"}
                  disabled={field.disabled}
                />
              );
            })}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Guardando..." : "Guardar Turno"}
        </Button>
      </form>
    </Form>
  );
}
