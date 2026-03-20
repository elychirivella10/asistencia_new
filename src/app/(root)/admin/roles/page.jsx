import { Suspense } from "react";
import { getRolesPageData } from "@/features/roles/services/role-read.service";
import { RoleTable } from "@/features/roles/components/RoleTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { checkPageAccess } from "@/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { ROLE_CONFIG } from "@/features/roles/config/role.constants";

export const metadata = {
  title: "Gestión de Roles y Permisos",
  description: "Administración de roles y asignación de permisos del sistema",
};

export default async function RolesPage({ searchParams }) {
  const { authorized } = await checkPageAccess(ROLE_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let roles, permissions;
  try {
    const params = await searchParams;
    const sortKey = params?.sortKey || "";
    const sortDirection = params?.sortDirection || undefined;
    ({ roles, permissions } = await getRolesPageData({ sortKey, sortDirection }));
  } catch (error) {
    console.error("Error loading roles data:", error);
    return (
      <ErrorAlert 
        title="Error al cargar roles"
        message="No se pudieron cargar los datos de roles. Verifique la conexión a la base de datos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
        <p className="text-muted-foreground">
          Administra los roles del sistema y asigna permisos a cada uno.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <RoleTable data={roles} permissions={permissions} />
      </Suspense>
    </div>
  );
}
