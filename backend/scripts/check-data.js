#!/usr/bin/env node

import mysql from "mysql2/promise";
import { config } from "../src/config/config.js";

/**
 * Script simple para verificar datos en la base de datos
 */

async function checkData() {
  let connection = null;

  try {
    console.log("🔍 Verificando datos en la base de datos...");

    // Crear conexión
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      connectTimeout: 30000,
    });

    console.log("✅ Conectado a la base de datos");

    // Verificar usuarios
    const [users] = await connection.execute(
      "SELECT COUNT(*) as total FROM usuarios WHERE activo = true",
    );
    console.log(`👥 Usuarios activos: ${users[0].total}`);

    // Verificar productos
    const [products] = await connection.execute(
      "SELECT COUNT(*) as total FROM productos WHERE activo = true",
    );
    console.log(`🍕 Productos activos: ${products[0].total}`);

    // Verificar pedidos
    const [orders] = await connection.execute(
      "SELECT COUNT(*) as total FROM pedidos WHERE id_estado != 1",
    );
    console.log(`📦 Pedidos confirmados: ${orders[0].total}`);

    // Mostrar algunos usuarios
    const [userList] = await connection.execute(
      "SELECT nombre_usuario, correo_usuario FROM usuarios WHERE activo = true LIMIT 5",
    );
    console.log("\n👥 Usuarios encontrados:");
    userList.forEach((user) => {
      console.log(`   - ${user.nombre_usuario} (${user.correo_usuario})`);
    });

    // Mostrar algunos productos
    const [productList] = await connection.execute(
      "SELECT nombre_producto, precio_producto FROM productos WHERE activo = true LIMIT 5",
    );
    console.log("\n🍕 Productos encontrados:");
    productList.forEach((product) => {
      console.log(
        `   - ${product.nombre_producto} ($${product.precio_producto})`,
      );
    });

    // Mostrar algunos pedidos
    const [orderList] = await connection.execute(`
      SELECT 
        p.id_pedido,
        u.nombre_usuario,
        p.total_pedido,
        e.nombre_estado
      FROM pedidos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN estados e ON p.id_estado = e.id_estado
      WHERE p.id_estado != 1
      ORDER BY p.fecha_pedido DESC
      LIMIT 5
    `);

    console.log("\n📦 Pedidos encontrados:");
    orderList.forEach((order) => {
      console.log(
        `   - ID: ${order.id_pedido}, Cliente: ${order.nombre_usuario}, Total: $${order.total_pedido}, Estado: ${order.nombre_estado}`,
      );
    });

    console.log("\n✅ Verificación completada");
  } catch (error) {
    console.error("❌ Error verificando datos:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkData();
