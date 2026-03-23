import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { ReportesView } from "@/features/reports/components/ReportesView";
import { getReportPageData } from "@/features/reports/services/report-read.service";
import { getNovedadesPageData } from "@/features/reports/services/novedades-read.service";
import { REPORT_CONFIG } from "@/features/reports/config/report.constants";

export const metadata = {
  title: "Módulo de Reportes | Biométrico",
  description: "Generación y exportación de asistencia consolidada y novedades de los empleados.",
};

export default async function ReportesPage() {
  const { authorized, session } = await checkPageAccess(REPORT_CONFIG.PERMISSIONS.READ);

  if (!authorized) {
    return <AccessDenied />;
  }

  let areas = [];
  let statusMap = {};
  let tiposPermiso = [];

  try {
    const [reportRes, novedadesRes] = await Promise.all([
      getReportPageData(session),
      getNovedadesPageData()
    ]);

    if (!novedadesRes.success || !reportRes.areas) {
      throw new Error(novedadesRes.error || "Error cargando catálogos de reportes");
    }

    areas = reportRes.areas;
    statusMap = reportRes.statusMap;
    tiposPermiso = novedadesRes.tiposPermiso;

  } catch (error) {
    console.error("Error loading report page data:", error);
    return (
      <ErrorAlert
        title="Error al cargar los datos del módulo"
        message="No se pudieron cargar las áreas o estados. Inténtelo más tarde."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Centro de Reportes</h1>
        <p className="text-muted-foreground">
          Generación y exportación de reportes del sistema en Excel y PDF.
        </p>
      </div>

      <ReportesView areas={areas} statusMap={statusMap} tiposPermiso={tiposPermiso} />
    </div>
  );
}
