# User Validation Service Documentation

## Ubicación
`src/features/users/services/user-validation.service.js`

## Descripción
Servicio dedicado a validar reglas de negocio complejas para usuarios, desacoplando esta lógica de las acciones y del servicio de persistencia.

## Funciones

### `validateUserUniqueness`
- **Descripción:** Verifica que no exista otro usuario con la misma cédula o email.
- **Parámetros:** `cedula`, `email`, `current_id` (para excluir al usuario actual en ediciones).
- **Retorno:** Objeto `{ success, error, details }`.

### `validateUserDeletion`
- **Descripción:** Verifica si un usuario puede ser eliminado sin romper integridad del sistema.
- **Reglas:**
  1. No debe tener marcajes asociados.
  2. No debe ser jefe de ningún área.
- **Retorno:** Objeto `{ success, error }`.
