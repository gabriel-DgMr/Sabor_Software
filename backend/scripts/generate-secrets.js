#!/usr/bin/env node

import crypto from "crypto";

/**
 * Script para generar secretos seguros para producción
 */

console.log("🔐 Generando secretos seguros para producción...\n");

// Generar JWT_SECRET (mínimo 32 caracteres)
const jwtSecret = crypto.randomBytes(64).toString("hex");
console.log("JWT_SECRET=" + jwtSecret);

// Generar COOKIE_SECRET (mínimo 32 caracteres)
const cookieSecret = crypto.randomBytes(64).toString("hex");
console.log("COOKIE_SECRET=" + cookieSecret);

console.log("\n📧 Variables de email que necesitas configurar manualmente:");
console.log("EMAIL_USER=tu_email@gmail.com");
console.log("EMAIL_PASSWORD=tu_contraseña_de_aplicacion");

console.log("\n🌐 Variables de URL que necesitas configurar:");
console.log("CORS_ORIGIN=https://tu-dominio.railway.app");
console.log("FRONTEND_URL=https://tu-dominio.railway.app");

console.log("\n📋 Instrucciones:");
console.log("1. Copia los valores JWT_SECRET y COOKIE_SECRET generados arriba");
console.log("2. Configúralos en Railway junto con las otras variables");
console.log(
  "3. Para EMAIL_USER y EMAIL_PASSWORD, usa tu cuenta de Gmail con contraseña de aplicación",
);
console.log(
  "4. Para CORS_ORIGIN y FRONTEND_URL, usa la URL de tu despliegue de Railway",
);

console.log(
  "\n✅ Todas las variables están listas para configurar en Railway!",
);
