import { DIAS_LABORALES, SHIFT_CONFIG } from "./shift.constants";

export const getShiftFormConfig = () => {
  const { FORM } = SHIFT_CONFIG.UI.LABELS;

  return [
    [
      { name: "nombre", label: FORM.FIELDS.NAME, placeholder: FORM.PLACEHOLDERS.NAME, component: "input" },
      { name: "margen_tolerancia_min", label: FORM.FIELDS.TOLERANCE, placeholder: FORM.PLACEHOLDERS.TOLERANCE, component: "input", type: "number" }
    ],
    [
      { name: "hora_entrada", label: FORM.FIELDS.START_TIME, component: "input", type: "time" },
      { name: "hora_salida", label: FORM.FIELDS.END_TIME, component: "input", type: "time" },
    ],
    [
      {
        name: "dias_laborales",
        label: FORM.FIELDS.WORKING_DAYS,
        description: FORM.DESCRIPTIONS.WORKING_DAYS,
        component: "checkbox-group",
        options: DIAS_LABORALES
      }
    ],
    [
      {
        name: "cruza_medianoche",
        label: FORM.FIELDS.NIGHT_SHIFT,
        description: FORM.DESCRIPTIONS.NIGHT_SHIFT,
        component: "checkbox"
      }
    ]
  ];
};
