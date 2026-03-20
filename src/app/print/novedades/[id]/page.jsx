import { getIncidentById } from "@/features/incidents/services/incident-read.service";
import { notFound } from "next/navigation";
import { IncidentPrintView } from "@/features/incidents/components/print/IncidentPrintView";
import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";

export default async function PrintNovedadPage({ params }) {
  const { authorized } = await checkPageAccess('incidents:read');

  if (!authorized) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const incident = await getIncidentById(id);

  if (!incident) {
    notFound();
  }

  return <IncidentPrintView incident={incident} />;
}
