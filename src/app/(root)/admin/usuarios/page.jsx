import { Suspense } from "react";
import { UserTable } from "@/features/users/components/UserTable";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { getUsersPageData } from "@/features/users/services/user-read.service";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { USER_CONFIG } from "@/features/users/config/user.constants";

export const metadata = {
  title: "Gestión de Usuarios | Biométrico",
  description: "Administración de usuarios, áreas y turnos.",
};

export default async function UsersPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(USER_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let users, areas, turnos, roles, totalCount, page, pageSize, totalPages;
  try {
    const params = (await searchParams) || {};
    const sortKey = params.sortKey || "";
    const sortDirection = params.sortDirection || undefined;
    const searchTerm = params.q || "";
    const areaId = params.areaId || "all";
    const status = params.status || "all";
    page = params.page ? Number(params.page) : 1;
    pageSize = params.pageSize ? Number(params.pageSize) : 10;

    ({
      users,
      areas,
      turnos,
      roles,
      totalCount,
      page,
      pageSize,
      totalPages,
    } = await getUsersPageData(session, {
      page,
      pageSize,
      searchTerm,
      areaId,
      status,
      sortKey,
      sortDirection,
    }));
  } catch (error) {
    console.error("Error loading users data:", error);
    return (
      <ErrorAlert 
        title="Error al cargar usuarios"
        message="No se pudieron cargar los datos de usuarios. Verifique la conexión a la base de datos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los usuarios del sistema, sus roles, áreas y turnos asignados.
        </p>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <UserTable 
          data={users} 
          areas={areas} 
          turnos={turnos} 
          roles={roles}
          pagination={{ page, pageSize, totalPages, totalCount }}
        />
      </Suspense>
    </div>
  );
}
