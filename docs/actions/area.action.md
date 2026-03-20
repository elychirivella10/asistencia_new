# Area Action Documentation

## Ubicación
`src/features/areas/actions/area.action.js`

## Descripción
Gestiona las operaciones CRUD de Áreas desde el servidor, asegurando la validación de datos y reglas de jerarquía antes de invocar a los servicios.

## Funciones

### `saveArea`

**Descripción:**
Server Action para crear o actualizar un área.

**Parámetros:**
- `prevState` (Object): Estado previo.
- `formData` (FormData): Datos del formulario.

**Retorno:**
- `Promise<{ success: boolean, error?: string, message?: string, details?: Object }>`

**Flujo:**
1. Extrae datos del formulario (`nombre`, `parent_id`, `jefe_id`, `tipo_id`).
2. Valida estructura con `areaSchema` (Zod).
3. Realiza validación de recursividad básica (id != parent_id).
4. Invoca `validateAreaHierarchy` para asegurar integridad de la estructura organizacional.
5. Si pasa validaciones, llama a `updateArea` o `createArea` según corresponda.
6. Revalida `/admin/areas`.

### `deleteArea`

**Descripción:**
Server Action para eliminar un área.

**Parámetros:**
- `id` (string): ID del área.

**Retorno:**
- `Promise<{ success: boolean, error?: string, message?: string }>`

**Flujo:**
1. Llama al servicio `deleteAreaService`.
2. Si es exitoso, revalida `/admin/areas`.
3. Retorna resultado.
