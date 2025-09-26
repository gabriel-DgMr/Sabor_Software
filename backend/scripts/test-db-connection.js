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

console.log("🔍 Verificando conexión a MySQL...");
console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

console.log("\n📋 Variables de entorno cargadas:");
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(
  `DB_PASSWORD: ${process.env.DB_PASSWORD ? "***" : "No configurada"}`,
);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);

// Configuración de conexión
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectTimeout: 30000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  charset: "utf8mb4",
};

console.log("\n🔌 Intentando conectar...");

try {
  const connection = await mysql.createConnection(dbConfig);

  console.log("✅ Conexión exitosa!");

  // Probar consulta básica
  const [rows] = await connection.execute(
    "SELECT VERSION() as version, NOW() as current_time, DATABASE() as database_name",
  );

  console.log("\n📊 Información del servidor:");
  console.log(`MySQL Version: ${rows[0].version}`);
  console.log(`Server Time: ${rows[0].current_time}`);
  console.log(`Database: ${rows[0].database_name}`);

  // Verificar tablas existentes
  try {
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`\n📋 Tablas encontradas: ${tables.length}`);
    tables.forEach((table) => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
  } catch (error) {
    console.log(`\n⚠️ No se pudieron listar las tablas: ${error.message}`);
  }

  await connection.end();
  console.log("\n✅ Conexión cerrada correctamente");
} catch (error) {
  console.log("\n❌ Error de conexión:");
  console.log(`Código: ${error.code}`);
  console.log(`Mensaje: ${error.message}`);
  console.log(`Errno: ${error.errno}`);
  console.log(`SQL State: ${error.sqlState}`);

  // Sugerencias de solución
  console.log("\n💡 Posibles soluciones:");
  if (error.code === "ECONNREFUSED") {
    console.log("- Verificar que MySQL esté ejecutándose");
    console.log("- Verificar el puerto (3306 por defecto)");
    console.log("- Verificar que no haya firewall bloqueando la conexión");
  } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.log("- Verificar credenciales de usuario y contraseña");
    console.log(
      "- Verificar que el usuario tenga permisos en la base de datos",
    );
  } else if (error.code === "ER_BAD_DB_ERROR") {
    console.log("- Verificar que la base de datos existe");
    console.log("- Crear la base de datos si no existe");
  } else if (error.code === "ETIMEDOUT") {
    console.log("- Verificar la conectividad de red");
    console.log("- Aumentar el timeout de conexión");
  }

  process.exit(1);
}
