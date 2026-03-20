# User Action Documentation

## Ubicación
`src/features/users/actions/user.action.js`

## Descripción
Este archivo maneja las acciones principales de gestión de usuarios (crear, editar, eliminar) desde el servidor. Actúa como orquestador entre la UI y la capa de servicios, encargándose de la validación de entrada (Zod) y el manejo de respuestas.

## Funciones

### `saveUser`

**Descripción:**
Server Action para guardar un usuario (Creación o Edición). Procesa `FormData`, valida los datos y delega la persistencia al servicio.

**Parámetros:**
- `prevState` (Object): Estado previo del formulario (para `useActionState`).
- `formData` (FormData): Datos enviados desde el formulario.

**Retorno:**
- `Promise<{ success: boolean, error?: string, message?: string }>`

**Flujo:**
1. Extrae los datos del `formData`.
2. Valida los tipos y formatos con `userSchema` (Zod).
3. Verifica unicidad de cédula y email llamando a `validateUserUniqueness`.
4. Prepara el objeto de datos para Prisma.
5. Si existe `id`, llama a `updateUser`; de lo contrario, llama a `createUser`.
6. Revalida la ruta `/usuarios`.
7. Retorna mensaje de éxito o error.

### `deleteUser`

**Descripción:**
Server Action para eliminar un usuario por su ID.

**Parámetros:**
- `id` (string): ID del usuario a eliminar.

**Retorno:**
- `Promise<{ success: boolean, error?: string, message?: string }>`

**Flujo:**
1. Delega la eliminación a `deleteUserService`.
2. Si es exitoso, revalida `/usuarios`.
3. Retorna el resultado.
