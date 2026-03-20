# Area Validation Service Documentation

## Ubicación
`src/features/areas/services/area-validation.service.js`

## Descripción
Contiene la lógica crítica de validación para mantener la integridad de la jerarquía de áreas y dependencias.

## Funciones

### `validateAreaHierarchy`
- **Descripción:** Asegura que la estructura organizacional sea coherente.
- **Reglas:**
  1. Un área no puede depender de un padre con menor o igual jerarquía (Nivel Padre < Nivel Hijo).
  2. Al cambiar el tipo de un área, valida que no rompa la jerarquía con sus hijos existentes.

### `validateAreaDeletion`
- **Descripción:** Previene la eliminación de áreas en uso.
- **Bloqueos:**
  - Si tiene sub-áreas (hijas).
  - Si tiene usuarios asignados.
