import mysql from "mysql2/promise";
import { dbConfig } from "../config/dbconfig.js";

const pool = mysql.createPool(dbConfig);

export const dashboardController = {
  async getMetrics(req, res) {
    try {
      // Total usuarios
      const [[{ total_usuarios }]] = await pool.query(
        "SELECT COUNT(*) as total_usuarios FROM usuarios",
      );
      // Usuarios nuevos hoy
      const [[{ usuarios_nuevos }]] = await pool.query(
        "SELECT COUNT(*) as usuarios_nuevos FROM usuarios WHERE DATE(fecha_registro) = CURDATE()",
      );
      // Usuarios activos (todos los usuarios con activo = 1)
      const [[{ usuarios_activos }]] = await pool.query(
        "SELECT COUNT(*) as usuarios_activos FROM usuarios WHERE activo = 1",
      );
      // Views y visitas (usaremos total usuarios y usuarios nuevos como ejemplo)
      // Pedidos por franja horaria (para gráfico de dona)
      const [pedidosPorHora] = await pool.query(`
        SELECT 
          CASE 
            WHEN HOUR(fecha_pedido) BETWEEN 8 AND 11 THEN '8 am - 12 pm'
            WHEN HOUR(fecha_pedido) BETWEEN 12 AND 15 THEN '12 pm - 4 pm'
            WHEN HOUR(fecha_pedido) BETWEEN 16 AND 19 THEN '4 pm - 8 pm'
            ELSE '8 pm - 12 am'
          END as franja,
          COUNT(*) as cantidad
        FROM pedidos
        WHERE DATE(fecha_pedido) = CURDATE()
        GROUP BY franja
      `);
      // Total de usuarios por día (para gráfico de línea)
      const [usuariosPorDia] = await pool.query(`
        SELECT DATE(fecha_registro) as fecha, COUNT(*) as cantidad
        FROM usuarios
        WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        GROUP BY fecha
        ORDER BY fecha
      `);
      res.json({
        total_usuarios,
        usuarios_nuevos,
        usuarios_activos,
        views: total_usuarios, // Simulación
        visitas: total_usuarios - usuarios_nuevos, // Simulación
        pedidosPorHora,
        usuariosPorDia,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error obteniendo métricas del dashboard" });
    }
  },
};
