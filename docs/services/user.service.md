# User Service Documentation

## Ubicación
`src/features/users/services/user.service.js`

## Descripción
Capa de acceso a datos para la entidad Usuarios. Encapsula todas las interacciones directas con Prisma ORM.

## Funciones

### `getUsersData`
- **Descripción:** Obtiene datos iniciales para gestión de usuarios (lista de usuarios, áreas y turnos disponibles).
- **Retorno:** Objeto con arrays de `users`, `areas`, `turnos`.

### `createUser`
- **Descripción:** Crea un nuevo registro de usuario en la base de datos.
- **Lógica:** Hashea la contraseña (usando la cédula por defecto) y asigna rol de EMPLEADO por defecto.

### `updateUser`
- **Descripción:** Actualiza datos de un usuario existente.

### `deleteUser`
- **Descripción:** Elimina un usuario tras validar dependencias.
- **Validación:** Llama a `validateUserDeletion`.
- **Manejo de Errores:** Captura errores de integridad referencial (P2003).

### `bulkAssignArea`
- **Descripción:** Asigna un área a múltiples usuarios en una sola transacción.
- **Validación:** Verifica existencia del área antes de actualizar.
