import { pool } from "../../core/config/dbconfig.js";

export const getMetricsQuery = async () => {
  const [[total_usuarios]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios",
  );
  const [[usuarios_nuevos]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios WHERE DATE(fecha_registro) = CURDATE()",
  );
  const [[usuarios_activos]] = await pool.query(
    "SELECT COUNT(DISTINCT u.id_usuario) as curr FROM usuarios u INNER JOIN pedidos p ON u.id_usuario = p.id_usuario WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
  );
  const [[views]] = await pool.query(
    "SELECT COUNT(DISTINCT u.id_usuario) as curr FROM usuarios u INNER JOIN pedidos p ON u.id_usuario = p.id_usuario WHERE p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
  );
  const [[visitas]] = await pool.query(
    "SELECT COUNT(*) as curr FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
  );
  const [pedidosPorHora] = await pool.query(
    "SELECT HOUR(fecha_pedido) as hora, COUNT(*) as cantidad FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY HOUR(fecha_pedido) ORDER BY hora",
  );
  const [usuariosPorDia] = await pool.query(
    "SELECT DATE(fecha_registro) as fecha, COUNT(*) as cantidad FROM usuarios WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY fecha ORDER BY fecha",
  );

  return {
    total_usuarios: total_usuarios?.curr || 0,
    usuarios_nuevos: usuarios_nuevos?.curr || 0,
    usuarios_activos: usuarios_activos?.curr || 0,
    views: views?.curr || 0,
    visitas: visitas?.curr || 0,
    pedidosPorHora: pedidosPorHora || [],
    usuariosPorDia: usuariosPorDia || [],
  };
};

export const getSalesMetricsQuery = async () => {
  const [[ventas_totales]] = await pool.query(
    "SELECT SUM(total_pedido) as curr FROM pedidos WHERE id_estado IN (3, 5)",
  );
  const [[ventas_hoy]] = await pool.query(
    "SELECT SUM(total_pedido) as curr FROM pedidos WHERE DATE(fecha_pedido) = CURDATE() AND id_estado IN (3, 5)",
  );
  const [[ventas_semana]] = await pool.query(
    "SELECT SUM(total_pedido) as curr FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND id_estado IN (3, 5)",
  );
  const [[ventas_mes]] = await pool.query(
    "SELECT SUM(total_pedido) as curr FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND id_estado IN (3, 5)",
  );

  const [ventasPorDia] = await pool.query(
    "SELECT DATE(fecha_pedido) as fecha, SUM(total_pedido) as total FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND id_estado IN (3, 5) GROUP BY DATE(fecha_pedido) ORDER BY fecha",
  );
  const [ventasPorMetodo] = await pool.query(
    "SELECT metodo_pago, COUNT(*) as cantidad, SUM(total_pedido) as total FROM pedidos WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND id_estado IN (3, 5) GROUP BY metodo_pago",
  );
  const [productosVendidos] = await pool.query(`
    SELECT p.id_producto, p.nombre_producto, SUM(dp.cantidad) as cantidad_vendida, SUM(dp.subtotal) as ingresos
    FROM detalle_pedidos dp
    JOIN productos p ON dp.id_producto = p.id_producto
    JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
    WHERE ped.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND ped.id_estado IN (3, 5)
    GROUP BY p.id_producto, p.nombre_producto
    ORDER BY cantidad_vendida DESC LIMIT 10
  `);

  return {
    ventas_totales: ventas_totales?.curr || 0,
    ventas_hoy: ventas_hoy?.curr || 0,
    ventas_semana: ventas_semana?.curr || 0,
    ventas_mes: ventas_mes?.curr || 0,
    ventasPorDia: ventasPorDia || [],
    ventasPorMetodo: ventasPorMetodo || [],
    productosVendidos: productosVendidos || [],
  };
};

export const getEmployeeMetricsQuery = async () => {
  const [[total_empleados]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios WHERE id_rol IN (2, 3)",
  );
  const [[empleados_activos]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios WHERE id_rol IN (2, 3) AND (last_active >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR last_active IS NULL)",
  );
  const [[administradores]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios WHERE id_rol = 3",
  );
  const [[empleados_regulares]] = await pool.query(
    "SELECT COUNT(*) as curr FROM usuarios WHERE id_rol = 2",
  );

  const [empleadosPorRol] = await pool.query(
    "SELECT r.nombre_rol, COUNT(u.id_usuario) as cantidad FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.id_rol IN (2, 3) GROUP BY r.id_rol, r.nombre_rol",
  );
  const [actividadEmpleados] = await pool.query(
    "SELECT DATE(last_active) as fecha, COUNT(*) as empleados_activos FROM usuarios WHERE id_rol IN (2, 3) AND last_active IS NOT NULL AND last_active >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(last_active) ORDER BY fecha",
  );
  const [listaEmpleados] = await pool.query(`
    SELECT u.id_usuario, u.nombre_usuario, u.correo_usuario, u.fecha_registro, u.last_active, r.nombre_rol,
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

  return {
    total_empleados: total_empleados?.curr || 0,
    empleados_activos: empleados_activos?.curr || 0,
    administradores: administradores?.curr || 0,
    empleados_regulares: empleados_regulares?.curr || 0,
    empleadosPorRol: empleadosPorRol || [],
    actividadEmpleados: actividadEmpleados || [],
    listaEmpleados: listaEmpleados || [],
  };
};

export const getInventoryMetricsQuery = async () => {
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

  const [productosStock] = await pool.query(`
    SELECT p.id_producto, p.nombre_producto, COALESCE(p.stock, 0) AS stock, COALESCE(p.precio_producto, 0) AS precio_producto,
           p.imagen_producto, ${stockMinSelect}, ${stockMaxSelect}, c.nombre_categoria AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY stock ASC
  `);

  const [resumen] = await pool.query(`
    SELECT COUNT(*) AS total_productos,
           SUM(CASE WHEN ${lowStockCondition} THEN 1 ELSE 0 END) AS productos_bajos,
           SUM(CASE WHEN COALESCE(p.stock, 0) = 0 THEN 1 ELSE 0 END) AS productos_agotados,
           SUM(COALESCE(p.stock, 0)) AS unidades_en_inventario,
           SUM(COALESCE(p.stock, 0) * COALESCE(p.precio_producto, 0)) AS valor_estimado
    FROM productos p
  `);

  const [stockPorCategoria] = await pool.query(`
    SELECT COALESCE(c.nombre_categoria, 'Sin categoría') AS categoria,
           SUM(COALESCE(p.stock, 0)) AS total_stock, COUNT(*) AS productos
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    GROUP BY c.nombre_categoria
    ORDER BY total_stock ASC
  `);

  return {
    resumen: resumen[0] || {},
    productosStock: productosStock || [],
    stockPorCategoria: stockPorCategoria || [],
  };
};
