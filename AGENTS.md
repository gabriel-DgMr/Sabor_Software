# 🤖 Proyecto SABOR — Manual Operativo del Agente IA

Este documento es la **fuente de verdad** para cualquier agente IA o desarrollador que trabaje en el proyecto **SABOR**. Define el contexto del proyecto, la arquitectura vigente, las convenciones de código, las reglas de decisión y el sistema de skills disponibles.

---

## 🍽️ Identidad del Proyecto

**SABOR** es un sistema integral de gestión para restaurantes que cubre:

- **Gestión de pedidos** — Creación, seguimiento y entrega de órdenes (en local y domicilios).
- **Gestión de productos** — Catálogo, inventario, categorías y precios del menú.
- **Reservas** — Sistema de reservación de mesas con control de disponibilidad horaria.
- **Autenticación y usuarios** — Registro, login, roles (admin/cliente/invitado), JWT.
- **Pagos** — Integración de pasarelas y confirmación de transacciones.
- **Reportes y dashboard** — Estadísticas de ventas, métricas y gráficos para administradores.
- **Marketing y banners** — Gestión de contenido promocional y comunicaciones.
- **Contacto** — Canal de comunicación desde la web pública.
- **Home pública** — Landing page del restaurante con menú, secciones y navegación.

La aplicación es bilingüe (español/inglés) mediante **i18next** y tiene como mercado primario Latinoamérica.

---

## 🛠️ Stack Tecnológico

### Backend

- **Entorno:** Node.js (>=18.0.0) con ES Modules (`"type": "module"`).
- **Framework:** Express.js (v5.1.0).
- **Base de Datos:** MySQL (Driver: `mysql2`).
- **Autenticación y Seguridad:** JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `xss-clean`, `express-rate-limit`.
- **Tiempo Real:** Socket.io (Servidor).
- **Otros:** Multer (uploads), Axios, Brevo/Nodemailer (emails), PDFKit (reportes), QRCode.

### Frontend

- **Build Tool:** Vite.
- **Librería UI:** React (v19) / React DOM.
- **Enrutamiento:** React Router DOM (v7.5).
- **Peticiones HTTP:** Axios (instancia centralizada con interceptores JWT).
- **Tiempo Real:** Socket.io-client.
- **Estilos:** Vanilla CSS con metodología **BEM en español**.
- **Animaciones:** GSAP (GreenSock Animation Platform).
- **Otros:** Chart.js (gráficos), React-Toastify (notificaciones), i18next (internacionalización), react-helmet-async (SEO).

### Herramientas Compartidas / Monorepo

- **Gestión de Scripts:** Concurrently.
- **Linter y Formatter:** ESLint, Prettier.
- **Git Hooks:** Husky, lint-staged.
- **Deploy:** Docker, Docker Compose, Railway.

---

## 💻 Comandos Esenciales

Ejecutar desde la raíz del proyecto:

| Comando                  | Descripción                                                |
| ------------------------ | ---------------------------------------------------------- |
| `npm run dev`            | Inicia backend y frontend en modo desarrollo (concurrente) |
| `npm run install:all`    | Instala dependencias en raíz, backend y frontend           |
| `npm run build`          | Build de producción (frontend + backend)                   |
| `npm run lint:fix`       | Ejecuta ESLint con auto-fix en ambos entornos              |
| `npm run format`         | Formatea todo el código con Prettier                       |
| `npm run deploy:prepare` | Limpia, instala, audita seguridad y hace build total       |
| `npm run dev:backend`    | Solo servidor backend en desarrollo                        |
| `npm run dev:frontend`   | Solo servidor frontend en desarrollo                       |

---

## 🏛️ Arquitectura Actual

El proyecto sigue **Screaming Architecture**: la estructura de carpetas revela _qué hace la aplicación_, no _qué framework usa_. Cada carpeta de módulo corresponde a un dominio de negocio real.

### Backend

```text
backend/
├── src/
│   ├── app.js                    # Entry point y configuración Express
│   ├── modules/
│   │   ├── auth/                 # Autenticación (login, registro, JWT)
│   │   ├── banners/              # Gestión de banners promocionales
│   │   ├── contacto/             # Formulario/mensajes de contacto
│   │   ├── pagos/                # Procesamiento de pagos
│   │   ├── pedidos/              # Gestión de órdenes y domicilios
│   │   │   ├── controllers.js    # Controladores REST/HTTP
│   │   │   ├── services.js       # Lógica de negocio
│   │   │   ├── queries.js        # Consultas SQL preparadas
│   │   │   └── routes.js         # Definición de rutas Express
│   │   ├── productos/            # Catálogo, inventario, categorías
│   │   ├── reportes/             # Generación de reportes y estadísticas
│   │   ├── reservas/             # Sistema de reservaciones
│   │   └── usuarios/             # Gestión de perfiles y roles
│   ├── core/                     # Lógica transversal (NO de dominio)
│   │   ├── config/               # Variables de entorno y configuración
│   │   ├── middlewares/          # Auth, error handling, rate limiting
│   │   └── utils/                # Helpers generales
│   ├── logs/                     # Archivos de log
│   └── public/                   # Archivos estáticos (uploads)
```

**Patrón de cada módulo backend:** `controllers.js` → `services.js` → `queries.js`, con `routes.js` definiendo los endpoints.

### Frontend

```text
frontend/
├── src/
│   ├── main.jsx                  # Punto de montaje de React
│   ├── App.jsx                   # Componente raíz con rutas
│   ├── index.css                 # Estilos globales y variables CSS
│   ├── i18n.js                   # Configuración de internacionalización
│   ├── modules/
│   │   ├── auth/                 # Login, registro, recuperación de contraseña
│   │   ├── dashboard/            # Panel de administrador con métricas
│   │   ├── home/                 # Landing page pública del restaurante
│   │   ├── marketing/            # Gestión de banners y promociones
│   │   ├── pedidos/              # Vista de órdenes (cliente y admin)
│   │   │   ├── pages/            # Vistas principales
│   │   │   ├── components/       # Componentes React del módulo
│   │   │   ├── hooks/            # Hooks de lógica de estado
│   │   │   ├── services.js       # Llamadas Axios del módulo
│   │   │   └── styles/           # CSS con BEM en español
│   │   ├── productos/            # Administración de productos/menú
│   │   ├── reservas/             # Interfaz de reservaciones
│   │   └── usuarios/             # Perfil, historial, configuración
│   ├── shared/                   # Código compartido genérico
│   │   ├── components/           # Botones, Inputs, Modales, Header, Footer
│   │   ├── context/              # Contextos compartidos
│   │   ├── hooks/                # Hooks globales reutilizables
│   │   ├── locales/              # Archivos de traducción (es.json, en.json)
│   │   ├── services/             # Instancia Axios centralizada
│   │   ├── styles/               # Estilos compartidos
│   │   └── utils/                # Funciones auxiliares (formateo de fechas, etc.)
│   └── app/                      # Configuración de nivel superior
│       ├── context/              # Context Providers globales (Auth, Theme)
│       └── styles/               # Variables CSS globales, reset, layout
```

**Patrón de cada módulo frontend:** `pages/` → `components/` + `hooks/` para lógica, `services.js` para API, `styles/` para CSS BEM.

---

## 📐 Convenciones de Código

### Nomenclatura (Casing)

| Elemento                     | Formato                            | Ejemplo                                        |
| ---------------------------- | ---------------------------------- | ---------------------------------------------- |
| Carpetas/Directorios         | `kebab-case`                       | `gestion-pedidos`, `carrito-compras`           |
| Componentes React (archivos) | `PascalCase`                       | `TarjetaProducto.jsx`, `ModalConfirmacion.jsx` |
| Archivos generales           | `kebab-case` o `camelCase` (hooks) | `auth-service.js`, `useAuth.js`                |
| Variables y funciones        | `camelCase`                        | `obtenerPedidos()`, `usuarioActual`            |
| Clases CSS (BEM)             | `kebab-case` + BEM                 | `tarjeta-destacada__boton`                     |
| Constantes / env             | `UPPER_SNAKE_CASE`                 | `API_BASE_URL`, `TOKEN_EXPIRATION`             |
| Commits                      | Conventional Commits               | `feat: añade gestión de inventario`            |

### BEM en Español

Todos los estilos usan **BEM (Block, Element, Modifier)** localizado al español:

- **Bloque:** Componente principal → `.tarjeta`, `.boton`, `.navegacion`
- **Elemento:** Sub-nodo, unido por `__` → `.tarjeta__imagen`, `.navegacion__enlace`
- **Modificador:** Variación/estado, unido por `--` → `.boton--primario`, `.tarjeta--activa`

```html
<article class="tarjeta tarjeta--destacada">
  <img class="tarjeta__imagen" src="platillo.png" alt="Platillo" />
  <div class="tarjeta__contenido">
    <h2 class="tarjeta__titulo">Tacos al Pastor</h2>
    <p class="tarjeta__descripcion">Deliciosos tacos con piña.</p>
    <button class="boton boton--primario">Agregar al Carrito</button>
  </div>
</article>
```

```css
.tarjeta {
  /* Estilos base del bloque */
}
.tarjeta--destacada {
  /* Modificador: borde resaltado, sombra extra */
}
.tarjeta__imagen {
  /* Elemento: imagen interna */
}
.tarjeta__titulo {
  /* Elemento: tipografía del título */
}
.boton {
  /* Bloque separado: estilo general de botones */
}
.boton--primario {
  /* Modificador: colores primarios */
}
```

### Idioma del Código

- Los **módulos de negocio** usan nombres en español (coherente con BEM y dominio hispano).
- Evitar Spanglish: mantener coherencia dentro de cada módulo.
- Palabras técnicas universales en inglés son aceptables (`controller`, `service`, `hook`, `query`).

### Formateo y Linting

- **ESLint & Prettier** activos con pre-commit via Husky + lint-staged.
- No deshabilitar reglas de ESLint sin justificación explícita.

---

## 🧠 Reglas de Operación del Agente

### Prioridades de Decisión

Cuando el agente trabaje en el proyecto, debe seguir este orden de prioridad:

1. **Arquitectura** (Screaming Architecture)
2. **Seguridad** (validación, sanitización, JWT)
3. **Legibilidad y mantenibilidad**
4. **Performance**
5. **Estética** (UI/UX)

### En Caso de Conflicto

- Nunca sacrificar seguridad por rapidez.
- Nunca romper la arquitectura por conveniencia.
- Priorizar simplicidad sobre sobreingeniería.

### ❌ Anti-patrones Prohibidos

- ❌ Lógica de negocio en controladores (usar `services.js`).
- ❌ Consultas SQL dentro de controllers (usar `queries.js`).
- ❌ Componentes React con más de 300 líneas (extraer a hooks/sub-componentes).
- ❌ Uso de estados globales innecesarios.
- ❌ CSS sin BEM o con nombres genéricos (`.box`, `.container`, `.wrapper`).
- ❌ Hardcodeo de URLs, tokens o magic strings.
- ❌ Frameworks CSS externos (TailwindCSS, Bootstrap) — solo Vanilla CSS + BEM.
- ❌ `try/catch` redundantes — usar `catchAsync` y middleware global de errores.

### ⚡ Directriz Fundamental

> Cada vez que asistas en desarrollar o modificar código de este proyecto, verifica que se acople a la estructura Screaming Architecture y aplica estilos con Vanilla CSS utilizando BEM en Español. No introduzcas herramientas de CSS genérico ni frameworks ajenos a la directriz.

---

## 📜 Mejores Prácticas por Capa

### Backend (Node.js/Express)

1. **Flujo de datos:** `routes.js` → `controllers.js` → `services.js` → `queries.js`. Los controladores procesan `req`/`res` y delegan al servicio.
2. **Validación exhaustiva:** Toda entrada se valida en controladores/middlewares antes de llegar a servicios.
3. **Consultas preparadas:** Centralizar en `queries.js` con prepared statements. Nunca SQL inline.
4. **Manejo de errores:** Usar `catchAsync` y middleware global. Evitar `try/catch` repetitivos.
5. **Seguridad:** Helmet, rate limiting, variables de entorno para TODOS los secretos. Sanitización de inputs.
6. **Autenticación:** JWT con middleware de verificación. Rotación de tokens. Interceptar 401 en frontend.

### Frontend (React/Vite)

1. **Separación lógica/vista:** Hooks personalizados para lógica compleja, componentes solo para renderizado.
2. **Estética premium:** Modo oscuro, colores armoniosos, tipografías legibles (Inter), micro-interacciones con GSAP. Las interfaces deben sentirse PREMIUM.
3. **Peticiones centralizadas:** Instancia Axios en `shared/services/` con interceptores JWT y manejo de 401.
4. **Sin magic strings:** Constantes y rutas en archivos de configuración compartida.
5. **Lazy loading:** Rutas con `React.lazy()` y `Suspense`.
6. **Memoización:** `React.memo`, `useMemo`, `useCallback` en componentes pesados.
7. **Internacionalización:** Usar `i18next` para todo texto visible. Llaves en `shared/locales/`.

### Seguridad

- Sanitización de datos en frontend y backend.
- JWT para autenticación con rotación de tokens.
- Helmet y xss-clean activos.
- Rate limiting en endpoints sensibles.
- Variables de entorno para secretos (nunca hardcodear).
- Protección contra CSRF.
- Logs de auditoría para acciones críticas.

### Performance

- Lazy loading en rutas React.
- Memoización en componentes pesados.
- Evitar renders innecesarios (`React.memo`, `key` props).
- Optimización de queries SQL (índices, joins eficientes).
- Compresión de assets en producción.
- GSAP con `will-change` y transforms para animaciones 60fps.

### Testing

| Capa        | Herramienta           | Enfoque                          |
| ----------- | --------------------- | -------------------------------- |
| Unitarias   | Jest / Vitest         | Servicios, utils, hooks          |
| Integración | Supertest             | Endpoints API                    |
| Componentes | React Testing Library | Componentes React (user-centric) |
| E2E         | Playwright            | Flujos críticos cross-browser    |

**Reglas:**

- Todo bug corregido debe incluir un test.
- No hacer deploy sin pasar tests.

---

## 🧩 Sistema de Skills

**Ubicación:** `.agents/skills/`

El proyecto utiliza **24 skills** que guían al agente según el contexto de la tarea. Cada skill define buenas prácticas que deben aplicarse activamente.

### Registro Completo de Skills

#### 🔑 Core & Planning

| Skill             | Propósito                                          | Cuándo Usarla                                                                                   |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `brainstorming`   | Exploración de ideas y diseño antes de implementar | **Obligatoria** antes de cualquier trabajo creativo: crear features, componentes, funcionalidad |
| `writing-plans`   | Crear planes de implementación detallados          | Cuando tienes spec/requisitos para una tarea multi-paso                                         |
| `executing-plans` | Ejecutar planes con checkpoints de revisión        | Cuando tienes un plan escrito para implementar en sesión separada                               |
| `find-skills`     | Descubrir e instalar nuevas skills                 | Cuando no está claro qué skill aplicar o se necesitan nuevas capacidades                        |

#### 🏛️ Arquitectura

| Skill                | Propósito                                                       | Cuándo Usarla                                            |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| `sabor-architecture` | Screaming Architecture, BEM español, modularización por dominio | **SIEMPRE** — en cualquier tarea, verificar cumplimiento |

#### ⚙️ Backend

| Skill                   | Propósito                                                   | Cuándo Usarla                                       |
| ----------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| `nodejs-best-practices` | Principios Node.js: async patterns, seguridad, arquitectura | Al crear endpoints, lógica de negocio, servicios    |
| `web-security`          | Seguridad web: validación, sanitización, protección         | Al manejar autenticación, tokens, inputs de usuario |

#### ⚛️ Frontend Core

| Skill                            | Propósito                                                                                 | Cuándo Usarla                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `vercel-react-best-practices`    | Optimización React/Next.js según Vercel Engineering                                       | Al escribir/refactorizar componentes React             |
| `react-performance-optimization` | Memoización, code splitting, rendering eficiente                                          | Al optimizar componentes lentos o grandes datasets     |
| `frontend-design`                | Interfaces de producción con alta calidad visual                                          | Al crear componentes, páginas o trabajar en UI         |
| `ui-ux-pro-max`                  | Inteligencia de diseño: 50+ estilos, 161 paletas, 57 font-pairings, 161 tipos de producto | Al diseñar UI/UX, elegir estilos, colores, tipografías |

#### 🎬 Animaciones (GSAP)

| Skill                | Propósito                                                               | Cuándo Usarla                                                                  |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `gsap-core`          | API core: `to()`, `from()`, `fromTo()`, easing, stagger, `matchMedia()` | Para cualquier animación JS, easing, responsive                                |
| `gsap-react`         | GSAP en React: `useGSAP` hook, refs, `gsap.context()`, cleanup          | Animaciones en componentes React (siempre preferir sobre `gsap-core` en React) |
| `gsap-scrolltrigger` | Animaciones scroll-linked, pinning, scrub, triggers                     | Parallax, secciones fijadas, animaciones al scroll                             |
| `gsap-timeline`      | Secuenciación: `gsap.timeline()`, position parameter, nesting           | Coreografiar múltiples animaciones en secuencia                                |
| `gsap-plugins`       | ScrollTo, Flip, Draggable, SplitText, ScrambleText, SVG plugins         | Funcionalidad avanzada: drag, flip, texto animado                              |
| `gsap-utils`         | Utilidades: `clamp`, `mapRange`, `snap`, `wrap`, `toArray`              | Funciones helper para cálculos de animación                                    |
| `gsap-performance`   | Optimización: transforms, will-change, batching, 60fps                  | Al optimizar animaciones GSAP, reducir jank                                    |
| `gsap-frameworks`    | GSAP en Vue, Svelte (lifecycle, scoping, cleanup)                       | Solo si se trabaja fuera de React (no aplica normalmente)                      |

#### 🧪 Testing

| Skill                    | Propósito                                           | Cuándo Usarla                                                 |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------- |
| `react-testing-library`  | Testing de componentes React centrado en el usuario | Al escribir tests de componentes (queries, user-event, async) |
| `playwright-e2e-testing` | E2E testing cross-browser con auto-wait             | Pruebas de flujos completos (login → pedido → pago)           |

#### 📝 Documentación

| Skill                  | Propósito                            | Cuándo Usarla                                        |
| ---------------------- | ------------------------------------ | ---------------------------------------------------- |
| `documentation-skill`  | Guías y estándares de documentación  | Al crear README, documentación técnica               |
| `jsdoc-best-practices` | JSDoc para funciones, módulos y APIs | Al documentar funciones exportadas, servicios, utils |

#### ⚡ Performance

| Skill                          | Propósito                                                 | Cuándo Usarla                                |
| ------------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| `performance-optimization`     | Optimización general: caching, bundle, queries, profiling | Al auditar o mejorar rendimiento general     |
| `web-performance-optimization` | Core Web Vitals, carga, runtime, bundle size              | Al optimizar tiempos de carga y métricas web |

---

### Mapeo Rápido: Tipo de Tarea → Skills

| Estoy trabajando en...          | Skills a consultar                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Componentes React / UI**      | `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`, `gsap-react`                                  |
| **CSS / Estilos / Animaciones** | `frontend-design`, `ui-ux-pro-max`, `gsap-core`, `gsap-performance`                                              |
| **Endpoints / API backend**     | `nodejs-best-practices`, `web-security`                                                                          |
| **Autenticación / Tokens**      | `web-security`, `nodejs-best-practices`                                                                          |
| **Optimización de rendimiento** | `performance-optimization`, `web-performance-optimization`, `react-performance-optimization`, `gsap-performance` |
| **Tests**                       | `react-testing-library`, `playwright-e2e-testing`                                                                |
| **Planificación**               | `brainstorming`, `writing-plans`, `executing-plans`                                                              |
| **Documentación**               | `documentation-skill`, `jsdoc-best-practices`                                                                    |
| **No sé qué skill aplicar**     | `find-skills`                                                                                                    |

### Reglas de Uso de Skills

1. **Antes de escribir código:** Identificar el tipo de tarea y seleccionar las skills relevantes.
2. **`sabor-architecture`** se aplica **siempre**, sin excepción.
3. **`brainstorming`** es obligatoria antes de cualquier trabajo creativo nuevo.
4. Consultar la skill correspondiente **leyendo su `SKILL.md`** antes de implementar.

### Prioridad de Skills (en caso de conflicto)

1. `sabor-architecture` — Arquitectura es inviolable
2. `web-security` — Seguridad nunca se negocia
3. `nodejs-best-practices` / `vercel-react-best-practices` — Mejores prácticas del stack
4. `performance-optimization` / `react-performance-optimization` — Rendimiento
5. `ui-ux-pro-max` / `frontend-design` — Estética

---

## 📝 Evolución del Documento

Este archivo `AGENTS.md`, así como las skills en `.agents/skills/`, son **documentos vivos**. Deben ser actualizados conforme el equipo o los agentes aprendan y refinen las prácticas del proyecto. Si se agregan nuevos módulos, skills o convenciones, este archivo debe reflejarlos.
