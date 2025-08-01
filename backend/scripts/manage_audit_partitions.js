import mysql from "mysql2/promise";
import { config } from "../src/config/config.js";

class AuditPartitionManager {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(config.db);
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async showPartitionInfo() {
    const conn = await this.connect();

    console.log("\n🗂️  INFORMACIÓN DE PARTICIONES - TABLA users_audit");
    console.log("=".repeat(60));

    const [stats] = await conn.execute(`
            SELECT 
                COUNT(*) as total_partitions,
                MIN(partition_month) as oldest_partition,
                MAX(partition_month) as newest_partition,
                SUM(table_rows) as total_rows,
                SUM(size_mb) as total_size_mb
            FROM v_audit_partition_info
        `);

    console.log(`📊 Total de particiones: ${stats[0].total_partitions}`);
    console.log(`📅 Partición más antigua: ${stats[0].oldest_partition}`);
    console.log(`📅 Partición más nueva: ${stats[0].newest_partition}`);
    console.log(`📈 Total de registros: ${stats[0].total_rows}`);
    console.log(`💾 Tamaño total: ${stats[0].total_size_mb} MB`);

    console.log("\n📋 DETALLE DE PARTICIONES:");
    console.log("-".repeat(60));

    const [partitions] = await conn.execute(`
            SELECT 
                partition_name,
                partition_month,
                table_rows,
                size_mb
            FROM v_audit_partition_info
            ORDER BY partition_ordinal_position
        `);

    partitions.forEach((partition) => {
      console.log(
        `🗂️  ${partition.partition_name} | ${partition.partition_month} | ${partition.table_rows} rows | ${partition.size_mb} MB`,
      );
    });
  }

  async showEvents() {
    const conn = await this.connect();

    console.log("\n⏰ EVENTOS AUTOMÁTICOS");
    console.log("=".repeat(40));

    const [events] = await conn.execute(
      `
            SELECT 
                event_name,
                interval_value,
                interval_field,
                status,
                last_executed
            FROM information_schema.events 
            WHERE event_schema = ?
        `,
      [config.db.database],
    );

    events.forEach((event) => {
      console.log(`📅 ${event.event_name}`);
      console.log(
        `   ⏱️  Frecuencia: Cada ${event.interval_value} ${event.interval_field}`,
      );
      console.log(`   🔄 Estado: ${event.status}`);
      console.log(`   📅 Última ejecución: ${event.last_executed || "Nunca"}`);
      console.log("");
    });
  }

  async createPartitions() {
    const conn = await this.connect();

    console.log("\n🔧 CREANDO PARTICIONES FUTURAS...");

    try {
      await conn.execute("CALL sp_create_audit_partitions()");
      console.log("✅ Particiones creadas exitosamente");

      // Mostrar información actualizada
      await this.showPartitionInfo();
    } catch (error) {
      console.error("❌ Error creando particiones:", error.message);
    }
  }

  async testAuditLog() {
    const conn = await this.connect();

    console.log("\n🧪 PROBANDO SISTEMA DE AUDITORÍA...");

    try {
      // Crear un usuario de prueba
      const testEmail = `test_audit_${Date.now()}@example.com`;

      await conn.execute(
        `
                INSERT INTO users (email, password, nombre, tipo_usuario) 
                VALUES (?, 'test_password', 'Test User', 'cliente')
            `,
        [testEmail],
      );

      console.log("✅ Usuario de prueba creado");

      // Verificar que se creó el log de auditoría
      const [auditLogs] = await conn.execute(
        `
                SELECT * FROM users_audit 
                WHERE JSON_EXTRACT(new_values, '$.email') = ? 
                ORDER BY changed_at DESC 
                LIMIT 1
            `,
        [testEmail],
      );

      if (auditLogs.length > 0) {
        console.log("✅ Log de auditoría creado correctamente");
        console.log(`📝 Acción: ${auditLogs[0].action}`);
        console.log(`📅 Fecha: ${auditLogs[0].changed_at}`);
        console.log(
          `🗂️  Partición: ${await this.getPartitionForDate(auditLogs[0].changed_at)}`,
        );
      } else {
        console.log("❌ No se creó el log de auditoría");
      }

      // Limpiar usuario de prueba
      await conn.execute("DELETE FROM users WHERE email = ?", [testEmail]);
      console.log("🧹 Usuario de prueba eliminado");
    } catch (error) {
      console.error("❌ Error en prueba de auditoría:", error.message);
    }
  }

  async getPartitionForDate(date) {
    const conn = await this.connect();

    const [result] = await conn.execute(
      "SELECT fn_get_audit_partition_for_date(?) as partition_name",
      [date],
    );

    return result[0].partition_name;
  }

  async cleanupOldPartitions() {
    const conn = await this.connect();

    console.log("\n🧹 LIMPIANDO PARTICIONES ANTIGUAS...");

    try {
      await conn.execute("CALL sp_cleanup_old_audit_partitions()");
      console.log("✅ Limpieza de particiones completada");

      // Mostrar información actualizada
      await this.showPartitionInfo();
    } catch (error) {
      console.error("❌ Error en limpieza:", error.message);
    }
  }

  async showMaintenanceLog() {
    const conn = await this.connect();

    console.log("\n📋 LOG DE MANTENIMIENTO");
    console.log("=".repeat(50));

    const [logs] = await conn.execute(`
            SELECT operation, message, executed_at 
            FROM migration_log 
            WHERE operation IN ('PARTITION_CREATE', 'PARTITION_DROP', 'MIGRATION_COMPLETE')
            ORDER BY executed_at DESC 
            LIMIT 10
        `);

    logs.forEach((log) => {
      console.log(`${log.executed_at} | ${log.operation} | ${log.message}`);
    });
  }

  async runFullCheck() {
    console.log("🔍 VERIFICACIÓN COMPLETA DEL SISTEMA DE PARTICIONADO");
    console.log("=".repeat(70));

    await this.showPartitionInfo();
    await this.showEvents();
    await this.testAuditLog();
    await this.showMaintenanceLog();

    console.log("\n✅ Verificación completa finalizada");
  }
}

// CLI Interface
const manager = new AuditPartitionManager();

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "info":
        await manager.showPartitionInfo();
        break;
      case "events":
        await manager.showEvents();
        break;
      case "create":
        await manager.createPartitions();
        break;
      case "test":
        await manager.testAuditLog();
        break;
      case "cleanup":
        await manager.cleanupOldPartitions();
        break;
      case "log":
        await manager.showMaintenanceLog();
        break;
      case "check":
        await manager.runFullCheck();
        break;
      default:
        console.log(`
🗂️  GESTOR DE PARTICIONES - TABLA AUDITORÍA
=========================================

Comandos disponibles:
  info     - Mostrar información de particiones
  events   - Mostrar eventos automáticos
  create   - Crear particiones futuras manualmente
  test     - Probar sistema de auditoría
  cleanup  - Limpiar particiones antiguas
  log      - Mostrar log de mantenimiento
  check    - Verificación completa del sistema

Uso: node scripts/manage_audit_partitions.js [comando]
                `);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await manager.disconnect();
  }
}

if (process.argv[1].endsWith("manage_audit_partitions.js")) {
  main();
}

export default AuditPartitionManager;
