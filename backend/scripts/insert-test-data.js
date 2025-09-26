#!/usr/bin/env node

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { config } from "../src/config/config.js";

/**
 * Script para insertar datos de prueba en la base de datos de producción
 * Incluye usuarios y pedidos de ejemplo
 */

class TestDataInserter {
  constructor() {
    this.connection = null;
    this.isProduction = process.env.NODE_ENV === "production";
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
        multipleStatements: true,
        ssl: this.isProduction ? { rejectUnauthorized: false } : false,
        connectTimeout: 30000,
        acquireTimeout: 60000,
        timeout: 60000,
      });

      console.log("✅ Conectado a la base de datos");
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    } catch (error) {
      console.error("❌ Error conectando a la base de datos:", error.message);
      process.exit(1);
    }
  }

  async insertTestUsers() {
    try {
      console.log("\n👥 Insertando usuarios de prueba...");

      const testUsers = [
        {
          nombre_usuario: "Juan Pérez",
          correo_usuario: "juan.perez@test.com",
          telefono_usuario: "3001234567",
          contraseña_usuario: "password123",
          id_rol: 1, // Usuario normal
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "María García",
          correo_usuario: "maria.garcia@test.com",
          telefono_usuario: "3002345678",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Carlos López",
          correo_usuario: "carlos.lopez@test.com",
          telefono_usuario: "3003456789",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Ana Martínez",
          correo_usuario: "ana.martinez@test.com",
          telefono_usuario: "3004567890",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Luis Rodríguez",
          correo_usuario: "luis.rodriguez@test.com",
          telefono_usuario: "3005678901",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Admin Test",
          correo_usuario: "admin@test.com",
          telefono_usuario: "3006789012",
          contraseña_usuario: "admin123",
          id_rol: 2, // Administrador
          activo: true,
          email_verificado: true,
        },
      ];

      const insertedUsers = [];

      for (const user of testUsers) {
        try {
          // Verificar si el usuario ya existe
          const [existingUser] = await this.connection.execute(
            "SELECT id_usuario FROM usuarios WHERE correo_usuario = ?",
            [user.correo_usuario],
          );

          if (existingUser.length > 0) {
            console.log(
              `⚠️  Usuario ${user.correo_usuario} ya existe, omitiendo...`,
            );
            insertedUsers.push(existingUser[0].id_usuario);
            continue;
          }

          // Encriptar contraseña
          const hashedPassword = await bcrypt.hash(user.contraseña_usuario, 10);

          // Insertar usuario
          const [result] = await this.connection.execute(
            `INSERT INTO usuarios (
              nombre_usuario, 
              correo_usuario, 
              telefono_usuario, 
              contraseña_usuario,
              activo,
              email_verificado,
              id_rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              user.nombre_usuario,
              user.correo_usuario,
              user.telefono_usuario,
              hashedPassword,
              user.activo,
              user.email_verificado,
              user.id_rol,
            ],
          );

          insertedUsers.push(result.insertId);
          console.log(
            `✅ Usuario creado: ${user.nombre_usuario} (ID: ${result.insertId})`,
          );
        } catch (error) {
          console.error(
            `❌ Error creando usuario ${user.nombre_usuario}:`,
            error.message,
          );
        }
      }

      console.log(
        `📊 Total usuarios insertados/verificados: ${insertedUsers.length}`,
      );
      return insertedUsers;
    } catch (error) {
      console.error("❌ Error insertando usuarios:", error.message);
      throw error;
    }
  }

  async insertTestProducts() {
    try {
      console.log("\n🍕 Insertando productos de prueba...");

      const testProducts = [
        {
          nombre_producto: "Pizza Margherita",
          descripcion_producto:
            "Pizza clásica con tomate, mozzarella y albahaca",
          precio_producto: 25000,
          stock: 50,
          id_categoria: 1,
          imagen_producto: "margherita.jpg",
          activo: true,
        },
        {
          nombre_producto: "Pizza Pepperoni",
          descripcion_producto: "Pizza con pepperoni y queso mozzarella",
          precio_producto: 28000,
          stock: 30,
          id_categoria: 1,
          imagen_producto: "pepperoni.jpg",
          activo: true,
        },
        {
          nombre_producto: "Hamburguesa Clásica",
          descripcion_producto:
            "Hamburguesa con carne, lechuga, tomate y queso",
          precio_producto: 18000,
          stock: 40,
          id_categoria: 2,
          imagen_producto: "hamburguesa.jpg",
          activo: true,
        },
        {
          nombre_producto: "Coca Cola 350ml",
          descripcion_producto: "Bebida gaseosa Coca Cola 350ml",
          precio_producto: 3000,
          stock: 100,
          id_categoria: 3,
          imagen_producto: "coca-cola.jpg",
          activo: true,
        },
        {
          nombre_producto: "Agua 500ml",
          descripcion_producto: "Agua natural 500ml",
          precio_producto: 2000,
          stock: 80,
          id_categoria: 3,
          imagen_producto: "agua.jpg",
          activo: true,
        },
      ];

      const insertedProducts = [];

      for (const product of testProducts) {
        try {
          // Verificar si el producto ya existe
          const [existingProduct] = await this.connection.execute(
            "SELECT id_producto FROM productos WHERE nombre_producto = ?",
            [product.nombre_producto],
          );

          if (existingProduct.length > 0) {
            console.log(
              `⚠️  Producto ${product.nombre_producto} ya existe, omitiendo...`,
            );
            insertedProducts.push(existingProduct[0].id_producto);
            continue;
          }

          // Insertar producto
          const [result] = await this.connection.execute(
            `INSERT INTO productos (
              nombre_producto, 
              descripcion_producto, 
              precio_producto, 
              stock, 
              id_categoria, 
              imagen_producto,
              activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              product.nombre_producto,
              product.descripcion_producto,
              product.precio_producto,
              product.stock,
              product.id_categoria,
              product.imagen_producto,
              product.activo,
            ],
          );

          insertedProducts.push(result.insertId);
          console.log(
            `✅ Producto creado: ${product.nombre_producto} (ID: ${result.insertId})`,
          );
        } catch (error) {
          console.error(
            `❌ Error creando producto ${product.nombre_producto}:`,
            error.message,
          );
        }
      }

      console.log(
        `📊 Total productos insertados/verificados: ${insertedProducts.length}`,
      );
      return insertedProducts;
    } catch (error) {
      console.error("❌ Error insertando productos:", error.message);
      throw error;
    }
  }

  async insertTestOrders(userIds, productIds) {
    try {
      console.log("\n📦 Insertando pedidos de prueba...");

      if (userIds.length === 0 || productIds.length === 0) {
        console.log(
          "⚠️  No hay usuarios o productos disponibles para crear pedidos",
        );
        return [];
      }

      const testOrders = [
        {
          id_usuario: userIds[0],
          items: [
            { id_producto: productIds[0], cantidad: 2, precio_unitario: 25000 },
            { id_producto: productIds[2], cantidad: 1, precio_unitario: 3000 },
          ],
          total: 53000,
          notas: "Sin cebolla en la pizza",
          metodo_pago: "efectivo",
          tipo_servicio: "domicilio",
          direccion_entrega: "Calle 123 #45-67",
          detalle_direccion: "Apartamento 301",
          id_estado: 2, // Pendiente
        },
        {
          id_usuario: userIds[1],
          items: [
            { id_producto: productIds[1], cantidad: 1, precio_unitario: 28000 },
            { id_producto: productIds[3], cantidad: 2, precio_unitario: 3000 },
          ],
          total: 34000,
          notas: "Pizza bien cocida",
          metodo_pago: "tarjeta",
          tipo_servicio: "domicilio",
          direccion_entrega: "Carrera 45 #78-90",
          detalle_direccion: "Casa",
          id_estado: 3, // Pagado
        },
        {
          id_usuario: userIds[2],
          items: [
            { id_producto: productIds[2], cantidad: 1, precio_unitario: 18000 },
            { id_producto: productIds[4], cantidad: 1, precio_unitario: 2000 },
          ],
          total: 20000,
          notas: "Hamburguesa sin tomate",
          metodo_pago: "efectivo",
          tipo_servicio: "mesa",
          id_mesa: 1,
          id_estado: 2, // Pendiente
        },
        {
          id_usuario: userIds[3],
          items: [
            { id_producto: productIds[0], cantidad: 1, precio_unitario: 25000 },
            { id_producto: productIds[1], cantidad: 1, precio_unitario: 28000 },
            { id_producto: productIds[3], cantidad: 3, precio_unitario: 3000 },
          ],
          total: 58000,
          notas: "Para llevar",
          metodo_pago: "efectivo",
          tipo_servicio: "domicilio",
          direccion_entrega: "Avenida 5 #12-34",
          detalle_direccion: "Oficina 201",
          id_estado: 4, // Entregado
        },
        {
          id_usuario: userIds[4],
          items: [
            { id_producto: productIds[2], cantidad: 2, precio_unitario: 18000 },
            { id_producto: productIds[4], cantidad: 2, precio_unitario: 2000 },
          ],
          total: 40000,
          notas: "Extra queso en las hamburguesas",
          metodo_pago: "tarjeta",
          tipo_servicio: "mesa",
          id_mesa: 2,
          id_estado: 3, // Pagado
        },
      ];

      const insertedOrders = [];

      for (const order of testOrders) {
        try {
          await this.connection.beginTransaction();

          // Crear pedido
          const [orderResult] = await this.connection.execute(
            `INSERT INTO pedidos (
              id_usuario, 
              id_estado, 
              total_pedido, 
              notas, 
              metodo_pago, 
              tipo_servicio, 
              direccion_entrega, 
              detalle_direccion,
              id_mesa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              order.id_usuario,
              order.id_estado,
              order.total,
              order.notas,
              order.metodo_pago,
              order.tipo_servicio,
              order.direccion_entrega || null,
              order.detalle_direccion || null,
              order.id_mesa || null,
            ],
          );

          const orderId = orderResult.insertId;

          // Crear detalles del pedido
          for (const item of order.items) {
            await this.connection.execute(
              `INSERT INTO detalle_pedidos (
                id_pedido, 
                id_producto, 
                cantidad, 
                precio_unitario
              ) VALUES (?, ?, ?, ?)`,
              [orderId, item.id_producto, item.cantidad, item.precio_unitario],
            );
          }

          await this.connection.commit();
          insertedOrders.push(orderId);
          console.log(
            `✅ Pedido creado: ID ${orderId} para usuario ${order.id_usuario}`,
          );
        } catch (error) {
          await this.connection.rollback();
          console.error(
            `❌ Error creando pedido para usuario ${order.id_usuario}:`,
            error.message,
          );
        }
      }

      console.log(`📊 Total pedidos insertados: ${insertedOrders.length}`);
      return insertedOrders;
    } catch (error) {
      console.error("❌ Error insertando pedidos:", error.message);
      throw error;
    }
  }

  async verifyData() {
    try {
      console.log("\n🔍 Verificando datos insertados...");

      // Verificar usuarios
      const [users] = await this.connection.execute(
        "SELECT COUNT(*) as total FROM usuarios WHERE activo = true",
      );
      console.log(`👥 Usuarios activos: ${users[0].total}`);

      // Verificar productos
      const [products] = await this.connection.execute(
        "SELECT COUNT(*) as total FROM productos WHERE activo = true",
      );
      console.log(`🍕 Productos activos: ${products[0].total}`);

      // Verificar pedidos
      const [orders] = await this.connection.execute(
        "SELECT COUNT(*) as total FROM pedidos WHERE id_estado != 1",
      );
      console.log(`📦 Pedidos confirmados: ${orders[0].total}`);

      // Verificar detalles de pedidos
      const [orderDetails] = await this.connection.execute(
        "SELECT COUNT(*) as total FROM detalle_pedidos",
      );
      console.log(`📋 Detalles de pedidos: ${orderDetails[0].total}`);

      // Mostrar algunos pedidos recientes
      const [recentOrders] = await this.connection.execute(`
        SELECT 
          p.id_pedido,
          u.nombre_usuario,
          p.total_pedido,
          e.nombre_estado,
          p.fecha_pedido
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        JOIN estados e ON p.id_estado = e.id_estado
        WHERE p.id_estado != 1
        ORDER BY p.fecha_pedido DESC
        LIMIT 5
      `);

      console.log("\n📋 Pedidos recientes:");
      recentOrders.forEach((order) => {
        console.log(
          `   - ID: ${order.id_pedido}, Cliente: ${order.nombre_usuario}, Total: $${order.total_pedido}, Estado: ${order.nombre_estado}`,
        );
      });
    } catch (error) {
      console.error("❌ Error verificando datos:", error.message);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log("✅ Conexión cerrada");
    }
  }

  async run() {
    try {
      const action = process.argv[2] || "all";

      await this.connect();

      switch (action) {
        case "users":
          await this.insertTestUsers();
          break;

        case "products":
          await this.insertTestProducts();
          break;

        case "orders":
          // Obtener IDs existentes para crear pedidos
          const [userRows] = await this.connection.execute(
            "SELECT id_usuario FROM usuarios WHERE activo = true LIMIT 5",
          );
          const [productRows] = await this.connection.execute(
            "SELECT id_producto FROM productos WHERE activo = true LIMIT 5",
          );

          const existingUserIds = userRows.map((row) => row.id_usuario);
          const existingProductIds = productRows.map((row) => row.id_producto);

          await this.insertTestOrders(existingUserIds, existingProductIds);
          break;

        case "all":
        default:
          console.log("🚀 Insertando todos los datos de prueba...");

          const newUserIds = await this.insertTestUsers();
          const newProductIds = await this.insertTestProducts();
          await this.insertTestOrders(newUserIds, newProductIds);
          await this.verifyData();
          break;
      }

      console.log("🎉 Inserción de datos de prueba completada");
    } catch (error) {
      console.error("💥 Error durante la inserción:", error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const inserter = new TestDataInserter();
  inserter.run();
}

export default TestDataInserter;
