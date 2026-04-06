# 🤖 Proyecto SABOR - Guía de Agentes y Refactorización

Este documento define el contexto, estándares y directrices para agentes IA o desarrolladores que asistan en la refactorización y normalización del código del proyecto **SABOR**. El objetivo principal es migrar y mantener una **Screaming Architecture**, así como asegurar el uso estricto de **BEM en español** para el ecosistema CSS, garantizando las mejores prácticas de la industria en frontend y backend.

## 🛠️ Stack Tecnológico Principal

### Backend

- **Entorno:** Node.js (>=18.0.0) con ES Modules (`"type": "module"`).
- **Framework:** Express.js (v5.1.0).
- **Base de Datos:** MySQL (Driver: `mysql2`).
- **Autenticación y Seguridad:** JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `xss-clean`, `express-rate-limit`.
- **Tiempo Real:** Socket.io (Servidor).
- **Otros:** Multer, Axios, Brevo/Nodemailer, PDFKit.

### Frontend

- **Herramienta de Construcción:** Vite.
- **Librería UI:** React (v19) / React DOM.
- **Enrutamiento:** React Router DOM (v7.5).
- **Peticiones HTTP y Estado:** Axios.
- **Tiempo Real:** Socket.io-client.
- **Estilos:** Vanilla CSS (Metodología BEM en español).
- **Otros:** Chart.js, React-Toastify, i18next (Internacionalización).

### Herramientas Compartidas / Monorepo

- **Gestión de Scripts:** Concurrently.
- **Linter y Formatter:** ESLint, Prettier.
- **Git Hooks:** Husky, lint-staged.

---

## 💻 Comandos Básicos de Ejecución

Estos comandos deben ejecutarse desde la raíz del proyecto (a menos que se indique lo contrario).

- `npm run install:all`: Instala las dependencias en raíz, backend y frontend.
- `npm run dev`: Ejecuta concurrentemente los servidores de desarrollo de backend y frontend.
- `npm run build`: Construye los artefactos de producción en backend y frontend.
- `npm run lint:fix`: Ejecuta el linter corrigiendo errores automáticamente en ambos entornos.
- `npm run format`: Formatea todo el código base utilizando Prettier.
- `npm run deploy:prepare`: Limpia, instala dependencias, corre auditorías de seguridad y hace un build total.

---

## 🏛️ Screaming Architecture (Arquitectura Gritona)

El rediseño arquitectónico obedece al patrón **Screaming Architecture**, donde la estructura de carpetas revela _qué hace la aplicación_ y no _qué framework está usando_. Todos los nuevos módulos y refactorizaciones deben seguir estrictamente esta división modular enfocada al dominio de negocio (p.ej. `gestión-órdenes`, `inventario`, `usuarios`).

### Estructura Target (Backend & Frontend)

**Backend Target (Ejemplo):**

```text
backend/
├── src/
│   ├── modules/
│   │   ├── pedidos/
│   │   │   ├── controllers.js    # Controladores REST/HTTP de pedidos
│   │   │   ├── services.js       # Lógica de negocio core para pedidos
│   │   │   ├── queries.js        # Consultas de BD dedicadas a pedidos
│   │   │   ├── routes.js         # Definición de rutas Express de pedidos
│   │   │   └── validations.js    # Esquemas de validación de entradas
│   │   ├── inventario/
│   │   │   └── ...               # (Misma estructura modular)
│   │   └── usuarios/
│   │       └── ...
│   ├── core/                     # Lógica transversal independiente del dominio
│   │   ├── config/               # Variables de entorno y configuraciones
│   │   ├── db/                   # Inicialización y conexiones
│   │   ├── middlewares/          # Autenticación, manejo de errores
│   │   └── utils/                # Helpers generales
│   └── index.js                  # Entry point del servidor
```

**Frontend Target (Ejemplo):**

```text
frontend/
├── src/
│   ├── modules/
│   │   ├── pedidos/              # Módulo visible y "gritón"
│   │   │   ├── pages/            # Vistas principales del dominio pedidos
│   │   │   ├── components/       # Componentes React específicos de pedidos
│   │   │   ├── hooks/            # Hooks de lógica de estado de pedidos
│   │   │   ├── services.js       # LLamadas Axios para el módulo pedidos
│   │   │   └── styles/           # Archivos CSS BEM de pedidos
│   │   ├── menu/                 # Otro módulo "gritón"
│   │   │   └── ...
│   ├── shared/                   # Código compartido genérico (UI transversal)
│   │   ├── components/           # Botones, Inputs, Modales genéricos
│   │   ├── hooks/                # Hooks globales
│   │   └── utils/                # Funciones auxiliares
│   ├── app/                      # Configuración de nivel superior
│   │   ├── router/               # React Router
│   │   ├── context/              # Context Providers globales (Auth, Theme)
│   │   └── styles/               # Variables CSS, reset y layout global
│   └── main.jsx                  # Punto de montaje de React
```

---

## 🎨 Convenciones de Diseño y Frontend (BEM en Español)

Para mantener una separación limpia de estilos sin frameworks de utilidad invasivos, se utilizará estrictamente CSS Vanilla implementando la metodología **BEM (Block, Element, Modifier)**, pero completamente localizada al **ESPAÑOL**.

### Reglas para BEM en Español

1. **Bloque:** Componente principal (`.tarjeta`, `.boton`, `.navegacion`).
2. **Elemento:** Sub-nodo dependiente del bloque, unido por dos guiones bajos (`__`) (`.tarjeta__imagen`, `.navegacion__enlace`).
3. **Modificador:** Variación o estado de un bloque/elemento, unido por dos guiones medios (`--`) (`.boton--primario`, `.tarjeta--activa`).

**Ejemplo de HTML y CSS aplicando BEM en Español:**

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
/* tarjeta.css */
.tarjeta {
  /* Estilos base */
}
.tarjeta--destacada {
  /* Estilos modificador: borde resaltado, sombra extra */
}
.tarjeta__imagen {
  /* Estilos de la imagen interna */
}
.tarjeta__contenido {
  /* Layout del contenido */
}
.tarjeta__titulo {
  /* Tipografía del título */
}
.tarjeta__descripcion {
  /* ... */
}

/* boton.css (Módulo separado en UI Compartida) */
.boton {
  /* Estilo general de botones */
}
.boton--primario {
  /* Colores primarios */
}
```

---

## 📜 Convenciones Globales y Mejores Prácticas

### Backend (Node.js/Express)

1. **Validación Exhaustiva:** Toda entrada de datos debe validarse rigurosamente en la capa de controladores/middlewares antes de llegar a los servicios.
2. **Capa de Servicios Separada:** Los controladores NO deben tener lógica de negocio pesada, ni interactuar de forma directa con SQL. Los controladores deben procesar `req` y despachar la tarea a un servicio.
3. **Consultas a Base de Datos:** Centralizar las consultas (`queries`) evitando consultas en línea propensas a SQL Injections. Usar preparación de statements estricta.
4. **Manejo Centralizado de Errores:** Evitar los bloques `try/catch` redundantes con una función tipo `catchAsync` y un middleware global de captura de excepciones.
5. **Seguridad:** Mantener activos Helmets y los limitadores de rango. Usar variables de entorno para TODOS los secretos.

### Frontend (React/Vite)

1. **Separación Lógica/Vista:** Mover lógica compleja a Hooks Personalizados en lugar de empaquetar todo dentro de componentes masivos.
2. **Estética y UI/UX:** Al trabajar en UI, aplicar prácticas modernas de diseño web de manera impecable (modo oscuro, colores armoniosos, tipografías legibles como Inter, micro-interacciones suaves en `.hover`). Las interfaces deben sentirse PREMIUM.
3. **Manejo de Peticiones:** Utilizar un servicio centralizado de Axios para preconfigurar tokens JWT y manejar intercepciones de respuestas (ej. para forzar deslogueo en 401).
4. **Sin "Magic Numbers" o "Magic Strings":** Agrupar constantes y variables de enrutamiento dentro de archivos unificados de configuración compartida.

### Código y Versionado

- **Idioma del Código:** Variables, funciones y documentación deben mantener coherencia. Ya que la aplicación tiene dominio hispano y BEM está en español, los MÓDULOS DE NEGOCIO pueden tener variables y clases en español, pero debe haber coherencia (Spanglish evitable).
- **Convenciones de Nomenclatura (Casing):**
  - **Carpetas/Directorios:** `kebab-case` (ej. `gestion-pedidos`, `carrito-compras`). Esto asegura compatibilidad universal y URLs amigables.
  - **Archivos de Componentes React:** `PascalCase` (ej. `TarjetaProducto.jsx`, `ModalConfirmacion.jsx`).
  - **Archivos Generales (Servicios, Controladores, Utils):** `kebab-case` para el nombre del archivo (ej. `auth-service.js`, `db-connection.js`) o `camelCase` si el archivo exporta solo un hook `useAuth.js`.
  - **Variables y Funciones (JS/TS):** `camelCase` (ej. `obtenerPedidos()`, `usuarioActual`).
  - **Clases CSS (BEM):** `kebab-case` combinado con las uniones BEM (ej. `tarjeta-destacada__boton`).
  - **Constantes y Variables de Entorno:** `UPPER_SNAKE_CASE` (ej. `API_BASE_URL`, `TOKEN_EXPIRATION`).
- **Commits:** Mensajes claros siguiendo Conventional Commits (ej. `feat: añade gestión de inventario`, `refactor: migración de componente tabla de pedidos a BEM`).
- **ESLint & Prettier:** Evitar deshabilitar las reglas de ESLint sin justificación explícita. Mantener el formato con prettier asegurado en pre-commit.

---

> **⚡ Directriz Fundamental del Agente AI:**
> Cada vez que asistas en desarrollar o refactorizar código de este proyecto, revisa que este se acople inmediatamente a la estructura _Screaming Architecture_ y aplica estilos con Vanilla CSS utilizando _BEM en Español_. No introduzcas herramientas de CSS genérico o frameworks ajenos a la directriz.

## 🧠 Reglas de Decisión del Agente

Cuando el agente trabaje en el proyecto, debe seguir este orden de prioridad:

1. Arquitectura (Screaming Architecture)
2. Seguridad (validación, sanitización, JWT)
3. Legibilidad y mantenibilidad
4. Performance
5. Estética (UI/UX)

En caso de conflicto:

- Nunca sacrificar seguridad por rapidez
- Nunca romper la arquitectura por conveniencia
- Priorizar simplicidad sobre sobreingeniería

## ❌ Anti-patrones Prohibidos

- ❌ Lógica de negocio en controladores
- ❌ Consultas SQL dentro de controllers
- ❌ Componentes React con más de 300 líneas
- ❌ Uso de estados globales innecesarios
- ❌ CSS sin BEM o con nombres genéricos (ej. `.box`, `.container`)
- ❌ Hardcodeo de URLs o tokens

## 🧪 Testing

El proyecto debe incluir:

- Pruebas unitarias (servicios, utils)
- Pruebas de integración (APIs)
- Pruebas E2E (flujos críticos)

Herramientas sugeridas:

- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library
- E2E: Playwright

Reglas:

- Todo bug corregido debe incluir un test
- No hacer deploy sin pasar tests

## ⚡ Performance

- Lazy loading en rutas (React)
- Memoización en componentes pesados
- Evitar renders innecesarios
- Optimización de queries SQL (índices)
- Compresión de assets en producción

## 🔐 Seguridad

- Sanitización de datos
- Uso de JWT para autenticación
- Helmets y xss-clean para protección
- Rate limiting para prevenir ataques
- Variables de entorno para secretos
- No hardcodeo de URLs o tokens
- Sanitización de inputs en frontend y backend
- Protección contra CSRF
- Rotación de tokens
- Logs de auditoría para acciones críticas

# 🧠 Skills Registry

**Ubicación:** `.agents/skills/`

Este proyecto utiliza el sistema de habilidades (skills) listado abajo para guiar al agente IA.
Cada skill define buenas prácticas específicas que deben aplicarse según el contexto de la tarea.

### Listado Completo de Skills

- **Core & Planning:** `brainstorming`, `writing-plans`, `executing-plans`, `find-skills`.
- **Arquitectura:** `sabor-architecture` (Crítica).
- **Backend:** `nodejs-best-practices`, `web-security`.
- **Frontend Core:** `vercel-react-best-practices`, `react-performance-optimization`, `frontend-design`, `ui-ux-pro-max`.
- **Animaciones (GSAP):** `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-frameworks`.
- **Testing:** `react-testing-library`, `playwright-e2e-testing`.
- **Documentación:** `documentation-skill`, `jsdoc-best-practices`.
- **Performance:** `performance-optimization`, `web-performance-optimization`.

---

> 📝 **Nota sobre Evolución del Documento:**
> Este archivo `AGENTS.md`, así como las _skills_, es un documento vivo. **Puede y debe ser modificado** continuamente según lo que el equipo o los agentes vayan aprendiendo y refinando durante el progreso del desarrollo del proyecto.

## 🔍 Reglas de Uso de Skills

Antes de escribir código, el agente debe:

1. Identificar el tipo de tarea.
2. Seleccionar las skills y directrices relevantes.
3. Aplicarlas activamente durante la implementación.

## 📚 Mapeo de Skills por Contexto

### ⚛️ Frontend (React, UI, UX)

**Usar cuando:**

- Se creen componentes
- Se trabaje en UI/UX
- Se optimice la interfaz o el renderizado

**Skills:**

- `vercel-react-best-practices`
- `react-performance-optimization`
- `frontend-design`
- `ui-ux-pro-max`
- `gsap-react` (para animaciones en React)
- `gsap-core` / `gsap-scrolltrigger` / `gsap-timeline` (según necesidad)

### 🎨 Estilos y Animaciones (CSS / BEM / GSAP)

**Usar cuando:**

- Se escriba CSS
- Se diseñen componentes visuales o interacciones animadas

**Skills:**

- `frontend-design`
- `ui-ux-pro-max`
- `gsap-performance`
- `gsap-utils`
- `gsap-plugins`

**Regla adicional:**
Aplicar estrictamente BEM en español para CSS y GSAP para interacciones complejas "Premium".

### ⚙️ Backend (Node.js / API)

**Usar cuando:**

- Se creen endpoints
- Se trabaje en lógica de negocio

**Skills:**

- `nodejs-best-practices`
- `web-security`

### 🔐 Seguridad

**Usar cuando:**

- Se maneje autenticación o tokens
- Se procesen inputs del usuario

**Skills:**

- `web-security`

### ⚡ Performance

**Usar cuando:**

- Se optimice frontend o backend
- Se detecten o auditen problemas de rendimiento

**Skills:**

- `performance-optimization`
- `web-performance-optimization`
- `react-performance-optimization`
- `gsap-performance`

### 🧪 Testing

**Usar cuando:**

- Se escriban pruebas o se modifique lógica esencial
- Se corrijan o documenten bugs

**Skills:**

- `react-testing-library`
- `playwright-e2e-testing`

**Regla:**
Todo cambio importante debe incluir pruebas.

### 📝 Documentación y Planificación

**Usar cuando:**

- Se creen archivos README o documentación
- Se planifiquen tareas complejas (antes de tocar código)

**Skills:**

- `documentation-skill`
- `jsdoc-best-practices`
- `brainstorming`
- `writing-plans`
- `executing-plans`

### 🔍 Exploración y Búsqueda

**Usar cuando:**

- No esté claro qué skill aplicar
- Se necesiten nuevas herramientas en los agentes

**Skills:**

- `find-skills`

### 🧱 Arquitectura del Proyecto (CRÍTICA)

**Usar SIEMPRE en cualquier tarea:**

**Skills:**

- `sabor-architecture`

**Regla:**
Toda implementación debe seguir estrictamente _Screaming Architecture_.

## ⚡ Prioridad de Skills

En caso de conflicto entre skills al momento de programar, prevalece el siguiente orden:

1. `sabor-architecture`
2. `web-security`
3. `nodejs-best-practices` / `vercel-react-best-practices`
4. `performance-optimization` / `react-performance-optimization`
5. `ui-ux-pro-max` / `frontend-design`
