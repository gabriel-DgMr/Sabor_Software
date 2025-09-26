// Ejemplo de uso de la nueva función createConnection
import { createConnection, pool } from "../config/dbconfig.js";

// Ejemplo 1: Usando conexión individual (nueva configuración)
export const ejemploConexionIndividual = async () => {
  let connection;
  try {
    // Crear conexión individual usando variables de entorno directamente
    connection = createConnection();

    // Ejecutar consulta
    const [rows] = await connection.execute("SELECT * FROM usuarios LIMIT 1");
    console.log("Resultado con conexión individual:", rows);

    return rows;
  } catch (error) {
    console.error("Error con conexión individual:", error);
    throw error;
  } finally {
    // Importante: cerrar la conexión individual
    if (connection) {
      await connection.end();
    }
  }
};

// Ejemplo 2: Usando pool de conexiones (configuración existente)
export const ejemploPool = async () => {
  try {
    // Usar el pool existente
    const [rows] = await pool.execute("SELECT * FROM usuarios LIMIT 1");
    console.log("Resultado con pool:", rows);

    return rows;
  } catch (error) {
    console.error("Error con pool:", error);
    throw error;
  }
  // No es necesario cerrar el pool, se maneja automáticamente
};

// Ejemplo 3: Transacción con conexión individual
export const ejemploTransaccionConConexion = async () => {
  let connection;
  try {
    connection = createConnection();
    await connection.beginTransaction();

    // Realizar operaciones dentro de la transacción
    await connection.execute("INSERT INTO logs (mensaje) VALUES (?)", [
      "Ejemplo de transacción",
    ]);

    await connection.commit();
    console.log("Transacción completada exitosamente");
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error en transacción:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
