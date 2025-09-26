#!/usr/bin/env node

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

// Configurar rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🚂 Railway Database Diagnostic Tool");
console.log("=====================================");
console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

console.log("\n📋 Variables de entorno detectadas:");
const envVars = [
  "MYSQLHOST",
  "MYSQLUSER",
  "MYSQLPASSWORD",
  "MYSQLDATABASE",
  "MYSQLPORT",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
  "NODE_ENV",
  "PORT",
];

envVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes("PASSWORD")) {
      console.log(`${varName}: ***`);
    } else {
      console.log(`${varName}: ${value}`);
    }
  } else {
    console.log(`${varName}: ❌ No configurada`);
  }
});

// Determinar configuración a usar
const host = process.env.MYSQLHOST || process.env.DB_HOST;
const user = process.env.MYSQLUSER || process.env.DB_USER;
const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
const database = process.env.MYSQLDATABASE || process.env.DB_NAME;
const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;

console.log("\n🔧 Configuración de conexión final:");
console.log(`Host: ${host || "❌ No configurado"}`);
console.log(`User: ${user || "❌ No configurado"}`);
console.log(`Password: ${password ? "***" : "❌ No configurado"}`);
console.log(`Database: ${database || "❌ No configurado"}`);
console.log(`Port: ${port}`);

// Verificar que todas las variables necesarias estén configuradas
const missingVars = [];
if (!host) missingVars.push("MYSQLHOST o DB_HOST");
if (!user) missingVars.push("MYSQLUSER o DB_USER");
if (!password) missingVars.push("MYSQLPASSWORD o DB_PASSWORD");
if (!database) missingVars.push("MYSQLDATABASE o DB_NAME");

if (missingVars.length > 0) {
  console.log("\n❌ Variables de entorno faltantes:");
  missingVars.forEach((varName) => console.log(`   - ${varName}`));
  console.log("\n💡 Soluciones:");
  console.log(
    "1. Verifica que Railway haya configurado las variables automáticamente",
  );
  console.log("2. Ve a Railway Dashboard > Tu Proyecto > Variables");
  console.log(
    "3. Asegúrate de que la base de datos MySQL esté conectada al proyecto",
  );
  process.exit(1);
}

// Configuración de conexión para Railway
const dbConfig = {
  host,
  user,
  password,
  database,
  port: parseInt(port),
  connectTimeout: 10000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  charset: "utf8mb4",
};

console.log("\n🔌 Intentando conectar a la base de datos...");

try {
  const connection = await mysql.createConnection(dbConfig);
  console.log("✅ Conexión exitosa!");

  // Probar consulta básica
  const [rows] = await connection.execute(
    "SELECT VERSION() as version, NOW() as current_time, DATABASE() as database_name, USER() as current_user",
  );

  console.log("\n📊 Información del servidor:");
  console.log(`MySQL Version: ${rows[0].version}`);
  console.log(`Server Time: ${rows[0].current_time}`);
  console.log(`Database: ${rows[0].database_name}`);
  console.log(`User: ${rows[0].current_user}`);

  // Verificar tablas existentes
  try {
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`\n📋 Tablas encontradas: ${tables.length}`);
    if (tables.length > 0) {
      tables.forEach((table) => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    } else {
      console.log("   ⚠️ No hay tablas en la base de datos");
    }
  } catch (error) {
    console.log(`\n⚠️ No se pudieron listar las tablas: ${error.message}`);
  }

  await connection.end();
  console.log("\n✅ Conexión cerrada correctamente");
  console.log("\n🎉 ¡Diagnóstico completado exitosamente!");
} catch (error) {
  console.log("\n❌ Error de conexión:");
  console.log(`Código: ${error.code}`);
  console.log(`Mensaje: ${error.message}`);
  console.log(`Errno: ${error.errno}`);
  console.log(`SQL State: ${error.sqlState}`);

  console.log("\n💡 Soluciones específicas para Railway:");

  if (error.code === "ECONNREFUSED") {
    console.log("- Verifica que la base de datos MySQL esté activa en Railway");
    console.log("- Verifica que el puerto sea correcto (Railway usa 3306)");
    console.log(
      "- Asegúrate de que el servicio de base de datos esté desplegado",
    );
  } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.log("- Verifica las credenciales en Railway Dashboard > Variables");
    console.log("- Asegúrate de que MYSQLUSER y MYSQLPASSWORD sean correctos");
    console.log("- Verifica que el usuario tenga permisos en la base de datos");
  } else if (error.code === "ER_BAD_DB_ERROR") {
    console.log("- Verifica que MYSQLDATABASE sea correcto");
    console.log("- La base de datos debe existir en Railway");
  } else if (error.code === "ETIMEDOUT") {
    console.log("- Railway puede estar experimentando latencia");
    console.log("- Verifica la conectividad de red");
    console.log("- Intenta aumentar el connectTimeout");
  } else if (error.code === "ENOTFOUND") {
    console.log("- Verifica que MYSQLHOST sea correcto");
    console.log(
      "- Railway debe haber configurado esta variable automáticamente",
    );
  }

  console.log("\n🔧 Pasos para solucionar:");
  console.log("1. Ve a Railway Dashboard > Tu Proyecto");
  console.log("2. Verifica que la base de datos MySQL esté conectada");
  console.log("3. Revisa las variables de entorno en la sección Variables");
  console.log("4. Si es necesario, reconecta la base de datos");
  console.log("5. Reinicia el servicio de aplicación");

  process.exit(1);
}
