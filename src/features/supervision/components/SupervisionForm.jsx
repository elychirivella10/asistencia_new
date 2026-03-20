import { getSupervisionFormConfig } from "../config/supervision-form.config";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function SupervisionForm({ form, supervision }) {
  const formConfig = getSupervisionFormConfig();

  // Helper to get initial data for async selects based on field name
  const getInitialData = (fieldName) => {
    if (!supervision) return null;
    
    if (fieldName === 'usuario_id' && supervision.usuarios) {
        return supervision.usuarios;
    }
    if (fieldName === 'area_id' && supervision.areas) {
        return supervision.areas;
    }
    return null;
  };

  return (
    <div className="grid gap-4">
      {formConfig.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`grid gap-4 grid-cols-1 md:grid-cols-${row.length}`}
        >
          {row.map((field) => {
            if (field.component === 'async-select') {
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <AsyncSelect
                                        value={formField.value}
                                        onChange={formField.onChange}
                                        fetcher={field.fetcher}
                                        renderOption={field.renderOption}
                                        getLabel={field.getLabel}
                                        getValue={field.getValue}
                                        placeholder={field.placeholder}
                                        initialData={getInitialData(field.name)}
                                    />
                                </FormControl>
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
                {...field}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
