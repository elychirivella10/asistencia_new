import { Suspense } from "react";
import { getSupervisionPageData } from "@/features/supervision/services/supervision-read.service";
import { SupervisionTable } from "@/features/supervision/components/SupervisionTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { checkPageAccess } from "@/lib/auth-guard";
import { SUPERVISION_CONFIG } from "@/features/supervision/config/supervision.constants";

export const metadata = {
  title: "Supervisión | Biométrico",
  description: "Gestión de permisos de supervisión adicionales.",
};

export default async function SupervisionPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(SUPERVISION_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let supervisions;
  try {
    const params = await searchParams;
    const sortKey = params?.sortKey || "";
    const sortDirection = params?.sortDirection || undefined;
    ({ supervisions } = await getSupervisionPageData(session, { sortKey, sortDirection }));
  } catch (error) {
    console.error("Error loading supervision data:", error);
    return (
      <ErrorAlert 
        title="Error al cargar permisos"
        message="No se pudieron cargar los permisos de supervisión. Verifique la conexión a la base de datos."
      />
    );
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Permisos de Supervisión</h2>
          <p className="text-muted-foreground">
            Gestión de permisos de supervisión adicionales (fuera de jerarquía).
          </p>
        </div>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <SupervisionTable data={supervisions} />
      </Suspense>
    </div>
  );
}
