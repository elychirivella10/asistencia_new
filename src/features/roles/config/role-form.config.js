import { ROLE_CONFIG } from "./role.constants";

export const getRoleFormConfig = (permissions = []) => {
  const { FORM } = ROLE_CONFIG.UI.LABELS;

  return [
    [
      { 
        name: "nombre", 
        label: FORM.FIELDS.NAME, 
        placeholder: FORM.PLACEHOLDERS.NAME, 
        component: "input" 
      }
    ],
    [
      { 
        name: "descripcion", 
        label: FORM.FIELDS.DESCRIPTION, 
        placeholder: FORM.PLACEHOLDERS.DESCRIPTION, 
        component: "textarea" 
      }
    ],
    [
      {
        name: "permisos",
        label: FORM.FIELDS.PERMISSIONS,
        component: "permission-selector",
        options: permissions.map(p => ({ 
          id: p.id, 
          label: p.slug, 
          description: p.descripcion 
        })),
      }
    ]
  ];
};
