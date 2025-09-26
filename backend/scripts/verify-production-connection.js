#!/usr/bin/env node

import mysql from "mysql2/promise";
import { config } from "../src/config/config.js";

/**
 * Script para verificar la conexión a la base de datos de producción
 * antes de insertar datos de prueba
 */

class ProductionConnectionVerifier {
  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  async verifyConnection() {
    console.log("🔍 Verificando conexión a la base de datos de producción...");
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    let connection = null;

    try {
      // Mostrar configuración (sin contraseña)
      console.log("\n📋 Configuración de conexión:");
      console.log(`   Host: ${config.db.host}`);
      console.log(`   User: ${config.db.user}`);
      console.log(`   Database: ${config.db.database}`);
      console.log(`   Port: ${config.db.port}`);
      console.log(
        `   SSL: ${this.isProduction ? "Habilitado" : "Deshabilitado"}`,
      );

      // Crear conexión
      connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
        ssl: this.isProduction ? { rejectUnauthorized: false } : false,
        connectTimeout: 30000,
        acquireTimeout: 60000,
        timeout: 60000,
      });

      console.log("✅ Conexión establecida exitosamente");

      // Verificar información del servidor
      const [serverInfo] = await connection.execute(
        "SELECT VERSION() as version, NOW() as current_time",
      );
      console.log(`📊 MySQL Version: ${serverInfo[0].version}`);
      console.log(`🕐 Server Time: ${serverInfo[0].current_time}`);

      // Verificar tablas existentes
      const [tables] = await connection.execute(
        `
        SELECT TABLE_NAME, TABLE_ROWS 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? 
        ORDER BY TABLE_NAME
      `,
        [config.db.database],
      );

      console.log(`\n📋 Tablas existentes (${tables.length}):`);
      tables.forEach((table) => {
        console.log(`   - ${table.TABLE_NAME}: ${table.TABLE_ROWS || 0} filas`);
      });

      // Verificar datos existentes
      await this.checkExistingData(connection);

      // Verificar estructura de tablas críticas
      await this.verifyTableStructure(connection);

      console.log("\n✅ Verificación completada exitosamente");
      console.log(
        "🚀 La base de datos está lista para insertar datos de prueba",
      );

      return true;
    } catch (error) {
      console.error("\n❌ Error en la verificación:");
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Errno: ${error.errno}`);

      if (error.code === "ER_ACCESS_DENIED_ERROR") {
        console.error("\n💡 Posibles soluciones:");
        console.error("   1. Verificar credenciales de base de datos");
        console.error("   2. Verificar que el usuario tenga permisos");
        console.error("   3. Verificar variables de entorno");
      } else if (error.code === "ECONNREFUSED") {
        console.error("\n💡 Posibles soluciones:");
        console.error(
          "   1. Verificar que el servidor MySQL esté ejecutándose",
        );
        console.error("   2. Verificar host y puerto");
        console.error("   3. Verificar configuración de firewall");
      } else if (error.code === "ER_BAD_DB_ERROR") {
        console.error("\n💡 Posibles soluciones:");
        console.error("   1. Verificar que la base de datos existe");
        console.error("   2. Crear la base de datos si no existe");
        console.error("   3. Verificar el nombre de la base de datos");
      }

      return false;
    } finally {
      if (connection) {
        await connection.end();
        console.log("🔌 Conexión cerrada");
      }
    }
  }

  async checkExistingData(connection) {
    try {
      console.log("\n📊 Verificando datos existentes...");

      // Verificar usuarios
      const [users] = await connection.execute(
        "SELECT COUNT(*) as total FROM usuarios WHERE activo = true",
      );
      console.log(`   👥 Usuarios activos: ${users[0].total}`);

      // Verificar productos
      const [products] = await connection.execute(
        "SELECT COUNT(*) as total FROM productos WHERE activo = true",
      );
      console.log(`   🍕 Productos activos: ${products[0].total}`);

      // Verificar pedidos
      const [orders] = await connection.execute(
        "SELECT COUNT(*) as total FROM pedidos WHERE id_estado != 1",
      );
      console.log(`   📦 Pedidos confirmados: ${orders[0].total}`);

      // Verificar categorías
      const [categories] = await connection.execute(
        "SELECT COUNT(*) as total FROM categorias WHERE activo = true",
      );
      console.log(`   📂 Categorías activas: ${categories[0].total}`);

      // Verificar estados
      const [states] = await connection.execute(
        "SELECT COUNT(*) as total FROM estados",
      );
      console.log(`   📋 Estados disponibles: ${states[0].total}`);

      // Verificar roles
      const [roles] = await connection.execute(
        "SELECT COUNT(*) as total FROM roles",
      );
      console.log(`   👤 Roles disponibles: ${roles[0].total}`);
    } catch (error) {
      console.error("⚠️  Error verificando datos existentes:", error.message);
    }
  }

  async verifyTableStructure(connection) {
    try {
      console.log("\n🔧 Verificando estructura de tablas críticas...");

      const criticalTables = [
        "usuarios",
        "productos",
        "pedidos",
        "detalle_pedidos",
        "categorias",
        "estados",
        "roles",
      ];

      for (const tableName of criticalTables) {
        try {
          const [columns] = await connection.execute(
            `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
          `,
            [config.db.database, tableName],
          );

          if (columns.length > 0) {
            console.log(`   ✅ ${tableName}: ${columns.length} columnas`);
          } else {
            console.log(`   ❌ ${tableName}: Tabla no encontrada`);
          }
        } catch (error) {
          console.log(`   ⚠️  ${tableName}: Error verificando estructura`);
        }
      }
    } catch (error) {
      console.error(
        "⚠️  Error verificando estructura de tablas:",
        error.message,
      );
    }
  }

  async run() {
    try {
      const success = await this.verifyConnection();

      if (success) {
        console.log("\n🎉 ¡La base de datos está lista!");
        console.log("💡 Puedes ejecutar el script de inserción de datos:");
        console.log("   npm run db:seed");
        process.exit(0);
      } else {
        console.log("\n❌ La verificación falló");
        console.log("💡 Corrige los errores antes de continuar");
        process.exit(1);
      }
    } catch (error) {
      console.error("💥 Error durante la verificación:", error.message);
      process.exit(1);
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new ProductionConnectionVerifier();
  verifier.run();
}

export default ProductionConnectionVerifier;
