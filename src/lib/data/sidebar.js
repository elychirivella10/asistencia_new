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
  BarChart3
} from "lucide-react"
import { ROUTES } from "@/config/routes"

/**
 * Definición de items de navegación para el Sidebar.
 * Soporta anidamiento mediante la propiedad 'items'.
 */
export const navItems = [
  {
    title: "Asistencias",
    url: ROUTES.ATTENDANCE,
    icon: ClipboardList,
  },
  {
    title: "Reportes",
    url: ROUTES.REPORTES,
    icon: FileText,
  }, 
  {
    title: "Novedades",
    url: ROUTES.INCIDENTS,
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
        url: ROUTES.ADMIN.USUARIOS,
        icon: Users,
      },
      {
        title: "Permisos y Roles",
        url: ROUTES.ADMIN.ROLES,
        icon: UserLock
      },
      {
        title: "Áreas",
        url: ROUTES.ADMIN.AREAS,
        icon: Building2,
      },
      {
        title: "Supervisión",
        url: ROUTES.ADMIN.SUPERVISION,
        icon: Eye
      },
      {
        title: "Base de Datos",
        url: ROUTES.CONFIG.DATABASE,
        icon: Database
      },
    ],
  },
]
