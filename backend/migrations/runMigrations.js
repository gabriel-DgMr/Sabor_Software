#!/usr/bin/env node

// Cargar variables de entorno desde .env
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en el directorio backend
dotenv.config({ path: join(__dirname, "..", ".env") });

import MigrationManager from "./migrationManager.js";

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || "localhost",
  user: process.env.DB_USER || process.env.MYSQL_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "sabor_db",
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || "3306", 10),
  multipleStatements: true,
  charset: "utf8mb4",
};

console.log("🔧 Configuración de base de datos:");
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Usuario: ${dbConfig.user}`);
console.log(`   Base de datos: ${dbConfig.database}`);
console.log(`   Contraseña: ${dbConfig.password ? "***" : "Sin contraseña"}\n`);

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const migrationManager = new MigrationManager(dbConfig);

  switch (command) {
    case "run":
      console.log("🚀 Iniciando ejecución de migrations...\n");
      await migrationManager.runMigrations();
      break;

    case "status":
      console.log("📊 Verificando estado de migrations...\n");
      await migrationManager.showMigrationStatus();
      break;

    case "help":
    default:
      console.log("\n📚 USO DE MIGRATIONS - SISTEMA SABOR");
      console.log("=====================================\n");
      console.log("Comandos disponibles:");
      console.log("  run     - Ejecutar todas las migrations pendientes");
      console.log("  status  - Mostrar el estado de todas las migrations");
      console.log("  help    - Mostrar esta ayuda\n");
      console.log("Ejemplos:");
      console.log("  node runMigrations.js run");
      console.log("  node runMigrations.js status");
      console.log("  npm run migrate:run");
      console.log("  npm run migrate:status\n");
      console.log("Variables de entorno disponibles:");
      console.log("  DB_HOST/MYSQL_HOST         - Host de la base de datos");
      console.log("  DB_USER/MYSQL_USER         - Usuario de la base de datos");
      console.log(
        "  DB_PASSWORD/MYSQL_PASSWORD - Contraseña de la base de datos",
      );
      console.log("  DB_NAME/MYSQL_DATABASE     - Nombre de la base de datos");
      console.log(
        "  DB_PORT/MYSQL_PORT         - Puerto de la base de datos\n",
      );
      console.log(
        "💡 Asegúrate de tener un archivo .env en el directorio backend con las variables configuradas.\n",
      );
      break;
  }
}

// Manejar errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Error no manejado:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Excepción no capturada:", error);
  process.exit(1);
});

// Ejecutar el programa principal
main();
