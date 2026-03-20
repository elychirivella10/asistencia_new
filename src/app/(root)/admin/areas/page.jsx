import { Suspense } from "react";
import { AreaTable } from "@/features/areas/components/AreaTable";
import { getAreasPageData } from "@/features/areas/services/area-read.service";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { checkPageAccess } from "@/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { AREA_CONFIG } from "@/features/areas/config/area.constants";

export const metadata = {
  title: "Gestión de Areas | Biométrico",
  description: "Administración de áreas, tipos y jerarquía.",
};

export default async function AreasPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(AREA_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let areas, tiposArea;
  try {
    const params = await searchParams;
    const sortKey = params?.sortKey || "";
    const sortDirection = params?.sortDirection || undefined;
    ({ areas, tiposArea } = await getAreasPageData(session, { sortKey, sortDirection }));
  } catch (error) {
    console.error("Error loading areas data:", error);
    return (
      <ErrorAlert 
        title="Error al cargar áreas"
        message="No se pudieron cargar los datos de áreas. Verifique la conexión a la base de datos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Áreas</h1>
        <p className="text-muted-foreground">
          Administra las áreas del sistema, tipos, jerarquías y asignación de jefes.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <AreaTable data={areas} tiposArea={tiposArea} />
      </Suspense>
    </div>
  );
}
