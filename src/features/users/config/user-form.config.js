
import { USER_CONFIG } from "./user.constants";
import { searchVisibleAreas } from "@/features/areas/actions/area-read.action";

/**
 * Generates default values for the user form.
 * @param {Object|null} user - The user object (if editing).
 * @returns {Object} Default values for the form.
 */
export const getUserDefaultValues = (user) => ({
  id: user?.id || "",
  nombre: user?.nombre || "",
  apellido: user?.apellido || "",
  cedula: user?.cedula || "",
  rol_id: user?.rol_id ? user.rol_id.toString() : "",
  email: user?.email || "",
  area_id: user?.area_id || "",
  turno_id: user?.turnos?.id || user?.turno_id || "",
  es_activo: user?.es_activo ?? true,
  biometric_id: user?.biometric_id || USER_CONFIG.UI.LABELS.NOT_LINKED,
});

export const getUserFormConfig = (areas = [], turnos = [], roles = [], user = null) => [
  // Row 1: Personal Information
  [
    { name: "nombre", label: "Nombre", placeholder: "Ej: Juan", component: "input" },
    { name: "apellido", label: "Apellido", placeholder: "Ej: Pérez", component: "input" },
  ],
  // Row 2: Identification and Contact
  [
    { name: "cedula", label: "Cédula", placeholder: "Ej: 123456789", component: "input" },
    { name: "email", label: "Email", placeholder: "juan@empresa.com", type: "email", component: "input" },
  ],
  // Row 3: Organization & Role
  [
    { 
      name: "area_id", 
      label: "Área", 
      placeholder: "Seleccionar Área", 
      component: "async-select", 
      fetcher: searchVisibleAreas,
      getLabel: (area) => area.nombre,
      getValue: (area) => area.id,
      renderOption: (area) => (
        <div className="flex flex-col">
          <span className="font-medium">{area.nombre}</span>
          <span className="text-xs text-muted-foreground">
            {area.cat_tipos_area?.nombre || 'Sin Tipo'} 
            {area.cat_tipos_area?.nivel_jerarquico ? ` (Nivel ${area.cat_tipos_area.nivel_jerarquico})` : ''}
          </span>
        </div>
      ),
    },
    { 
      name: "rol_id", 
      label: "Rol", 
      placeholder: "Seleccionar Rol", 
      component: "select", 
      options: roles.map(r => ({ label: r.nombre, value: r.id.toString() })) 
    },
  ],
  // Row 4: Shift
  [
    { 
      name: "turno_id", 
      label: "Turno", 
      placeholder: "Seleccionar Turno", 
      component: "select", 
      options: turnos.map(t => ({ 
        label: `${t.nombre}`, 
        value: t.id 
      })) 
    },
  ],
  // Row 5: Biometric ID (Only if user exists)
  user ? [
    {
      name: "biometric_id",
      label: "ID Biométrico (Sincronizado)",
      value: user.biometric_id || USER_CONFIG.UI.LABELS.NOT_LINKED,
      component: "input",
      disabled: true,
      className: "bg-muted text-muted-foreground px-4 py-2"
    }
  ] : [],
  // Row 5: Status
  [
    {
      name: "es_activo",
      label: "Estado del Usuario",
      component: "switch",
      description: (val) => val ? "Usuario activo en el sistema" : "Usuario inactivo (no marca asistencia)"
    }
  ]
].filter(row => row.length > 0);
