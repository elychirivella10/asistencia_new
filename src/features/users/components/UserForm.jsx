"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Form, formField, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { saveUser } from "../actions/user-write.action";
import { Loader2 } from "lucide-react";
import { useTransition, useEffect } from "react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { CustomFormSwitch } from "@/components/shared/form/CustomFormSwitch";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { getUserFormConfig, getUserDefaultValues } from "../config/user-form.config";
// import { toFormData } from "@/features/shared/lib/utils"; // Removed unused import

/**
 * User Form Component using React Hook Form + Zod.
 */
export function UserForm({ user, areas, turnos, roles, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  // 1. Define form with useForm and zodResolver
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: getUserDefaultValues(user),
  });

  // Config fields (Config-Driven UI)
  const formConfig = getUserFormConfig(areas, turnos, roles, user);

  // Effect to update form when user changes (reset)
  useEffect(() => {
    form.reset(getUserDefaultValues(user));
  }, [user, form]);

  // 2. Submit handler
  function onSubmit(values) {
    startTransition(async () => {
      try {
        // Refactor: Enviar JSON directamente en lugar de FormData
        const result = await saveUser(values);

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
             toast.error(result.error || "An error occurred while saving.");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Unexpected error processing request.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {user?.id && <input type="hidden" {...form.register("id")} />}

        {formConfig.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-4 ${row.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => {
              const commonProps = {
                control: form.control,
                name: field.name,
                label: field.label,
                placeholder: field.placeholder,
              };

              if (field.component === "select") {
                return <CustomFormSelect key={field.name} {...commonProps} options={field.options} />;
              }
              if (field.component === "switch") {
                return (
                  <CustomFormSwitch
                    key={field.name}
                    {...commonProps}
                    description={typeof field.description === 'function' ? field.description(form.watch(field.name)) : field.description}
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
                            initialData={field.name === "area_id" ? user?.areas_pertenece : null}
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
                  {...commonProps}
                  type={field.type || "text"}
                  disabled={field.disabled}
                  className={field.className}
                  {...(field.value !== undefined ? { value: field.value } : {})}
                />
              );
            })}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Guardando..." : "Guardar Usuario"}
        </Button>
      </form>
    </Form>
  );
}
