import { ATTENDANCE_CONFIG } from '@/features/attendance/config/attendance.constants'
import { REPORT_CONFIG } from '@/features/reports/config/report.constants'
import { INCIDENT_CONFIG } from '@/features/incidents/config/incidents.constants'
import { USER_CONFIG } from '@/features/users/config/user.constants'
import { ROLE_CONFIG } from '@/features/roles/config/role.constants'
import { AREA_CONFIG } from '@/features/areas/config/area.constants'
import { SUPERVISION_CONFIG } from '@/features/supervision/config/supervision.constants'
import { SHIFT_CONFIG } from '@/features/shifts/config/shift.constants'

export const ROUTES = {
  // Rutas Públicas
  AUTH: {
    LOGIN: { path: "/login" },
  },
  
  // Panel Principal
  DASHBOARD: { path: "/" },
  
  // Módulos Operativos
  ATTENDANCE: { path: "/asistencias", permission: ATTENDANCE_CONFIG.PERMISSIONS.READ },
  REPORTES: { path: "/reportes", permission: REPORT_CONFIG.PERMISSIONS.READ },
  INCIDENTS: { path: "/novedades", permission: INCIDENT_CONFIG.PERMISSIONS.READ },
  
  // Módulos Administrativos
  ADMIN: {
    USUARIOS: { path: "/admin/usuarios", permission: USER_CONFIG.PERMISSIONS.READ },
    AREAS: { path: "/admin/areas", permission: AREA_CONFIG.PERMISSIONS.READ },
    ROLES: { path: "/admin/roles", permission: ROLE_CONFIG.PERMISSIONS.READ },
    SUPERVISION: { path: "/admin/supervision", permission: SUPERVISION_CONFIG.PERMISSIONS.READ },
    TURNOS: { path: "/admin/turnos", permission: SHIFT_CONFIG.PERMISSIONS.READ },
  },
  
  // Configuración del Sistema
  CONFIG: {
    DATABASE: { path: "/config/database", permission: 'system:config' },
  }
};
