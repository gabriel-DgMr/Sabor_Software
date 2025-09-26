#!/usr/bin/env node

import mysql from "mysql2/promise";
import { config } from "../src/config/config.js";
import { appLogger } from "../src/middleware/logger.js";

/**
 * Script de diagnóstico para problemas de conexión a MySQL en producción
 */

class DatabaseDiagnostic {
  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  async runDiagnostic() {
    console.log("🔍 Iniciando diagnóstico de base de datos...");
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // 1. Verificar variables de entorno
    await this.checkEnvironmentVariables();

    // 2. Probar conexión básica
    await this.testBasicConnection();

    // 3. Probar conexión con diferentes configuraciones
    await this.testConnectionConfigurations();

    // 4. Verificar configuración de red
    await this.checkNetworkConfiguration();

    console.log("✅ Diagnóstico completado");
  }

  async checkEnvironmentVariables() {
    console.log("\n📋 Verificando variables de entorno...");

    const requiredVars = [
      "DB_HOST",
      "DB_USER",
      "DB_PASSWORD",
      "DB_NAME",
      "DB_PORT",
    ];
    const missingVars = [];

    requiredVars.forEach((varName) => {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: No configurada`);
      } else {
        // Ocultar contraseña por seguridad
        const displayValue = varName === "DB_PASSWORD" ? "***" : value;
        console.log(`✅ ${varName}: ${displayValue}`);
      }
    });

    if (missingVars.length > 0) {
      console.log(`⚠️ Variables faltantes: ${missingVars.join(", ")}`);
    }

    // Verificar configuración del objeto config
    console.log("\n🔧 Configuración del objeto config:");
    console.log(`Host: ${config.db.host}`);
    console.log(`User: ${config.db.user}`);
    console.log(`Password: ${config.db.password ? "***" : "No configurada"}`);
    console.log(`Database: ${config.db.database}`);
    console.log(`Port: ${config.db.port}`);
  }

  async testBasicConnection() {
    console.log("\n🔌 Probando conexión básica...");

    try {
      const connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
        connectTimeout: 10000,
      });

      const [rows] = await connection.execute("SELECT 1 as test");
      await connection.end();

      console.log("✅ Conexión básica exitosa");
      console.log(`📊 Resultado del test: ${JSON.stringify(rows[0])}`);
    } catch (error) {
      console.log("❌ Error en conexión básica:");
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensaje: ${error.message}`);
      console.log(`   Errno: ${error.errno}`);
      console.log(`   SQL State: ${error.sqlState}`);
    }
  }

  async testConnectionConfigurations() {
    console.log("\n🔧 Probando diferentes configuraciones...");

    const configurations = [
      {
        name: "Configuración estándar",
        config: {
          host: config.db.host,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          port: config.db.port,
          connectTimeout: 30000,
        },
      },
      {
        name: "Con SSL para producción",
        config: {
          host: config.db.host,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          port: config.db.port,
          connectTimeout: 30000,
          ssl: this.isProduction ? { rejectUnauthorized: false } : false,
        },
      },
      {
        name: "Con timeouts extendidos",
        config: {
          host: config.db.host,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          port: config.db.port,
          connectTimeout: 60000,
          acquireTimeout: 60000,
          timeout: 60000,
        },
      },
    ];

    for (const { name, config: connConfig } of configurations) {
      try {
        console.log(`\n🧪 Probando: ${name}`);
        const connection = await mysql.createConnection(connConfig);

        const [rows] = await connection.execute(
          "SELECT VERSION() as version, NOW() as current_time",
        );
        await connection.end();

        console.log(`✅ ${name}: Exitosa`);
        console.log(`   MySQL Version: ${rows[0].version}`);
        console.log(`   Server Time: ${rows[0].current_time}`);
      } catch (error) {
        console.log(`❌ ${name}: Error`);
        console.log(`   ${error.message}`);
      }
    }
  }

  async checkNetworkConfiguration() {
    console.log("\n🌐 Verificando configuración de red...");

    try {
      // Intentar conectar sin especificar base de datos
      const connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        port: config.db.port,
        connectTimeout: 10000,
      });

      // Verificar si podemos listar bases de datos
      const [databases] = await connection.execute("SHOW DATABASES");
      await connection.end();

      console.log("✅ Conexión de red exitosa");
      console.log(
        `📊 Bases de datos disponibles: ${databases.map((db) => db.Database).join(", ")}`,
      );

      // Verificar si nuestra base de datos existe
      const targetDb = databases.find(
        (db) => db.Database === config.db.database,
      );
      if (targetDb) {
        console.log(`✅ Base de datos '${config.db.database}' encontrada`);
      } else {
        console.log(`❌ Base de datos '${config.db.database}' no encontrada`);
      }
    } catch (error) {
      console.log("❌ Error en verificación de red:");
      console.log(`   ${error.message}`);
    }
  }
}

// Ejecutar diagnóstico si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostic = new DatabaseDiagnostic();
  diagnostic.runDiagnostic().catch((error) => {
    console.error("💥 Error durante el diagnóstico:", error);
    process.exit(1);
  });
}

export default DatabaseDiagnostic;
