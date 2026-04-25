import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CalendarCheck, AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react";
import { ATTENDANCE_CONFIG } from "../config/attendance.constants";

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

  const { UI: { LABELS } } = ATTENDANCE_CONFIG;
  const { STATS } = LABELS;

  const isPositive = saldoHoras >= 0;
  const saldoLabel = `${Math.abs(saldoHoras)}h`;
  const saldoSub = isPositive ? "A favor" : "En contra";
  const saldoClass = isPositive ? "text-success" : "text-destructive";

  const items = [
    { title: STATS.EMPLOYEES, value: uniqueEmployees, sub: STATS.EMPLOYEES_SUB, Icon: Users, iconClass: "text-info" },
    { title: STATS.GROSS_HOURS, value: `${totalHoras}h`, sub: STATS.GROSS_HOURS_SUB, Icon: Clock, iconClass: "text-info" },
    { title: STATS.NET_HOURS, value: `${totalHorasNeto}h`, sub: STATS.NET_HOURS_SUB, Icon: Clock, iconClass: "text-info" },
    { title: STATS.BALANCE, value: saldoLabel, sub: saldoSub, Icon: CalendarCheck, iconClass: "text-info", valueClass: saldoClass },
    { title: STATS.DINING_DISCOUNT, value: `${totalDescuento}m`, sub: STATS.DINING_DISCOUNT_SUB, Icon: MinusCircle, iconClass: "text-warning" },
    { title: STATS.PUNCTUALITY, value: `${pctPuntualidad}%`, sub: `${totalPuntuales} ${LABELS.ENTITY_NAME}`, Icon: CheckCircle2, iconClass: "text-success", valueClass: "text-success" },
    { title: STATS.LATE_ARRIVALS, value: totalTardias, sub: STATS.LATE_ARRIVALS_SUB, Icon: AlertTriangle, iconClass: "text-warning", valueClass: "text-warning" },
    { title: STATS.ABSENCES, value: totalFaltas, sub: STATS.ABSENCES_SUB, Icon: AlertTriangle, iconClass: "text-destructive", valueClass: "text-destructive" },
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
