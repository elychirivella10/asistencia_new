export const DIAS_LABORALES = [
  { id: 1, value: 1, label: "Lunes", short: "Lun" },
  { id: 2, value: 2, label: "Martes", short: "Mar" },
  { id: 3, value: 3, label: "Miércoles", short: "Mié" },
  { id: 4, value: 4, label: "Jueves", short: "Jue" },
  { id: 5, value: 5, label: "Viernes", short: "Vie" },
  { id: 6, value: 6, label: "Sábado", short: "Sáb" },
  { id: 7, value: 7, label: "Domingo", short: "Dom" },
];

export const SHIFT_DEFAULT_VALUES = {
  nombre: "",
  hora_entrada: "08:00",
  hora_salida: "17:00",
  margen_tolerancia_min: 15,
  dias_laborales: [1, 2, 3, 4, 5], // De Lunes a Viernes por defecto
  cruza_medianoche: false,
};

export const SHIFT_CONFIG = {
  PERMISSIONS: {
    READ: 'shifts:read',
    CREATE: 'shifts:create',
    UPDATE: 'shifts:update',
    DELETE: 'shifts:delete',
  }
};
