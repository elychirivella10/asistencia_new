import { Suspense } from "react";
import { getAttendancePageData } from "@/features/attendance/services/attendance-read.service";
import { AttendanceTableView } from "@/features/attendance/components/AttendanceTableView";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ATTENDANCE_CONFIG } from "@/features/attendance/config/attendance.constants";

export const metadata = {
  title: "Control de Asistencias | Biométrico",
  description: "Registro diario de asistencia y puntualidad",
};

export default async function AsistenciasPage({ searchParams }) {
  const { authorized, session } = await checkPageAccess(ATTENDANCE_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  const params = (await searchParams) || {};

  const from = params.from || undefined;
  const to = params.to || undefined;
  const areaId = params.areaId;
  const searchTerm = params.searchTerm;
  const status = params.status;
  const llegada = params.llegada;
  const salida = params.salida;
  const excepcion = params.excepcion;
  const sortKey = params.sortKey || "";
  const sortDirection = params.sortDirection || undefined;
  const page = params.page ? Number(params.page) : 1;
  const pageSize = params.pageSize ? Number(params.pageSize) : ATTENDANCE_CONFIG.UI.ITEMS_PER_PAGE;

  let areas, attendanceData, statusMap, stats, totalCount, totalPages;
  try {
    ({ areas, attendanceData, statusMap, stats, totalCount, totalPages } = await getAttendancePageData(session, {
      from,
      to,
      areaId,
      searchTerm,
      status,
      llegada,
      salida,
      excepcion,
      sortKey,
      sortDirection,
      page,
      pageSize
    }));
  } catch (error) {
    console.error("Error loading attendance data:", error);
    return (
      <ErrorAlert
        title="Error al cargar asistencias"
        message="No se pudieron cargar los registros de asistencia. Inténtelo más tarde."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Control de Asistencias</h1>
        <p className="text-muted-foreground">
          Visualización de registros diarios de asistencia.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <AttendanceTableView
          data={attendanceData}
          statusMap={statusMap}
          areas={areas}
          stats={stats}
          pagination={{ page, pageSize, totalPages, totalCount }}
        />
      </Suspense>
    </div>
  );
}
