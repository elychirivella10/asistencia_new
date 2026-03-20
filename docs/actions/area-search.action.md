# Area Search Action Documentation

## Ubicación
`src/features/areas/actions/area-search.action.js`

## Descripción
Maneja la búsqueda de áreas, específicamente para encontrar áreas padre válidas durante la creación o edición de una jerarquía.

## Funciones

### `searchParentAreas`

**Descripción:**
Busca áreas que puedan servir como padre para otra área, respetando reglas de jerarquía.

**Parámetros:**
- `term` (string): Término de búsqueda (nombre del área).
- `currentAreaId` (string, opcional): ID del área que se está editando. Se usa para excluirse a sí misma de los resultados.
- `selectedNivel` (number, opcional): Nivel jerárquico del tipo de área que se está asignando. Sirve para filtrar candidatos válidos (padres con mayor jerarquía/menor nivel).

**Retorno:**
- `Promise<Array>`: Lista de áreas candidatas.

**Flujo:**
1. Delega completamente la lógica de búsqueda y filtrado al servicio `findParentAreas` en `area.service.js`.
