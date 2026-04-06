import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import helmet from "helmet";

import { config } from "./core/config/config.js";
import { accessLogger } from "./core/middlewares/logger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./core/middlewares/errorHandler.js";
import {
  sanitizeInput,
  preventSQLInjection,
} from "./core/middlewares/security.js";

// Importación de Rutas
import { pedidoRoutes, domicilioRoutes } from "./modules/pedidos/routes.js";
import authRoutes from "./modules/auth/routes.js";
import usuarioRoutes from "./modules/usuarios/routes.js";
import {
  productoRoutes,
  categoriaRoutes,
  calificacionRoutes,
} from "./modules/productos/routes.js";
import reservaRoutes from "./modules/reservas/routes.js";
import dashboardRoutes from "./modules/reportes/routes.js";
import pagosRoutes from "./modules/pagos/routes.js";
import mensajeContactoRoutes from "./modules/contacto/routes.js";
import bannersRoutes from "./modules/banners/routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Seguridad con Helmet
// ============================
const isDevelopment = process.env.NODE_ENV !== "production";
const connectSrcDirectives = [
  "'self'",
  "https://sabor-production.up.railway.app",
];

if (isDevelopment) {
  connectSrcDirectives.push("http://localhost:3000", "http://127.0.0.1:3000");
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: connectSrcDirectives,
        formAction: [
          "'self'",
          "https://checkout.payulatam.com",
          "https://sandbox.checkout.payulatam.com",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ============================
// Configuración de CORS
// ============================
const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://sabor-production.up.railway.app",
  "https://saborsoftware-production.up.railway.app",
].map(normalizeOrigin);

if (process.env.NODE_ENV === "production") {
  const envOrigins = [
    process.env.RAILWAY_STATIC_URL,
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map(normalizeOrigin)
    .filter(Boolean);

  allowedOrigins.push(...envOrigins);
}

const allowedOriginsSet = new Set(allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOriginsSet.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  }),
);

// ============================
// Logging de Accesos
// ============================
app.use(accessLogger);

// ============================
// Middlewares Globales
// ============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(config.cookie.secret));
app.use(sanitizeInput);
app.use(preventSQLInjection);

// Delay random para auth (Seguridad)
app.use("/api/auth", (req, res, next) => {
  const delay = Math.random() * 100 + 50;
  setTimeout(next, delay);
});

// ============================
// Registro de Rutas API
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/auth", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api", reservaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api", mensajeContactoRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/calificaciones", calificacionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/domicilios", domicilioRoutes);
app.use("/api/banners", bannersRoutes);
// app.use("/api", healthRoutes); // Deshabilitado si no se usa

// ============================
// Archivos Estáticos (Uploads)
// ============================
// La carpeta de uploads está en la raíz del backend (fuera de src)
const uploadsPath = path.join(__dirname, "../public/uploads");

if (fs.existsSync(uploadsPath)) {
  app.use(
    "/uploads",
    express.static(uploadsPath, {
      setHeaders: (res, filePath) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Content-Type-Options", "nosniff");
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
      },
    }),
  );
}

// ============================
// Frontend SPA Support
// ============================
const frontendPaths = [
  path.join(__dirname, "../../frontend/dist"),
  path.join(__dirname, "../public/dist"),
  path.join(__dirname, "../dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "dist"),
];

let frontendPath = frontendPaths.find((p) => fs.existsSync(p));

if (frontendPath) {
  app.use(
    express.static(frontendPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (
          filePath.match(
            /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
          )
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
        }
      },
    }),
  );

  // Ruta raíz y Catch-all para SPA
  const serveIndex = (req, res) =>
    res.sendFile(path.join(frontendPath, "index.html"));
  app.get("/", serveIndex);
  app.get(/^(?!\/api\/).*$/, serveIndex);
}

// ============================
// Manejo de Errores
// ============================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
