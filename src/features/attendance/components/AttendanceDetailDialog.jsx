import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { attendanceDetailConfig } from "../config/attendance-detail.config";
import { get } from "lodash";

// Simplified field component. Its only responsibility is to render.
const DetailField = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4 items-start py-1">
    <p className="font-semibold text-sm text-muted-foreground">{label}:</p>
    {/* The value can be a string, a number, or a React component (like a Badge) */}
    <div className="text-sm text-foreground">{value ?? 'N/A'}</div>
  </div>
);

// Simplified section component.
const DetailSection = ({ title, fields, data, statusMap }) => (
  <div className="space-y-1">
    <h3 className="text-md font-semibold text-foreground border-b border-border pb-2 mb-2">{title}</h3>
    <div className="space-y-1 pl-2">
      {fields.map((field) => {
        // The magic happens here: the transform function handles all the formatting.
        const value = field.transform ? field.transform(data, statusMap) : get(data, field.key);
        return <DetailField key={field.key} label={field.label} value={value} />;
      })}
    </div>
  </div>
);

export function AttendanceDetailDialog({ record, onOpenChange, statusMap }) {
  const isOpen = !!record;
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del Registro de Asistencia</DialogTitle>
          <DialogDescription>
            Información completa del registro de asistencia seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {attendanceDetailConfig.sections.map((section) => (
            <DetailSection
              key={section.title}
              title={section.title}
              fields={section.fields}
              data={record}
              statusMap={statusMap} // Pass it to the section to be used in transformations
            />
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
