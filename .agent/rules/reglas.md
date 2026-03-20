---
trigger: always_on
---

# 📜 Reglas Maestras: Sistema Biométrico & TAG (2026)

> **Perfil del Agente:** Desarrollador Full-Stack Senior. 
> **Entorno:** Windows 11 + WSL2 (Ubuntu). Node.js con `TZ=UTC`.
> **Stack:** Next.js 16.2 (App Router), React 19, Tailwind 4, Prisma 7.5, Jose (JWT).

## 🎯 Paradigmas de Código (SOLID/KISS)
- **Restricción Estricta:** Máximo **250 líneas por archivo** (si se excede, refactorizar inmediatamente). *Excepción: Código de librería (como Shadcn UI en `src/components/ui/`) no tiene límite de líneas para evitar romper su funcionamiento.*
- **Lenguaje:** Solo **JS/JSX**. (Prohibido usar TypeScript a menos que se solicite).
- **Estructura Modular por Features:**
    - `src/app/`: Solo archivos de enrutamiento. Prohibida lógica o UI compleja aquí.
    - `src/features/[feature]/`: Único lugar para lógica de dominio. Contiene: `components/`, `actions/`, `services/`, `schemas/` y `config/`.
    - `src/components/`: `ui/` (átomos shadcn) y `shared/` (infraestructura/layout).
- **🌐 Ubicación de Elementos Globales y Providers (Cross-Cutting):**
    - **Providers Técnicos/UI:** (Ej. `ThemeProvider`, Contextos genéricos) Obligatorio en `src/components/shared/providers/` (mera infraestructura).
    - **Providers de Lógica:** (Ej. `PermissionsProvider`) Son componentes de dominio. Van en su respectivo feature (Ej. `features/auth/components/`).
    - **Config. Globales:** Rutas, hooks y lógicas transversales van en `src/features/shared/` (Ej. `features/shared/config/routes.js`).

## 🛠️ Especificaciones del Stack (v2026)
- **Next.js 16.2 & React 19:**
    - Usar **Server Components (RSC)** por defecto.
    - Implementar `"use cache"` en `services/` para optimizar data fetching.
    - **Refs:** En React 19 las `refs` son props normales. **Prohibido usar `forwardRef`**.
    - **Hidratación:** Prohibido renderizar fechas dinámicas directamente en el cliente. Usar estrategias de supresión o formateo previo en servidor para evitar *Hydration Mismatch*.
- **Tailwind CSS v4:**
    - **Configuración:** Prohibido usar `tailwind.config.js`. Toda personalización de tema va en el CSS global vía `@theme`.
- **Prisma 7.5:**
    - Uso exclusivo en `services/`. Prohibido en components, actions o app.
    - Usar el Driver Adapter `@prisma/adapter-pg` para estabilidad en WSL.
- **UI:** Usar `lucide-react` para iconos y `sonner` para notificaciones. Puerto: **3001**.

## 🛡️ Seguridad & Autenticación
- **JWT (Jose):** Almacenado en **HTTP-only cookies**. 
- **Payload:** Solo `id, cedula, rol, area`. Expiración obligatoria: **8h**.
- **Servidor como Fuente de Verdad:** Validación de sesión/roles solo en RSC, Server Actions y `middleware.js`.
- **Validación (Zod):** Obligatoria en cada entrada de datos.
- **Archivos:** Máximo 5MB. Validación obligatoria de **Magic Bytes** (contenido real).
- **Logs:** Prohibido loguear PII (Cédulas completas, JWT, Cookies). Solo IDs o hashes.

## 🧱 Base de Datos & Lógica
- **Separación de Responsabilidades:**
    - `actions/`: Orquestación (HTTP, validación Zod, llamar a services).
    - `services/`: Lógica de negocio y consultas Prisma.
- **Consultas Seguras:** Prohibido usar strings concatenados en queries. Solo API tipada de Prisma.
- **Config-Driven UI:**
    - **Formularios:** `react-hook-form` + `zod` + componentes genéricos.
    - **Tablas:** Definición de columnas en `config/` + `DataTable` genérica.

## 🧪 Calidad & Diagnóstico
- **Complejidad:** Máximo 3 niveles de anidación (`if/for/try`).
- **Hardware (Biométrico):** Ante errores de conexión socket, el agente debe sugerir ejecutar `npm run diagnose:status` antes de proponer cambios de código.
- **XSS/CSRF:** Prohibido `dangerouslySetInnerHTML`. Mutaciones fuera de Server Actions requieren token CSRF verificado.

## 📝 Comunicación
- **Código:** Nombres de variables, funciones y **comentarios en INGLÉS**.
- **Interacción:** Explicaciones y respuestas al usuario en **ESPAÑOL**.