import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import { config } from "./src/config/config.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import {
  helmetConfig,
  createRateLimiter,
  authRateLimiter,
  registerRateLimiter,
  sanitizeInput,
  preventSQLInjection,
} from "./src/middleware/security.js";

import authRoutes from "./src/routes/authRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import categoriaRoutes from "./src/routes/categoriaRoutes.js";
import reservaRoutes from "./src/routes/reservaRoutes.js";
import pedidoRoutes from "./src/routes/pedidoRoutes.js";
import horarioRoutes from "./src/routes/horarioRoutes.js";
import mensajeContactoRoutes from "./src/routes/contactoRoutes.js";
import mercadopagoRoutes from "./src/routes/mercadopagoRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import payuRoutes from "./src/routes/payuRoutes.js";
import calificacionRoutes from "./src/routes/calificacionRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import domicilioRoutes from "./src/routes/domicilioRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import helmet from "helmet";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Seguridad con Helmet
// ============================
// Configurar CSP basado en el entorno
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
        imgSrc: ["'self'", "data:", "https:", "https://cdn.jsdelivr.net"],
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
  })
);

// ============================
// Configuración de CORS
// ============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://sabor-production.up.railway.app",
];

if (process.env.NODE_ENV === "production") {
  if (process.env.RAILWAY_STATIC_URL) allowedOrigins.push(process.env.RAILWAY_STATIC_URL);
  if (process.env.CORS_ORIGIN) allowedOrigins.push(process.env.CORS_ORIGIN);
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// ============================
// Middlewares globales
// ============================
// app.use(createRateLimiter()); // Deshabilitado temporalmente
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(config.cookie.secret));
app.use(sanitizeInput);
app.use(preventSQLInjection);

// Delay random para prevenir timing attacks en auth
app.use("/api/auth", (req, res, next) => {
  const delay = Math.random() * 100 + 50; // 50-150ms
  setTimeout(next, delay);
});

// ============================
// Rutas API
// ============================
app.use("/api/auth", /* authRateLimiter, */ authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api", mensajeContactoRoutes);
app.use("/api/mercadopago", mercadopagoRoutes);
app.use("/api/payu", payuRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/calificaciones", calificacionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/domicilios", domicilioRoutes);
app.use("/api", healthRoutes);

// ============================
// Archivos estáticos seguros
// ============================
console.log("🔍 Configurando archivos estáticos...");
console.log("📁 Directorio actual:", __dirname);
console.log("📁 Ruta de uploads:", path.join(__dirname, "public/uploads"));
console.log(
  "📁 ¿Existe la carpeta?",
  fs.existsSync(path.join(__dirname, "public/uploads")),
);

if (fs.existsSync(path.join(__dirname, "public/uploads"))) {
  const files = fs.readdirSync(path.join(__dirname, "public/uploads"));
  console.log("📁 Archivos en uploads:", files);
}

// Middleware de debug para uploads
app.use("/uploads", (req, res, next) => {
  console.log("🔍 Petición a uploads:", req.path);
  console.log("🔍 Archivo solicitado:", req.path);
  const filePath = path.join(__dirname, "public/uploads", req.path);
  console.log("🔍 Ruta completa del archivo:", filePath);
  console.log("🔍 ¿Existe el archivo?", fs.existsSync(filePath));
  next();
});

// Servir archivos desde backend/public/uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (filePath.endsWith(".js") || filePath.endsWith(".php") || filePath.endsWith(".exe")) {
        res.setHeader("Content-Type", "text/plain");
      }

      res.setHeader("X-Content-Type-Options", "nosniff");

      if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    },
  })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (
          filePath.endsWith(".js") ||
          filePath.endsWith(".php") ||
          filePath.endsWith(".exe")
        ) {
          res.setHeader("Content-Type", "text/plain");
        }

        res.setHeader("X-Content-Type-Options", "nosniff");

        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
      }
    },
  })
);

// Servir el index.html del frontend
// Configurar rutas de archivos estáticos del frontend React
// Intentar diferentes rutas para desarrollo y producción
const frontendPaths = [
  path.join(__dirname, "../frontend/dist"),
  path.join(__dirname, "public/dist"),
  path.join(__dirname, "dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "dist"),
];

let frontendPath = null;
for (const testPath of frontendPaths) {
  if (fs.existsSync(testPath)) {
    frontendPath = testPath;
    break;
  }
}

if (frontendPath) {
  console.log(`📁 Sirviendo archivos estáticos desde: ${frontendPath}`);

  // Servir archivos estáticos del frontend React
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
} else {
  console.warn(
    "⚠️ No se encontró la carpeta de archivos estáticos del frontend",
  );
}

// Ruta para servir el index.html del frontend
app.get("/", (req, res) => {
  if (frontendPath) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    res.status(404).json({ error: "Frontend no disponible" });
  }
});

// Ruta catch-all para SPA (Single Page Application)
// Debe ir DESPUÉS de todas las rutas de API y ANTES de los middlewares de error
app.get(/^(?!\/api\/).*$/, (req, res) => {
  if (frontendPath) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    res.status(404).json({ error: "Frontend no disponible" });
  }
});

// ============================
// Middlewares de error
// ============================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================
// Iniciar servidor
// ============================
const PORT = process.env.PORT || config.server.port || 3000;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT} en modo ${config.server.mode}`);
  console.log("Configuración de seguridad activada");

  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log(`Desplegado en Railway - Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
    console.log(`URL: ${process.env.RAILWAY_STATIC_URL || "No disponible"}`);
  }
});

export default app;
