import "dotenv/config";
import { pool } from "../src/core/config/dbconfig.js";

const createTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS banners (
      id_banner INT AUTO_INCREMENT PRIMARY KEY,
      imagen_url VARCHAR(255) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      boton_texto VARCHAR(50),
      boton_enlace VARCHAR(255),
      orden INT DEFAULT 0,
      activo TINYINT(1) DEFAULT 1,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  try {
    const [result] = await pool.query(sql);
    console.log('Tabla "banners" creada o ya existente.', result);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear la tabla "banners":', error);
    process.exit(1);
  }
};

createTable();
