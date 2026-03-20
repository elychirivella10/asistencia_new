# User Bulk Action Documentation

## Ubicación
`src/features/users/actions/user-bulk.action.js`

## Descripción
Este archivo contiene Server Actions para realizar operaciones masivas sobre usuarios, como la asignación de áreas a múltiples usuarios simultáneamente.

## Funciones

### `assignUsersToArea`

**Descripción:**
Asigna masivamente un área específica a una lista de usuarios seleccionados. Valida los datos de entrada usando Zod y delega la lógica de negocio al servicio `user.service`.

**Parámetros:**
- `userIds` (Array<string>): Lista de IDs de los usuarios a actualizar.
- `areaId` (string): ID del área a asignar.

**Retorno:**
- `Promise<{ success: boolean, error?: string, message?: string }>`

**Flujo:**
1. Valida los parámetros de entrada (`userIds`, `areaId`) usando `bulkAssignSchema`.
2. Si la validación falla, retorna un error.
3. Llama a `bulkAssignArea` del servicio `user.service`.
4. Si la operación es exitosa, revalida la ruta `/usuarios` para actualizar la UI.
5. Retorna el resultado de la operación.
