import { PrintButton } from "@/components/shared/PrintButton";
import { formatDateUTC, formatTimeUTC } from "@/lib/date-utils";

export function IncidentPrintView({ incident }) {
  // Para fechas locales (timestamps)
  const formatLocal = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            Comprobante de Novedad
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de Gestión Biométrica
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Folio #</div>
          <div className="text-xl font-mono">{incident.id.slice(0, 8)}</div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Columna Izquierda: Empleado */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Información del Empleado
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="mb-1">
              <span className="text-sm text-gray-500 block">Nombre</span>
              <span className="font-medium text-lg">
                {incident.usuario.nombre}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Cédula</span>
              <span className="font-mono">{incident.usuario.cedula}</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Detalles Novedad */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Detalles del Registro
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tipo</span>
              <span className="font-medium">{incident.cat_tipos_permiso.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Estado</span>
              <span className="font-medium px-2 py-0.5 rounded-full bg-gray-200 text-xs">
                {incident.estado}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Fecha Solicitud</span>
              <span className="font-medium">
                {formatLocal(incident.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fechas y Horas */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Periodo y Duración
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-2 px-4 text-left font-medium text-gray-500">
                  Fecha Inicio
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-500">
                  Fecha Fin
                </th>
                <th className="py-2 px-4 text-left font-medium text-gray-500">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-r">
                  {formatDateUTC(incident.fecha_inicio)}
                  {!incident.es_dia_completo && incident.hora_inicio && (
                    <span className="block text-gray-400 text-xs">
                      {formatTimeUTC(incident.hora_inicio)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-r">
                  {formatDateUTC(incident.fecha_fin)}
                  {!incident.es_dia_completo && incident.hora_fin && (
                    <span className="block text-gray-400 text-xs">
                      {formatTimeUTC(incident.hora_fin)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {incident.es_dia_completo ? (
                    <span className="text-green-600 font-medium">
                      Día Completo
                    </span>
                  ) : (
                    <span className="text-blue-600 font-medium">Parcial</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Observaciones */}
      {incident.observaciones && (
        <div className="mb-12">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Observaciones
          </h2>
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-gray-700 italic">
            &quot;{incident.observaciones}&quot;
          </div>
        </div>
      )}

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-16 mt-20 print:mt-32">
        <div className="text-center border-t pt-4">
          <p className="font-medium">{incident.usuario.nombre}</p>
          <p className="text-xs text-gray-400 uppercase mt-1">Firma Empleado</p>
        </div>
        <div className="text-center border-t pt-4">
          <p className="font-medium">
            {incident.aprobado_por || "Administración"}
          </p>
          <p className="text-xs text-gray-400 uppercase mt-1">
            Firma Aprobador
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-gray-300 border-t pt-4 print:fixed print:bottom-4 print:left-0 print:w-full">
        <p>Generado automáticamente por el Sistema Biométrico</p>
        <p>{new Date().toLocaleString()}</p>
      </div>

      {/* Botón Imprimir (Oculto al imprimir) */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
