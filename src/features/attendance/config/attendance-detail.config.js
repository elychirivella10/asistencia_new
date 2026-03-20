import { Badge } from "@/components/ui/badge";
import { formatDateUTC, formatTimeUTC, formatHM } from "@/features/shared/lib/date-utils";
import { ATTENDANCE_CONFIG } from "./attendance.constants";

// Archivo de configuración "inteligente".
// Toda la lógica de presentación y formato vive aquí, en las funciones `transform`.

export const attendanceDetailConfig = {
  sections: [
    {
      title: 'Información del Empleado',
      fields: [
        { label: 'Nombre', key: 'usuarios.nombre', transform: (data) => `${data.usuarios?.nombre || ''} ${data.usuarios?.apellido || ''}` },
        { label: 'Cédula', key: 'usuarios.cedula' },
        { label: 'Área', key: 'usuarios.areas_pertenece.nombre' },
      ],
    },
    {
      title: 'Detalles del Resumen Diario',
      fields: [
        { label: 'Fecha', key: 'fecha', transform: (data) => formatDateUTC(data.fecha) },
        {
          label: 'Hora Entrada',
          key: 'hora_entrada',
          transform: (data) => {
            const time = formatTimeUTC(data.hora_entrada);
            if (data.notificado_tardia) {
              return <span className={ATTENDANCE_CONFIG.BUSINESS.LATE_NOTIFICATION_COLOR}>{time}</span>;
            }
            return time;
          },
        },
        { label: 'Hora Salida', key: 'hora_salida', transform: (data) => formatTimeUTC(data.hora_salida) },
        {
          label: 'Estado del Día',
          key: 'estado',
          transform: (data, statusMap) => {
            const slug = data.estado?.toLowerCase();
            const statusInfo = (statusMap && statusMap[slug]) || { label: data.estado, color: ATTENDANCE_CONFIG.UI.DEFAULT_STATUS_COLOR };
            return (
              <Badge style={{ backgroundColor: statusInfo.color, color: 'white', borderColor: statusInfo.color }} className="hover:opacity-90 capitalize">
                {statusInfo.label}
              </Badge>
            );
          },
        },
        { label: 'Estado Llegada', key: 'llegada_slug' },
        { label: 'Estado Salida', key: 'salida_slug' },
      ],
    },
    {
      title: 'Cálculo de Horas',
      fields: [
        { label: 'Tiempo Bruto', key: 'minutos_trabajados', transform: (data) => formatHM(data.minutos_trabajados) },
        { label: 'Comedor', key: 'comedor_descuento_min', transform: (data) => `${data.comedor_descuento_min || 0} min` },
        { label: 'Tiempo Neto', key: 'minutos_trabajados_neto', transform: (data) => formatHM(data.minutos_trabajados_neto) },
        { label: 'Debe', key: 'minutos_debe', transform: (data) => `${data.minutos_debe || 0} min` },
        {
          label: 'Permiso',
          key: 'permiso_parcial_min',
          transform: (data) => (
            <Badge variant={(data.permiso_parcial_min || 0) > 0 ? "success" : "outline"}>
              {(data.permiso_parcial_min || 0) > 0 ? `Sí (${data.permiso_parcial_min} min)` : 'No'}
            </Badge>
          ),
        },
        {
          label: 'Saldo Final',
          key: 'saldo_minutos',
          transform: (data) => {
            const saldo = data.saldo_minutos || 0;
            let className = "font-bold";
            if (saldo > 0) className += " text-success";
            if (saldo < 0) className += " text-destructive";
            return <span className={className}>{`${saldo > 0 ? '+' : ''}${formatHM(saldo)}`}</span>;
          },
        },
      ],
    },
  ],
};