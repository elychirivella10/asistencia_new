import { searchUsers } from "@/features/users/actions/user-read.action";
import { searchParentAreas } from "@/features/areas/actions/area-read.action";

export const getAreaFormConfig = (areas = [], currentAreaId = null, tiposArea = [], selectedTipoId = null) => {
  // 1. Obtener nivel del tipo seleccionado
  const selectedTipo = tiposArea.find(t => String(t.id) === String(selectedTipoId));
  const selectedNivel = selectedTipo ? selectedTipo.nivel_jerarquico : null;

  // 2. Filtrar padres válidos (solo aquellos con nivel numéricamente MENOR = mayor jerarquía)
  //    Además, evitar seleccionarse a sí mismo.
  // NOTA: Esta lógica ahora también se maneja en el servidor (searchParentAreas),
  // pero mantenemos parentOptions vacío o irrelevante ya que usaremos async-select.
  // const parentOptions = ... (YA NO SE USA DIRECTAMENTE EN SELECT SÍNCRONO)

  const tipoOptions = tiposArea.map(t => ({
    label: t.nombre,
    value: String(t.id) 
  }));

  return [
    [
      { name: "nombre", label: "Nombre del Área", placeholder: "Ej: Recursos Humanos", component: "input" },
      {
        name: "tipo_id",
        label: "Tipo de Área",
        placeholder: "Seleccionar Tipo",
        component: "select",
        options: tipoOptions,
      }
    ],
    [
      {
        name: "parent_id",
        label: "Área Padre (Opcional)",
        placeholder: "Buscar Área Superior...",
        component: "async-select",
        // Vinculamos los parámetros contextuales al fetcher
        fetcher: (term) => searchParentAreas(term, currentAreaId, selectedNivel),
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
        label: "Jefe de Área",
        placeholder: "Buscar usuario...",
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
      }
    ]
  ];
};
