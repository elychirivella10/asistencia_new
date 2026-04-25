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
  },
  UI: {
    LABELS: {
      FORM: {
        FIELDS: {
          NAME: 'Nombre del Turno',
          TOLERANCE: 'Margen de Tolerancia (min)',
          START_TIME: 'Hora de Entrada',
          END_TIME: 'Hora de Salida',
          WORKING_DAYS: 'Días Laborales',
          NIGHT_SHIFT: 'Turno Nocturno (Cruza la Medianoche)',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Administrativo, Operativo Noche',
          TOLERANCE: 'Ej: 15',
        },
        DESCRIPTIONS: {
          WORKING_DAYS: 'Seleccione los días correspondientes a este turno.',
          NIGHT_SHIFT: 'Active esta opción si el turno comienza un día y culmina al día siguiente.',
        }
      },
      TABLE: {
        NAME: 'Nombre del Turno',
        SCHEDULE: 'Horario',
        NIGHT: 'Nocturno',
        DAYS: 'Días Laborales',
        TOLERANCE: 'Tolerancia (min)',
        ACTIONS: 'Acciones',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar turnos...',
        NEW_BUTTON: 'Nuevo Turno',
        SEARCH_LABEL: 'Búsqueda de Turnos',
        DIVIDER_FILTERS: 'Configuración de Filtros',
        DIVIDER_SEARCH: 'Buscar por Nombre',
        DIVIDER_ACTIONS: 'Acciones de Turnos',
      }
    }
  }
};
