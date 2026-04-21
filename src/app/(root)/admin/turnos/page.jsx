import { Suspense } from "react";
import { loadShifts } from "@/features/shifts/actions/shift-read.action";
import { ShiftTable } from "@/features/shifts/components/ShiftTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { SHIFT_CONFIG } from "@/features/shifts/config/shift.constants";

export const metadata = {
  title: "Gestión de Turnos | Biométrico",
  description: "Administración de turnos.",
};

export default async function ShiftsPage() {
  const { authorized } = await checkPageAccess(SHIFT_CONFIG.PERMISSIONS.READ);
  
  if (!authorized) {
    return <AccessDenied />;
  }

  let shifts = [];
  try {
    shifts = await loadShifts();
  } catch (error) {
    return (
      <ErrorAlert 
        title="Error"
        message="No se pudieron cargar los turnos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Turnos</h1>
        <p className="text-muted-foreground">
          Crea y administra los horarios asignables a los empleados.
        </p>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <ShiftTable data={shifts} />
      </Suspense>
    </div>
  );
}
