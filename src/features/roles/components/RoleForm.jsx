"use client";

import { useForm } from "react-hook-form";
import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema } from "../schemas/role.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { saveRole } from "../actions/role-write.action"; // Usamos la acción unificada
import { toast } from "sonner";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormTextarea } from "@/components/shared/form/CustomFormTextarea";
import { CustomFormCheckboxGroup } from "@/components/shared/form/CustomFormCheckboxGroup";
import { PermissionSelector } from "@/features/permissions/components/PermissionSelector";
import { getRoleFormConfig } from "../config/role-form.config";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

export function RoleForm({ role, permissions, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  // Estabilizar la referencia de permisos que viene del padre
  const stablePermissions = useMemo(() => permissions, [permissions]);

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nombre: role?.nombre || "",
      descripcion: role?.descripcion || "",
      // Asegurar que los IDs iniciales sean números
      permisos: role?.permiso_ids ? role.permiso_ids.map(id => Number(id)) : [],
    },
  });

  const formConfig = useMemo(() => getRoleFormConfig(stablePermissions), [stablePermissions]);

  const onSubmit = (data) => {
    startTransition(async () => {
      // Inyectamos el ID si estamos editando para que saveRole sepa que es update
      const payload = role ? { ...data, id: role.id } : data;
      
      const result = await saveRole(payload);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: "server", message: messages[0] });
          });
        } else {
          toast.error(result.error || "Error al guardar el rol");
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formConfig.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid gap-4 ${
              row.length > 1 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {row.map((field) => {
              if (field.component === "input") {
                return (
                  <CustomFormField
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "textarea") {
                return (
                  <CustomFormTextarea
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "checkbox-group") {
                return (
                  <CustomFormCheckboxGroup
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "permission-selector") {
                return (
                  <div key={field.name} className="col-span-full">
                    <FormField
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem>
                          <PermissionSelector
                            label={field.label}
                            permissions={field.options}
                            selectedIds={formField.value}
                            onChange={formField.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : role ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
