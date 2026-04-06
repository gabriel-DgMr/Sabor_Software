import app from "./src/app.js";
import { config } from "./src/core/config/config.js";

// ============================
// Configuración del Servidor
// ============================
const PORT = process.env.PORT || config.server.port || 3000;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Servidor corriendo en puerto ${PORT} en modo ${config.server.mode}`,
  );
  console.log("🔒 Configuración de seguridad activada");

  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log(
      `🌐 Desplegado en Railway - Entorno: ${process.env.RAILWAY_ENVIRONMENT}`,
    );
    console.log(`🔗 URL: ${process.env.RAILWAY_STATIC_URL || "No disponible"}`);
  }
});
