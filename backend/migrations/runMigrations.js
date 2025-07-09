#!/usr/bin/env node

import MigrationManager from './migrationManager.js';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sabor_db_1',
  multipleStatements: true,
  charset: 'utf8mb4'
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migrationManager = new MigrationManager(dbConfig);
  
  switch (command) {
    case 'run':
      console.log('🚀 Iniciando ejecución de migrations...\n');
      await migrationManager.runMigrations();
      break;
      
    case 'status':
      console.log('📊 Verificando estado de migrations...\n');
      await migrationManager.showMigrationStatus();
      break;
      
    case 'help':
    default:
      console.log('\n📚 USO DE MIGRATIONS - SISTEMA SABOR');
      console.log('=====================================\n');
      console.log('Comandos disponibles:');
      console.log('  run     - Ejecutar todas las migrations pendientes');
      console.log('  status  - Mostrar el estado de todas las migrations');
      console.log('  help    - Mostrar esta ayuda\n');
      console.log('Ejemplos:');
      console.log('  node runMigrations.js run');
      console.log('  node runMigrations.js status');
      console.log('  npm run migrate:run');
      console.log('  npm run migrate:status\n');
      console.log('Variables de entorno:');
      console.log('  DB_HOST     - Host de la base de datos (default: localhost)');
      console.log('  DB_USER     - Usuario de la base de datos (default: root)');
      console.log('  DB_PASSWORD - Contraseña de la base de datos (default: "")');
      console.log('  DB_NAME     - Nombre de la base de datos (default: sabor_db_1)\n');
      break;
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Error no manejado:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Ejecutar el programa principal
main(); 