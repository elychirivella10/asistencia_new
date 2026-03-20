# Auth Service Documentation

## Ubicación
`src/features/auth/services/auth.service.js`

## Descripción
Servicio encargado de la lógica de autenticación y gestión de sesiones.

## Funciones

### `authenticateUser`
- **Descripción:** Verifica las credenciales de un usuario contra la base de datos.
- **Parámetros:** `cedula`, `password`.
- **Lógica:**
  1. Busca usuario por cédula.
  2. Compara hash de contraseña con bcrypt.
- **Retorno:** Objeto `{ success, user, error }`.

### `loginUserSession`
- **Descripción:** Crea la sesión del usuario autenticado.
- **Detalle:** Invoca a `createSession` (lib/auth) para generar el JWT y establecer la cookie.
- **Payload:** Incluye `id`, `cedula`, `role` y `area_id` en la sesión.
