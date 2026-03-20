export const getRoleFormConfig = (permissions = []) => {
  return [
    [
      { 
        name: "nombre", 
        label: "Nombre del Rol", 
        placeholder: "Ej: Administrador", 
        component: "input" 
      }
    ],
    [
      { 
        name: "descripcion", 
        label: "Descripción", 
        placeholder: "Descripción del rol...", 
        component: "textarea" 
      }
    ],
    [
      {
        name: "permisos",
        label: "Permisos del Sistema",
        component: "checkbox-group",
        options: permissions.map(p => ({ 
          id: p.id, 
          label: p.slug, 
          description: p.descripcion 
        })),
      }
    ]
  ];
};
