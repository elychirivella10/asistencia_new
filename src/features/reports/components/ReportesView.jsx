"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReportView } from "./AttendanceReportView";
import { NovedadesReportView } from "./NovedadesReportView";

/**
 * Main reports view with tab navigation.
 * Receives server-loaded data (areas, statusMap, tiposPermiso) and passes them to sub-views.
 */
export function ReportesView({ areas, statusMap, tiposPermiso }) {
  return (
    <Tabs defaultValue="asistencia" className="space-y-4">
      <TabsList className="bg-muted">
        <TabsTrigger value="asistencia">Asistencia Consolidada</TabsTrigger>
        <TabsTrigger value="novedades">Permisos y Novedades</TabsTrigger>
      </TabsList>

      <TabsContent value="asistencia" className="space-y-6 mt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Reporte Consolidado de Asistencia</h2>
          <p className="text-sm text-muted-foreground">
            Horas trabajadas, ausencias, tiempo en comedor y horas extra para nómina.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <AttendanceReportView areas={areas} statusMap={statusMap} />
        </Suspense>
      </TabsContent>

      <TabsContent value="novedades" className="space-y-6 mt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Historial de Novedades</h2>
          <p className="text-sm text-muted-foreground">
            Permisos aprobados, reposos, vacaciones y licencias.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <NovedadesReportView areas={areas} tiposPermiso={tiposPermiso} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
