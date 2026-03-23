import { Suspense } from "react";
import { getIncidentsPageData } from "@/features/incidents/services/incident-read.service";
import { IncidentTable } from "@/features/incidents/components/IncidentTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { INCIDENT_CONFIG } from "@/features/incidents/config/incidents.constants";

export const metadata = {
  title: "Gestión de Novedades | Biométrico",
  description: "Registro de vacaciones, reposos y permisos",
};

export default async function NovedadesPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(INCIDENT_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let incidents, incidentTypes;
  try {
    const params = await searchParams;
    const sortKey = params?.sortKey || "";
    const sortDirection = params?.sortDirection || undefined;
    ({ incidents, incidentTypes } = await getIncidentsPageData(session, { sortKey, sortDirection }));
  } catch (error) {
    console.error("Error loading incidents data:", error);
    return (
      <ErrorAlert
        title="Error al cargar novedades"
        message="No se pudieron cargar los datos de novedades. Verifique la conexión a la base de datos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Novedades y Ausencias</h1>
        <p className="text-muted-foreground">
          Gestión de vacaciones, reposos médicos y permisos especiales.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <IncidentTable
          data={incidents}
          incidentTypes={incidentTypes}
        />
      </Suspense>
    </div>
  );
}
