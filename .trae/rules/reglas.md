## 🎯 Paradigmas
- **SOLID/KISS:** Máximo 100 líneas por archivo. Solo **JS/JSX**.
- **`src/app/` (Rutas):** Solo archivos Next.js. Prohibida lógica o UI compleja aquí.
- **`src/features/[feature]/`:** Modular por dominio. Contiene `components/`, `actions/`, `services/`, `schemas/` y `config/`.
- **Separación Actions/Services:** `actions/` solo orquestan (HTTP/Zod). `services/` contienen toda la lógica de negocio y DB (Prisma).
- **Config-Driven UI (Formularios y Tablas):** Configuración en `features/[feature]/config/`.
    - **Formularios:** `react-hook-form` + `zod` + componentes genéricos.
    - **Tablas:** Definición de columnas en config + `DataTable` genérica + `useDataTable`.
- **`src/components/`:** `ui/` para átomos (shadcn) y `sidebar/` o `shared/` para infraestructura.

## 🛠️ Stack & Datos
- **Next.js:** RSC por defecto. Server Actions para mutaciones.
- **Inyección Top-Down:** Datos obtenidos en Layout/Page y pasados por props. 
- **Prisma:** UUID v4 y Driver Adapter 'pg'. Cédula como String único.

## 🛡️ Seguridad
- **Auth:** JWT (jose) en HTTP-only cookies (id, cedula, rol, area).
- **Validación:** Zod obligatorio. Verificación de Roles/Áreas en servidor.
- **Archivos:** Máximo 5MB. Validación obligatoria de **Magic Bytes**.

## 📝 Comunicación
- **Código:** Comentarios en Inglés. Explicaciones en Español.