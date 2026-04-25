import { searchUsers } from "@/features/users/actions/user-read.action";
import { AREA_CONFIG } from "./area.constants";

export const getAreaFormConfig = (areas = [], currentAreaId = null, tiposArea = [], selectedTipoId = null) => {
  // 1. Obtener nivel del tipo seleccionado
  const selectedTipo = tiposArea.find(t => String(t.id) === String(selectedTipoId));
  const selectedNivel = selectedTipo ? selectedTipo.nivel_jerarquico : null;

  const tipoOptions = tiposArea.map(t => ({
    label: t.nombre,
    value: String(t.id) 
  }));

  const { FORM } = AREA_CONFIG.UI.LABELS;

  return [
    [
      { name: "nombre", label: FORM.FIELDS.NAME, placeholder: FORM.PLACEHOLDERS.NAME, component: "input" },
      {
        name: "tipo_id",
        label: FORM.FIELDS.TYPE,
        placeholder: FORM.PLACEHOLDERS.SELECT_TYPE,
        component: "select",
        options: tipoOptions,
      }
    ],
    [
      {
        name: "parent_id",
        label: FORM.FIELDS.PARENT,
        placeholder: FORM.PLACEHOLDERS.SEARCH_PARENT,
        component: "async-select",
        // Fetcher local: filtra las áreas que ya tenemos
        fetcher: async (term) => {
          const q = typeof term === "string" ? term.trim().toLowerCase() : "";
          const safeNivel = Number.isFinite(Number(selectedNivel)) ? Number(selectedNivel) : null;

          return areas.filter(area => {
             // Coincidencia de nombre
             const matchesTerm = area.nombre.toLowerCase().includes(q);
             // No puede ser ella misma
             const isNotSelf = area.id !== currentAreaId;
             // Debe tener nivel jerárquico menor (LT) que el seleccionado
             const hasCorrectNivel = safeNivel === null || (area.cat_tipos_area?.nivel_jerarquico < safeNivel);

             return matchesTerm && isNotSelf && hasCorrectNivel;
          });
        },
        getLabel: (area) => `${area.nombre} (${area.cat_tipos_area?.nombre || 'Sin Tipo'})`,
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
        name: "jefe_id",
        label: FORM.FIELDS.CHIEF,
        placeholder: FORM.PLACEHOLDERS.SEARCH_CHIEF,
        component: "async-select",
        fetcher: searchUsers,
        getLabel: (user) => `${user.nombre} ${user.apellido}`,
        getValue: (user) => user.id,
        renderOption: (user) => (
            <div className="flex flex-col">
                <span>{user.nombre} {user.apellido}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
        ),
      },
      {
        name: "excluir_tardanza",
        label: FORM.FIELDS.EXEMPT_LATE,
        description: FORM.DESCRIPTIONS.EXEMPT,
        component: "checkbox"
      }
    ]
  ];
};
