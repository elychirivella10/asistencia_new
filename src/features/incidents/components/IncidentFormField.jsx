
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { CustomFormSwitch } from "@/components/shared/form/CustomFormSwitch";
import { CustomFormTextarea } from "@/components/shared/form/CustomFormTextarea";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { CustomFormField } from "@/components/shared/form/CustomFormField";

export function IncidentFormField({ field, form, incident }) {
  const commonProps = {
    control: form.control,
    name: field.name,
    label: field.label,
    placeholder: field.placeholder,
    description: field.description,
    disabled: field.disabled,
  };

  if (field.component === "select") {
    return (
      <CustomFormSelect
        key={field.name}
        {...commonProps}
        options={field.options}
      />
    );
  }

  if (field.component === "async-select") {
    const fieldInitialData = field.name === "usuario_id" && incident?.usuario ? {
        id: incident.usuario_id,
        nombre: incident.usuario.nombre,
        apellido: incident.usuario.apellido,
        cedula: incident.usuario.cedula,
    } : undefined;

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
              fetcher={field.fetcher}
              renderOption={field.renderOption}
              getLabel={field.getLabel}
              getValue={field.getValue}
              initialData={fieldInitialData}
            />
             {field.description && <FormDescription>{field.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (field.component === "switch") {
    return (
      <CustomFormSwitch
        key={field.name}
        {...commonProps}
      />
    );
  }

  if (field.component === "textarea") {
    return (
      <CustomFormTextarea
        key={field.name}
        {...commonProps}
      />
    );
  }

  if (field.component === "date") {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              <Input
                type="date"
                suppressHydrationWarning={true}
                value={formField.value ? (() => {
                    const d = new Date(formField.value);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                })() : ""}
                onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    formField.onChange(date);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Default to CustomFormField (input)
  return (
    <CustomFormField
      key={field.name}
      {...commonProps}
      type={field.type || "text"}
    />
  );
}
