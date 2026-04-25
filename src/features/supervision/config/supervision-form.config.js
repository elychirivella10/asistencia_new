import { searchUsers } from "@/features/users/actions/user-read.action";
import { searchVisibleAreas } from "@/features/areas/actions/area-read.action";
import { SUPERVISION_CONFIG } from "./supervision.constants";

export const getSupervisionFormConfig = () => {
  const { FORM } = SUPERVISION_CONFIG.UI.LABELS;

  return [
    [
      {
        name: "usuario_id",
        label: FORM.FIELDS.SUPERVISOR,
        placeholder: FORM.PLACEHOLDERS.SEARCH_SUPERVISOR,
        component: "async-select",
        fetcher: searchUsers,
        getLabel: (user) => `${user.nombre} ${user.apellido} (${user.cedula})`,
        getValue: (user) => user.id,
        renderOption: (user) => (
            <div className="flex flex-col">
                <span className="font-medium">{user.nombre} {user.apellido}</span>
                <span className="text-xs text-muted-foreground">{user.cedula} - {user.email}</span>
            </div>
        ),
      },
      {
        name: "area_id",
        label: FORM.FIELDS.AREA,
        placeholder: FORM.PLACEHOLDERS.SEARCH_AREA,
        component: "async-select",
        fetcher: searchVisibleAreas,
        getLabel: (area) => area.nombre,
        getValue: (area) => area.id,
        renderOption: (area) => (
            <div className="flex flex-col">
                <span className="font-medium">{area.nombre}</span>
                <span className="text-xs text-muted-foreground">
                  {area.cat_tipos_area?.nombre || 'Sin Tipo'} 
                </span>
            </div>
        ),
      }
    ]
  ];
};
