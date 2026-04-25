/**
 * Configuración centralizada para el módulo de Usuarios.
 */

export const USER_CONFIG = {
  // Permisos requeridos
  PERMISSIONS: {
    READ: 'users:read',
    READ_ALL: 'users:read_all',
    WRITE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_BIOMETRICS: 'users:biometrics',
  },

  // Estados de usuario
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Configuración de visualización (Frontend)
  UI: {
    BADGE_VARIANTS: {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
    },
    LABELS: {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      NO_ROLE: 'Sin Rol',
      NO_AREA: 'Sin Área',
      NOT_LINKED: 'No vinculado',
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre',
          LASTNAME: 'Apellido',
          CEDULA: 'Cédula',
          EMAIL: 'Email',
          AREA: 'Área',
          ROLE: 'Rol',
          SHIFT: 'Turno',
          BIOMETRIC: 'ID Biométrico (Sincronizado)',
          STATUS: 'Estado del Usuario',
          EXEMPT_LATE: 'Exento de Tardanza/Inasistencia',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Juan',
          LASTNAME: 'Ej: Pérez',
          CEDULA: 'Ej: 123456789',
          EMAIL: 'juan@empresa.com',
          SELECT_AREA: 'Seleccionar Área',
          SELECT_ROLE: 'Seleccionar Rol',
          SELECT_SHIFT: 'Seleccionar Turno',
        },
        DESCRIPTIONS: {
          ACTIVE: 'Usuario activo en el sistema',
          INACTIVE: 'Usuario inactivo (no marca asistencia)',
          EXEMPT: 'Si se activa, el supervisor no recibirá notificaciones por sus llegadas fuera de hora.',
        }
      },
      TABLE: {
        NAME: 'Nombre Completo',
        CEDULA: 'Cédula',
        EMAIL: 'Email',
        AREA: 'Área',
        SHIFT: 'Horario',
        ROLE: 'Rol',
        BIOMETRIC: 'ID Biométrico',
        STATUS: 'Estado',
        ACTIONS: 'Acciones',
        EMPTY_SEARCH: 'No se encontraron usuarios.',
        EMPTY_DATA: 'No hay usuarios registrados.',
        ENTITY_NAME: 'usuarios',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar por nombre o cédula...',
        AREA_PLACEHOLDER: 'Filtrar por Área',
        STATUS_LABEL: 'Estado',
        STATUS_ALL: 'Todos los Estados',
        STATUS_ACTIVE: 'Activos',
        STATUS_INACTIVE: 'Inactivos',
        NEW_BUTTON: 'Nuevo Usuario',
        SEARCH_LABEL: 'Búsqueda de Personal',
        DIVIDER_FILTERS: 'Filtros de Búsqueda',
        DIVIDER_SEARCH: 'Búsqueda Rápida',
        DIVIDER_ACTIONS: 'Acciones Disponibles',
      },
      BIOMETRICS: {
        TITLE: 'Gestión Biométrica',
        PUSH_BUTTON: 'Sincronizar con Reloj',
        SYNC_TEMPLATES: 'Recuperar Huellas del Reloj',
        FINGER_INDEX: 'Dedo',
        STATUS: 'Estado',
        ACTIONS: 'Acciones',
        REGISTERED: 'Registrada',
        NOT_REGISTERED: 'No registrada',
        DELETE_TITLE: 'Borrar Huella',
        DELETE_MSG: '¿Estás seguro de que deseas borrar esta huella del reloj y de la base de datos?',
        MESSAGES: {
          PUSHING: 'Enviando usuarios al reloj...',
          PULLING: 'Descargando huellas del reloj...',
          SYNCING_TOTAL: 'Sincronizando con reloj biométrico...',
          PUSH_SUCCESS: 'Usuarios enviados al reloj exitosamente.',
          PULL_SUCCESS: 'Huellas descargadas exitosamente.',
          SYNC_SUCCESS: 'Sincronización total completada con éxito.',
          SYNC_ERROR: 'Error en sincronización: ',
          SERVER_ERROR: 'Error inesperado en la comunicación con el servidor.',
          BLOCK_TITLE: 'Sincronizando Biométrica',
          BLOCK_DESC: 'Por favor, no cierre esta pantalla. Esto puede tardar varios segundos dependiendo del hardware.'
        },
        ACTIONS: {
          TITLE: 'Acciones',
          DEVICE_MANAGEMENT: 'Gestión de Dispositivos',
          PULL: 'Bajar Huellas (Reloj → Web)',
          PUSH: 'Subir Usuarios (Web → Reloj)',
          TOTAL: 'Sincronización Total',
        }
      }
    }
  }
};
