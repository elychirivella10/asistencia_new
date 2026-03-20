# User Search Action Documentation

## Ubicación
`src/features/users/actions/user-search.action.js`

## Descripción
Provee funcionalidad de búsqueda de usuarios para componentes de UI (ej. autocompletado o filtros).

## Funciones

### `searchUsers`

**Descripción:**
Busca usuarios activos por nombre, apellido o cédula.

**Parámetros:**
- `query` (string): Término de búsqueda.

**Retorno:**
- `Promise<Array<{ id: string, nombre: string, apellido: string, cedula: string }>>`

**Flujo:**
1. Verifica si el `query` tiene al menos 2 caracteres.
2. Realiza una consulta a Prisma (`prisma.usuarios.findMany`) buscando coincidencias parciales (insensitive) en nombre/apellido o coincidencias en cédula.
3. Filtra solo usuarios activos (`es_activo: true`).
4. Limita los resultados a 10 registros.
5. Retorna la lista de usuarios encontrados.
