// src/controllers/dashboardController.js
import { pool } from "../config/dbconfig.js";

export const dashboardController = {
  // ==============================
  // MÉTRICAS GENERALES
  // ==============================
  async getMetrics(req, res) {
    try {
      console.log("Iniciando consulta de métricas del dashboard...");

      // Total usuarios
      const [totalUsuariosResult] = await pool.query(
        "SELECT COUNT(*) as total_usuarios FROM usuarios",
      );
      const total_usuarios = totalUsuariosResult[0]?.total_usuarios || 0;

      // Usuarios nuevos hoy
      const [usuariosNuevosResult] = await pool.query(
        "SELECT COUNT(*) as usuarios_nuevos FROM usuarios WHERE DATE(fecha_registro) = CURDATE()",
      );
      const usuarios_nuevos = usuariosNuevosResult[0]?.usuarios_nuevos || 0;

      // Usuarios activos (al menos un pedido en los últimos 30 días)
      const [usuariosActivosResult] = await pool.query(`
        SELECT COUNT(DISTINCT u.id_usuario) as usuarios_activos
        FROM usuarios u
        INNER JOIN pedidos p ON u.id_usuario = p.id_usuario
        WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);
      const usuarios_activos = usuariosActivosResult[0]?.usuarios_activos || 0;

      // Views (simulado con pedidos en últimos 7 días)
      const [viewsResult] = await pool.query(`
        SELECT COUNT(DISTINCT u.id_usuario) as views
        FROM usuarios u
        INNER JOIN pedidos p ON u.id_usuario = p.id_usuario
        WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);
      const views = viewsResult[0]?.views || 0;

      // Visitas (total pedidos últimos 7 días)
      const [visitasResult] = await pool.query(`
        SELECT COUNT(*) as visitas
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);
      const visitas = visitasResult[0]?.visitas || 0;

      // Pedidos por hora (últimos 7 días)
      const [pedidosPorHora] = await pool.query(`
        SELECT 
          HOUR(fecha_pedido) as hora,
          COUNT(*) as cantidad
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY HOUR(fecha_pedido)
        ORDER BY hora
      `);

      // Total usuarios por día (últimos 14 días)
      const [usuariosPorDia] = await pool.query(`
        SELECT DATE(fecha_registro) as fecha, COUNT(*) as cantidad
        FROM usuarios
        WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        GROUP BY fecha
        ORDER BY fecha
      `);

      const response = {
        total_usuarios,
        usuarios_nuevos,
        usuarios_activos,
        views,
        visitas,
        pedidosPorHora: pedidosPorHora || [],
        usuariosPorDia: usuariosPorDia || [],
      };

      console.log("Respuesta del dashboard:", response);
      return res.json(response);
    } catch (err) {
      console.error("Error detallado en dashboardController.getMetrics:", {
        message: err.message,
        stack: err.stack,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        code: err.code,
      });
      return res.status(500).json({
        error: "Error obteniendo métricas del dashboard",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // ==============================
  // MÉTRICAS DE VENTAS
  // ==============================
  async getSalesMetrics(req, res) {
    try {
      console.log("Iniciando consulta de métricas de ventas...");

      // Ventas totales
      const [ventasTotalesResult] = await pool.query(
        "SELECT SUM(total_pedido) as ventas_totales FROM pedidos WHERE id_estado IN (3, 5)",
      );
      const ventas_totales = ventasTotalesResult[0]?.ventas_totales || 0;

      // Ventas de hoy
      const [ventasHoyResult] = await pool.query(
        "SELECT SUM(total_pedido) as ventas_hoy FROM pedidos WHERE DATE(fecha_pedido) = CURDATE() AND id_estado IN (3, 5)",
      );
      const ventas_hoy = ventasHoyResult[0]?.ventas_hoy || 0;

      // Ventas de la semana
      const [ventasSemanaResult] = await pool.query(
        "SELECT SUM(total_pedido) as ventas_semana FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND id_estado IN (3, 5)",
      );
      const ventas_semana = ventasSemanaResult[0]?.ventas_semana || 0;

      // Ventas del mes (30 días)
      const [ventasMesResult] = await pool.query(
        "SELECT SUM(total_pedido) as ventas_mes FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND id_estado IN (3, 5)",
      );
      const ventas_mes = ventasMesResult[0]?.ventas_mes || 0;

      // Ventas por día (últimos 14 días)
      const [ventasPorDia] = await pool.query(`
        SELECT DATE(fecha_pedido) as fecha, SUM(total_pedido) as total
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) 
          AND id_estado IN (3, 5)
        GROUP BY DATE(fecha_pedido)
        ORDER BY fecha
      `);

      // Ventas por método de pago
      const [ventasPorMetodo] = await pool.query(`
        SELECT metodo_pago, COUNT(*) as cantidad, SUM(total_pedido) as total
        FROM pedidos
        WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
          AND id_estado IN (3, 5)
        GROUP BY metodo_pago
      `);

      // Productos más vendidos (últimos 30 días)
      const [productosVendidos] = await pool.query(`
        SELECT 
          p.id_producto,
          p.nombre_producto,
          SUM(dp.cantidad) as cantidad_vendida,
          SUM(dp.subtotal) as ingresos
        FROM detalle_pedidos dp
        JOIN productos p ON dp.id_producto = p.id_producto
        JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
        WHERE ped.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND ped.id_estado IN (3, 5)
        GROUP BY p.id_producto, p.nombre_producto
        ORDER BY cantidad_vendida DESC
        LIMIT 10
      `);

      const response = {
        ventas_totales,
        ventas_hoy,
        ventas_semana,
        ventas_mes,
        ventasPorDia: ventasPorDia || [],
        ventasPorMetodo: ventasPorMetodo || [],
        productosVendidos: productosVendidos || [],
      };

      console.log("Respuesta del dashboard de ventas:", response);
      return res.json(response);
    } catch (err) {
      console.error("Error detallado en dashboardController.getSalesMetrics:", {
        message: err.message,
        stack: err.stack,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        code: err.code,
      });
      return res.status(500).json({
        error: "Error obteniendo métricas de ventas",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // ==============================
  // MÉTRICAS DE EMPLEADOS
  // ==============================
  async getEmployeeMetrics(req, res) {
    try {
      console.log("Iniciando consulta de métricas de empleados...");

      // Total empleados
      const [totalEmpleadosResult] = await pool.query(
        "SELECT COUNT(*) as total_empleados FROM usuarios WHERE id_rol IN (2, 3)",
      );
      const total_empleados = totalEmpleadosResult[0]?.total_empleados || 0;

      // Empleados activos (últimos 30 días)
      const [empleadosActivosResult] = await pool.query(
        "SELECT COUNT(*) as empleados_activos FROM usuarios WHERE id_rol IN (2, 3) AND (last_active >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR last_active IS NULL)",
      );
      const empleados_activos =
        empleadosActivosResult[0]?.empleados_activos || 0;

      // Administradores (rol = 3)
      const [administradoresResult] = await pool.query(
        "SELECT COUNT(*) as administradores FROM usuarios WHERE id_rol = 3",
      );
      const administradores = administradoresResult[0]?.administradores || 0;

      // Empleados regulares (rol = 2)
      const [empleadosRegularesResult] = await pool.query(
        "SELECT COUNT(*) as empleados_regulares FROM usuarios WHERE id_rol = 2",
      );
      const empleados_regulares =
        empleadosRegularesResult[0]?.empleados_regulares || 0;

      // Empleados por rol
      const [empleadosPorRol] = await pool.query(`
        SELECT r.nombre_rol, COUNT(u.id_usuario) as cantidad
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_rol IN (2, 3)
        GROUP BY r.id_rol, r.nombre_rol
      `);

      // Actividad empleados últimos 7 días
      const [actividadEmpleados] = await pool.query(`
        SELECT 
          DATE(last_active) as fecha,
          COUNT(*) as empleados_activos
        FROM usuarios
        WHERE id_rol IN (2, 3) 
          AND last_active IS NOT NULL
          AND last_active >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(last_active)
        ORDER BY fecha
      `);

      // Lista de empleados con detalles
      const [listaEmpleados] = await pool.query(`
        SELECT 
          u.id_usuario,
          u.nombre_usuario,
          u.correo_usuario,
          u.fecha_registro,
          u.last_active,
          r.nombre_rol,
          CASE 
            WHEN u.last_active >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Activo'
            WHEN u.last_active >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'Reciente'
            WHEN u.last_active >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 'Inactivo'
            ELSE 'Muy inactivo'
          END as estado_actividad
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_rol IN (2, 3)
        ORDER BY u.last_active DESC
      `);

      const response = {
        total_empleados,
        empleados_activos,
        administradores,
        empleados_regulares,
        empleadosPorRol: empleadosPorRol || [],
        actividadEmpleados: actividadEmpleados || [],
        listaEmpleados: listaEmpleados || [],
      };

      console.log("Respuesta del dashboard de empleados:", response);
      return res.json(response);
    } catch (err) {
      console.error(
        "Error detallado en dashboardController.getEmployeeMetrics:",
        {
          message: err.message,
          stack: err.stack,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage,
          code: err.code,
        },
      );
      return res.status(500).json({
        error: "Error obteniendo métricas de empleados",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // ==============================
  // MÉTRICAS DE INVENTARIO
  // ==============================
  async getInventoryMetrics(req, res) {
    try {
      console.log("Iniciando consulta de métricas de inventario...");

      const [[currentDb]] = await pool.query("SELECT DATABASE() AS db_name");
      const database = currentDb?.db_name;

      const [stockMinColumn] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'stock_minimo'",
        [database],
      );
      const [stockMaxColumn] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'stock_maximo'",
        [database],
      );

      const hasStockMin = stockMinColumn.length > 0;
      const hasStockMax = stockMaxColumn.length > 0;

      const stockMinSelect = hasStockMin
        ? "COALESCE(p.stock_minimo, 5) AS stock_minimo"
        : "5 AS stock_minimo";
      const stockMaxSelect = hasStockMax
        ? "COALESCE(p.stock_maximo, 0) AS stock_maximo"
        : "0 AS stock_maximo";
      const lowStockCondition = hasStockMin
        ? "COALESCE(p.stock, 0) <= COALESCE(p.stock_minimo, 5)"
        : "COALESCE(p.stock, 0) <= 5";

      const [productosStock] = await pool.query(
        `SELECT
           p.id_producto,
           p.nombre_producto,
           COALESCE(p.stock, 0) AS stock,
           COALESCE(p.precio_producto, 0) AS precio_producto,
           p.imagen_producto,
           ${stockMinSelect},
           ${stockMaxSelect},
           c.nombre_categoria AS categoria
         FROM productos p
         LEFT JOIN categorias c ON p.id_categoria_producto = c.id_categoria
         ORDER BY stock ASC`,
      );

      const [resumen] = await pool.query(
        `SELECT
           COUNT(*) AS total_productos,
           SUM(CASE WHEN ${lowStockCondition} THEN 1 ELSE 0 END) AS productos_bajos,
           SUM(CASE WHEN COALESCE(p.stock, 0) = 0 THEN 1 ELSE 0 END) AS productos_agotados,
           SUM(COALESCE(p.stock, 0)) AS unidades_en_inventario,
           SUM(COALESCE(p.stock, 0) * COALESCE(p.precio_producto, 0)) AS valor_estimado
         FROM productos p`,
      );

      const [stockPorCategoria] = await pool.query(
        `SELECT
           COALESCE(c.nombre_categoria, 'Sin categoría') AS categoria,
           SUM(COALESCE(p.stock, 0)) AS total_stock,
           COUNT(*) AS productos
         FROM productos p
         LEFT JOIN categorias c ON p.id_categoria_producto = c.id_categoria
         GROUP BY c.nombre_categoria
         ORDER BY total_stock ASC`,
      );

      return res.json({
        resumen: resumen[0] || {},
        productosStock: productosStock || [],
        stockPorCategoria: stockPorCategoria || [],
      });
    } catch (err) {
      console.error(
        "Error detallado en dashboardController.getInventoryMetrics:",
        {
          message: err.message,
          stack: err.stack,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage,
          code: err.code,
        },
      );
      return res.status(500).json({
        error: "Error obteniendo métricas de inventario",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
};
