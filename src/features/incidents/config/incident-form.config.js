import { searchUsers } from "@/features/users/actions/user-read.action";

export const getIncidentFormConfig = (incidentTypes = []) => {
  return [
    [
      {
        name: "usuario_id",
        label: "Empleado",
        placeholder: "Buscar empleado...",
        component: "async-select",
        fetcher: searchUsers,
        getLabel: (user) => `${user.nombre} ${user.apellido} (${user.cedula})`,
        getValue: (user) => user.id,
        renderOption: (user) => (
          <div className="flex flex-col">
            <span className="font-medium">{user.nombre} {user.apellido}</span>
            <span className="text-xs text-muted-foreground">CI: {user.cedula}</span>
          </div>
        ),
      },
    ],
    [
      {
        name: "tipo",
        label: "Tipo de Novedad",
        placeholder: "Seleccione tipo",
        component: "select",
        options: incidentTypes.map((t) => ({
          label: t.nombre,
          value: String(t.id),
        })),
      },
    ],
    [
      {
        name: "fecha_inicio",
        label: "Fecha Desde",
        component: "date",
        type: "date",
      },
      {
        name: "fecha_fin",
        label: "Fecha Hasta",
        component: "date",
        type: "date",
      },
    ],
    [
      {
        name: "es_dia_completo",
        label: "Día Completo",
        description: "Aplica para toda la jornada",
        component: "switch",
        showIf: (values) => {
          if (!values.tipo) return false;
          const selectedTipo = incidentTypes.find(t => String(t.id) === String(values.tipo));
          return selectedTipo?.permite_parcial;
        }
      },
    ],
    [
      {
        name: "hora_inicio",
        label: "Hora Inicio",
        component: "input",
        type: "time",
        showIf: (values) => !values.es_dia_completo,
      },
      {
        name: "hora_fin",
        label: "Hora Fin",
        component: "input",
        type: "time",
        showIf: (values) => !values.es_dia_completo,
      },
    ],
    [
      {
        name: "observaciones",
        label: "Observaciones (Opcional)",
        placeholder: "Detalles adicionales...",
        component: "textarea",
      },
    ],
  ];
};
