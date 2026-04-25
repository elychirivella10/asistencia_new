import { searchUsers } from "@/features/users/actions/user-read.action";
import { INCIDENT_CONFIG } from "./incidents.constants";

export const getIncidentFormConfig = (incidentTypes = []) => {
  const { FORM } = INCIDENT_CONFIG.UI.LABELS;

  return [
    [
      {
        name: "usuario_id",
        label: FORM.FIELDS.EMPLOYEE,
        placeholder: FORM.PLACEHOLDERS.SEARCH_EMPLOYEE,
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
        label: FORM.FIELDS.TYPE,
        placeholder: FORM.PLACEHOLDERS.SELECT_TYPE,
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
        label: FORM.FIELDS.FROM,
        component: "date",
        type: "date",
      },
      {
        name: "fecha_fin",
        label: FORM.FIELDS.TO,
        component: "date",
        type: "date",
      },
    ],
    [
      {
        name: "es_dia_completo",
        label: FORM.FIELDS.FULL_DAY,
        description: FORM.DESCRIPTIONS.FULL_DAY,
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
        label: FORM.FIELDS.START_TIME,
        component: "input",
        type: "time",
        showIf: (values) => !values.es_dia_completo,
      },
      {
        name: "hora_fin",
        label: FORM.FIELDS.END_TIME,
        component: "input",
        type: "time",
        showIf: (values) => !values.es_dia_completo,
      },
    ],
    [
      {
        name: "observaciones",
        label: FORM.FIELDS.OBSERVATIONS,
        placeholder: FORM.PLACEHOLDERS.OBSERVATIONS,
        component: "textarea",
      },
    ],
  ];
};
