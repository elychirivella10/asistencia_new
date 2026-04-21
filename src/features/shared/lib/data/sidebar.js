import {
  ClipboardList,
  FileText,
  Users,
  Settings,
  Shield,
  Database,
  Building2,
  Eye,
  UserLock,
  BarChart3,
  Clock
} from "lucide-react"
import { ROUTES } from "@/features/shared/config/routes"

/**
 * Definición de items de navegación para el Sidebar.
 * Soporta anidamiento mediante la propiedad 'items'.
 */
export const navItems = [
  {
    title: "Asistencias",
    url: ROUTES.ATTENDANCE.path,
    permission: ROUTES.ATTENDANCE.permission,
    icon: ClipboardList,
  },
  {
    title: "Reportes",
    url: ROUTES.REPORTES.path,
    permission: ROUTES.REPORTES.permission,
    icon: FileText,
  },
  {
    title: "Novedades",
    url: ROUTES.INCIDENTS.path,
    permission: ROUTES.INCIDENTS.permission,
    icon: Users,
  },

  {
    title: "Configuración",
    url: "#",
    icon: Settings,
    isActive: true, // Indica que debe estar desplegado por defecto
    items: [
      {
        title: "Usuarios",
        url: ROUTES.ADMIN.USUARIOS.path,
        permission: ROUTES.ADMIN.USUARIOS.permission,
        icon: Users,
      },
      {
        title: "Permisos y Roles",
        url: ROUTES.ADMIN.ROLES.path,
        permission: ROUTES.ADMIN.ROLES.permission,
        icon: UserLock
      },
      {
        title: "Áreas",
        url: ROUTES.ADMIN.AREAS.path,
        permission: ROUTES.ADMIN.AREAS.permission,
        icon: Building2,
      },
      {
        title: "Supervisión",
        url: ROUTES.ADMIN.SUPERVISION.path,
        permission: ROUTES.ADMIN.SUPERVISION.permission,
        icon: Eye
      },
      {
        title: "Turnos",
        url: ROUTES.ADMIN.TURNOS.path,
        permission: ROUTES.ADMIN.TURNOS.permission,
        icon: Clock
      },
    ],
  },
]
