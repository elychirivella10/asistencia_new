import { DIAS_LABORALES } from "./shift.constants";

export const getShiftFormConfig = () => {
  return [
    [
      { name: "nombre", label: "Nombre del Turno", placeholder: "Ej: Administrativo, Operativo Noche", component: "input" },
      { name: "margen_tolerancia_min", label: "Margen de Tolerancia (min)", placeholder: "Ej: 15", component: "input", type: "number" }
    ],
    [
      { name: "hora_entrada", label: "Hora de Entrada", component: "input", type: "time" },
      { name: "hora_salida", label: "Hora de Salida", component: "input", type: "time" },
    ],
    [
      {
        name: "dias_laborales",
        label: "Días Laborales",
        description: "Seleccione los días correspondientes a este turno.",
        component: "checkbox-group",
        options: DIAS_LABORALES
      }
    ],
    [
      {
        name: "cruza_medianoche",
        label: "Turno Nocturno (Cruza la Medianoche)",
        description: "Active esta opción si el turno comienza un día y culmina al día siguiente.",
        component: "checkbox"
      }
    ]
  ];
};
