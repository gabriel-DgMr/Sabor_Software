import mysql from 'mysql2/promise';
import { dbConfig } from '../config/dbconfig.js';

(async () => {
  const pool = mysql.createPool(dbConfig);
  try {
    const horas = 24;
    const [result] = await pool.query(
      `DELETE FROM clientes
       WHERE activo = false
         AND email_verificado = false
         AND fecha_registro < (NOW() - INTERVAL ? HOUR)`,
      [horas]
    );
    console.log(`Cuentas eliminadas: ${result.affectedRows}`);
  } catch (error) {
    console.error('Error al eliminar cuentas no verificadas:', error);
  } finally {
    await pool.end();
  }
})(); 