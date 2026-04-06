# 👨‍🍳 SABOR - Sistema Integral de Gestión de Restaurantes

![SABOR Banner](https://via.placeholder.com/1200x300.png?text=SABOR+-+Gestion+de+Restaurantes)

SABOR es una robusta plataforma web diseñada para administrar restaurantes y flujos de servicio alimenticio de principio a fin. El sistema maneja clientes, empleados, inventarios, toma de pedidos en tiempo real, reservas de mesas y checkout web pasarelas de pago.

Este proyecto ha sido estructurado bajo los principios de **Screaming Architecture**, separando responsabilidades estrictamente por módulos de dominio de negocio, y fomenta la creación de interfaces premium y escalables bajo la metodología **BEM en español**.

---

## 🛠️ Stack Tecnológico

### Backend (API REST)

- **Runtime:** Node.js (>=18.0.0) con ES Modules.
- **Framework:** Express.js (v5.1.0).
- **Base de Datos:** MySQL (Driver: \`mysql2/promise\`).
- **Seguridad:** JWT (\`jsonwebtoken\`), \`bcrypt\`, \`helmet\`, sanitización de inputs.
- **Pagos Integrados:** PayU Latam Web Checkout & Webhooks.
- **Otros:** Socket.io, Multer, PDFKit.

### Frontend (SPA)

- **Core:** React (v19) + React Router DOM (v7.5).
- **Herramienta de Construcción:** Vite.
- **Gestión de Peticiones:** Axios (instancia interceptora preconfigurada).
- **Gráficos:** Chart.js (\`react-chartjs-2\`).
- **Diseño & Estilos:** Vanilla CSS estricto siguiendo **metodología BEM en español** (Cero frameworks invasivos).

---

## 🏛️ Arquitectura del Proyecto (Screaming Architecture)

La aplicación **grita** su propósito directamente desde el árbol de directorios, organizándose en dominios en lugar de separar técnicamente por Controladores/Vistas/Modelos.

### Módulos de Dominio Actuales:

1. **Auth & Usuarios:** Inicio de sesión, roles (Admin, Empleado, Cliente), JWT.
2. **Productos:** Catálogo de comida, gestión de inventario y stock.
3. **Pedidos:** Carrito de compras, historial, domicilios, escáner QR.
4. **Reservas:** Gestión de disponibilidad de mesas y agendamiento.
5. **Pagos:** Checkout PayU Latam y procesamiento de referencias webhooks.
6. **Reportes & Dashboard:** Dashboards analíticos interactivos y generación de PDF.
7. **Marketing & Home:** Páginas públicas, "Quiénes Somos", "Sobre Nosotros".
8. **Contacto:** Gestión de mensajes de contacto y comunicación.

### Estructura Target (Ejemplo Real)

```text
SABOR_SOFTWARE/
├── backend/
│   ├── src/
│   │   ├── core/           # Middlewares globales, JWT, config DB
│   │   └── modules/        # Dominios de negocio "gritones"
│   │       ├── pedidos/    # (controllers.js, services.js, queries.js, routes.js)
│   │       ├── productos/
│   │       ├── usuarios/
│   │       ├── auth/
│   │       ├── reportes/
│   │       ├── pagos/
│   │       ├── contacto/
│   │       └── reservas/
│   └── app.js              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/            # App.jsx, router genérico, contexts base
│   │   ├── shared/         # Componentes, hooks y context UI transversales
│   │   └── modules/        # Dominios de negocio sincronizados con el backend
│   │       ├── pedidos/    # (pages/, components/, hooks/)
│   │       ├── productos/
│   │       ├── usuarios/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── home/
│   │       ├── marketing/
│   │       └── reservas/
│   └── index.css           # Carga variables globales
```

---

## 💻 Instalación y Ejecución Local

Para levantar este proyecto en un entorno de desarrollo local, el sistema asume que posees Node.js y MySQL ejecutándose en tu máquina.

### 1. Clonar e Instalar

En la raíz del repositorio, utiliza el script del monorepo preconfigurado para instalar las dependencias absolutas en front y back.

\`\`\`bash
npm run install:all
\`\`\`

### 2. Variables de Entorno

Debes crear un archivo \`.env\` dentro de \`backend/\` con al menos estas variables primordiales:

\`\`\`env

# SERVIDOR

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# DATABASE

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sabor_db

# SEGURIDAD

JWT_SECRET=tu_secreto_super_seguro

# PASARELAS DE PAGO (SANDBOX DEFAULT)

PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
PAYU_MERCHANT_ID=508029
PAYU_ACCOUNT_ID=512321
\`\`\`

### 3. Ejecución Concurrente

Para encender la API de Express y el servidor de desarrollo de Vite simultáneamente en la misma terminal:

\`\`\`bash
npm run dev
\`\`\`

- Frontend en: [http://localhost:5173](http://localhost:5173)
- Backend en: [http://localhost:3000](http://localhost:3000)

_(Si requieres construir para producción, simplemente corre \`npm run build\` desde la raíz)._

---

## 🎨 Metodología Front-End: BEM en Español

Con el objetivo de mantener los estilos altamente desacoplados, limpios y sostenibles en el tiempo; **está estrictamente estandarizado** el uso de BEM localizado:

1. **Bloque:** Identifica el componente o sección. (Ej. \`.tarjeta\`)
2. **Elemento:** Separado por doble subguion \`**\`. (Ej. \`.tarjeta**imagen\`)
3. **Modificador:** Separado por doble guion \`--\`. Describe estado o versión. (Ej. \`.tarjeta--destacada\`, \`.boton--secundario\`)

Esta estandarización asegura que el CSS es predictivo y no sufre de colisiones al interactuar dentro de distintas vistas modulares.

---

## 📝 Documentación de APIs

De acuerdo a las _Skills_ acopladas en \`AGENTS.md\`, todos los controladores y servicios de las entrañas del back-end integran nativamente JSDoc localizados, asegurando que la arquitectura base puede ser inspeccionada en tiempo real mediante cualquier editor moderno y TypeScript LSP.

---

> Desarrollado y refactorizado bajo estándares Premium IA. Consulta la carpeta \`.agents/skills\` para auditar comportamientos o instruir extensiones.
