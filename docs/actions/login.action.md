# Login Action Documentation

## Ubicación
`src/features/auth/actions/login.action.js`

## Descripción
Maneja el proceso de inicio de sesión de usuarios.

## Funciones

### `loginAction`

**Descripción:**
Server Action para procesar el formulario de login.

**Parámetros:**
- `prevState` (any): Estado previo.
- `formData` (FormData): Credenciales (cédula, password).

**Retorno:**
- `Promise<{ success: boolean, error?: string, details?: Object }>`

**Flujo:**
1. Valida las credenciales usando `loginSchema`.
2. Llama a `authenticateUser` para verificar usuario y contraseña en base de datos.
3. Si la autenticación es correcta, llama a `loginUserSession` para crear la sesión (cookies).
4. Retorna éxito o error.
