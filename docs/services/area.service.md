# Area Service Documentation

## Ubicación
`src/features/areas/services/area.service.js`

## Descripción
Maneja la persistencia y consultas de Áreas. Centraliza las operaciones de base de datos para mantener los Actions limpios.

## Funciones

### `getAreas`
- **Descripción:** Obtiene todas las áreas con sus relaciones (padre, jefe, tipo).
- **Orden:** Alfabético por nombre.

### `getAreaTypes`
- **Descripción:** Obtiene el catálogo de tipos de área.

### `createArea` / `updateArea`
- **Descripción:** Crea o actualiza un registro de área en la DB.

### `deleteArea`
- **Descripción:** Elimina un área.
- **Validación:** Precede la eliminación con `validateAreaDeletion`.

### `findParentAreas`
- **Descripción:** Busca áreas candidatas para ser padre de otra.
- **Lógica:**
  - Filtra por nombre (si hay término de búsqueda).
  - Excluye el área actual (si se está editando).
  - **Filtro Jerárquico:** Si se especifica un nivel, solo retorna áreas con nivel numérico menor (mayor jerarquía).
