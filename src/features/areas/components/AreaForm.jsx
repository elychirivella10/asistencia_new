"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaSchema } from "../schemas/area.schema";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { saveArea } from "../actions/area-write.action";
import { useState } from "react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { getAreaFormConfig } from "../config/area-form.config";
import { Loader2 } from "lucide-react";

export function AreaForm({ area, areas, tiposArea, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extraer datos iniciales para selects asíncronos
  const currentBoss = area?.jefe || null;
  const currentParent = area?.parent || null;

  const form = useForm({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      id: area?.id || "",
      nombre: area?.nombre || "",
      parent_id: area?.parent_id || "",
      jefe_id: area?.jefe_id || "",
      tipo_id: area?.tipo_id ? String(area.tipo_id) : "", // Convertir a string
    },
  });

  const selectedTipoId = form.watch("tipo_id");
  const formConfig = getAreaFormConfig(areas, area?.id, tiposArea, selectedTipoId);

  // Resetear parent_id si el tipo cambia y el padre actual ya no es válido
  // Esto es una mejora de UX para evitar inconsistencias visuales
  // useEffect(() => {
  //    const currentParent = form.getValues("parent_id");
  //    if (currentParent && !formConfig[1][0].options.find(o => o.value === currentParent)) {
  //        form.setValue("parent_id", "");
  //    }
  // }, [selectedTipoId]); 
  // Nota: Comentado para evitar loops o comportamientos agresivos, el usuario lo notará al abrir el select.

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
         // Enviar valores incluso si son vacíos para permitir limpiar campos (el backend los convierte a null)
         // Solo evitamos undefined/null puros que no deberían estar en FormData
         if (value !== undefined && value !== null) {
            formData.append(key, value);
         }
      });

      const result = await saveArea(null, formData);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        if (result.details) {
            Object.entries(result.details).forEach(([field, messages]) => {
                form.setError(field, { type: "server", message: messages[0] });
            });
        }
        toast.error(result.error || "Error al guardar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {area?.id && <input type="hidden" {...form.register("id")} />}

        {formConfig.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-4 ${row.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => {
              if (field.component === "select") {
                return (
                  <CustomFormSelect
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    options={field.options}
                    description={field.description}
                  />
                );
              }
              if (field.component === "async-select") {
                return (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: { value, onChange } }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <AsyncSelect
                          value={value}
                          onChange={onChange}
                          placeholder={field.placeholder}
                          initialData={field.name === "jefe_id" ? currentBoss : (field.name === "parent_id" ? currentParent : null)}
                          fetcher={field.fetcher}
                          renderOption={field.renderOption}
                          getLabel={field.getLabel}
                          getValue={field.getValue}
                        />
                         {field.description && <FormDescription>{field.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }
              return (
                <CustomFormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type}
                  description={field.description}
                />
              );
            })}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {area ? "Actualizar" : "Crear Área"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
