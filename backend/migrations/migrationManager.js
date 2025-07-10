import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationManager {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
    this.connection = null;
    this.migrationsPath = path.join(__dirname);
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      console.log('✅ Conexión a la base de datos establecida');
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Conexión a la base de datos cerrada');
    }
  }

  // Helper method para procesar archivos SQL
  processSQLFile(sqlContent) {
    // Dividir por líneas y procesar
    const lines = sqlContent.split('\n');
    const statements = [];
    let currentStatement = '';
    let inBlock = false;
    let blockDepth = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Saltar líneas de comentarios y líneas vacías
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Agregar línea al statement actual
      currentStatement += line + '\n';
      
      // Detectar inicio de bloques (triggers, procedimientos, etc.)
      if (trimmedLine.toUpperCase().includes('BEGIN')) {
        inBlock = true;
        blockDepth++;
      }
      
      // Detectar fin de bloques
      if (trimmedLine.toUpperCase().includes('END')) {
        if (inBlock) {
          blockDepth--;
          if (blockDepth === 0) {
            inBlock = false;
          }
        }
      }
      
      // Si la línea termina con ';' y no estamos en un bloque, terminar el statement
      if (trimmedLine.endsWith(';') && !inBlock) {
        const statement = currentStatement.trim();
        if (statement) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // Agregar último statement si no terminó con ';'
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements;
  }

  // Helper method para ejecutar statements SQL
  async executeStatement(statement) {
    const trimmedStatement = statement.trim().toUpperCase();
    
    // Comandos que no son compatibles con prepared statements
    const unsupportedCommands = [
      'USE ', 
      'CREATE DATABASE', 
      'DROP DATABASE', 
      'SHOW ', 
      'DESCRIBE ', 
      'DESC ',
      'CREATE TRIGGER',
      'DROP TRIGGER',
      'CREATE PROCEDURE',
      'DROP PROCEDURE',
      'CREATE FUNCTION',
      'DROP FUNCTION'
    ];
    const requiresQuery = unsupportedCommands.some(cmd => trimmedStatement.startsWith(cmd));
    
    if (requiresQuery) {
      return await this.connection.query(statement);
    } else {
      return await this.connection.execute(statement);
    }
  }

  async initializeMigrationTable() {
    try {
      const migrationControlPath = path.join(this.migrationsPath, '000_migration_control.sql');
      const migrationControlSQL = fs.readFileSync(migrationControlPath, 'utf8');
      
      // Procesar el archivo SQL
      const statements = this.processSQLFile(migrationControlSQL);
      
      // Ejecutar cada declaración
      for (const statement of statements) {
        if (statement.trim()) {
          await this.executeStatement(statement);
        }
      }
      
      console.log('📋 Tabla de control de migrations inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar tabla de control:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const [rows] = await this.connection.execute(
        'SELECT migration_file FROM migration_history WHERE status = "success"'
      );
      return rows.map(row => row.migration_file);
    } catch (error) {
      console.error('❌ Error al obtener migrations ejecutadas:', error);
      return [];
    }
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql') && file !== '000_migration_control.sql')
        .sort();
    } catch (error) {
      console.error('❌ Error al leer archivos de migration:', error);
      return [];
    }
  }

  async executeMigration(migrationFile) {
    try {
      console.log(`🔄 Ejecutando migration: ${migrationFile}`);
      
      const migrationPath = path.join(this.migrationsPath, migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Procesar el archivo SQL
      const statements = this.processSQLFile(migrationSQL);
      
      // Ejecutar cada declaración
      for (const statement of statements) {
        if (statement.trim()) {
          await this.executeStatement(statement);
        }
      }
      
      // Registrar el migration como ejecutado
      await this.connection.execute(
        'INSERT IGNORE INTO migration_history (migration_file, status) VALUES (?, ?)',
        [migrationFile, 'success']
      );
      
      console.log(`✅ Migration ejecutado exitosamente: ${migrationFile}`);
      return true;
    } catch (error) {
      console.error(`❌ Error al ejecutar migration ${migrationFile}:`, error);
      
      // Registrar el error en la tabla de control usando INSERT IGNORE para evitar duplicados
      try {
        await this.connection.execute(
          'INSERT IGNORE INTO migration_history (migration_file, status, error_message) VALUES (?, ?, ?)',
          [migrationFile, 'error', error.message]
        );
      } catch (logError) {
        console.error('❌ Error al registrar error en migration_history:', logError);
      }
      
      return false;
    }
  }

  async runMigrations() {
    try {
      await this.connect();
      await this.initializeMigrationTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      console.log('📊 Migrations disponibles:', migrationFiles.length);
      console.log('📊 Migrations ejecutadas:', executedMigrations.length);
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No hay migrations pendientes para ejecutar');
        return true;
      }
      
      console.log('🔄 Migrations pendientes:', pendingMigrations.length);
      
      let allSuccess = true;
      for (const migration of pendingMigrations) {
        const success = await this.executeMigration(migration);
        if (!success) {
          allSuccess = false;
          break;
        }
      }
      
      if (allSuccess) {
        console.log('🎉 Todas las migrations se ejecutaron exitosamente');
      } else {
        console.log('❌ Algunas migrations fallaron');
      }
      
      return allSuccess;
    } catch (error) {
      console.error('❌ Error en runMigrations:', error);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  async rollbackMigration(migrationFile) {
    console.log(`⚠️  Rollback no implementado para: ${migrationFile}`);
    console.log('   Los rollbacks deben implementarse manualmente');
  }

  async showMigrationStatus() {
    try {
      await this.connect();
      await this.initializeMigrationTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      console.log('\n📊 ESTADO DE MIGRATIONS:');
      console.log('========================');
      
      for (const file of migrationFiles) {
        const status = executedMigrations.includes(file) ? '✅ EJECUTADA' : '⏳ PENDIENTE';
        console.log(`${status} - ${file}`);
      }
      
      console.log(`\nTotal: ${migrationFiles.length} migrations`);
      console.log(`Ejecutadas: ${executedMigrations.length}`);
      console.log(`Pendientes: ${migrationFiles.length - executedMigrations.length}`);
      
    } catch (error) {
      console.error('❌ Error al mostrar estado de migrations:', error);
    } finally {
      await this.disconnect();
    }
  }
}

export default MigrationManager; 