import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CalendarCheck, AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react";

export function AttendanceStats({ stats }) {
  if (!stats || !stats.totalRecords) return null;

  const {
    uniqueEmployees,
    totalPuntuales,
    totalTardias,
    totalFaltas,
    pctPuntualidad,
    totalHoras,
    totalHorasNeto,
    totalDescuento,
    totalHorasExtras,
    totalHorasDebe,
    saldoHoras,
  } = stats;

  const saldoLabel = `${saldoHoras > 0 ? "+" : ""}${saldoHoras || 0}h`;
  const saldoClass = saldoHoras > 0 ? "text-success" : saldoHoras < 0 ? "text-destructive" : "";
  const saldoSub = `Extras ${totalHorasExtras || 0}h · Debe ${totalHorasDebe || 0}h`;

  const items = [
    { title: "Empleados", value: uniqueEmployees, sub: "Activos en periodo", Icon: Users, iconClass: "text-info" },
    { title: "Horas Bruto", value: `${totalHoras}h`, sub: "Tiempo acumulado", Icon: Clock, iconClass: "text-info" },
    { title: "Horas Neto", value: `${totalHorasNeto}h`, sub: "Con descuento de comedor", Icon: Clock, iconClass: "text-info" },
    { title: "Balance", value: saldoLabel, sub: saldoSub, Icon: CalendarCheck, iconClass: "text-info", valueClass: saldoClass },
    { title: "Descuento Comedor", value: `${totalDescuento}m`, sub: "Minutos descontados", Icon: MinusCircle, iconClass: "text-warning" },
    { title: "Puntualidad", value: `${pctPuntualidad}%`, sub: `${totalPuntuales} registros`, Icon: CheckCircle2, iconClass: "text-success", valueClass: "text-success" },
    { title: "Tardías", value: totalTardias, sub: "Requieren atención", Icon: AlertTriangle, iconClass: "text-warning", valueClass: "text-warning" },
    { title: "Inasistencias", value: totalFaltas, sub: "Faltas registradas", Icon: AlertTriangle, iconClass: "text-destructive", valueClass: "text-destructive" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8 mb-6">
      {items.map(({ title, value, sub, Icon, iconClass, valueClass }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${iconClass}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${valueClass || ""}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
