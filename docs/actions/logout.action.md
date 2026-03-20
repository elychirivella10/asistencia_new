# Logout Action Documentation

## Ubicación
`src/features/auth/actions/logout.action.js`

## Descripción
Maneja el cierre de sesión de usuarios.

## Funciones

### `logoutAction`

**Descripción:**
Server Action para cerrar la sesión actual.

**Parámetros:**
- Ninguno.

**Retorno:**
- `Promise<void>` (Redirige)

**Flujo:**
1. Llama a `logout()` de `@/lib/auth` para destruir la sesión.
2. Redirige al usuario a `/login`.
