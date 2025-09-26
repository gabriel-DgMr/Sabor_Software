#!/usr/bin/env node

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { config } from "../src/config/config.js";

/**
 * Script para insertar más datos de prueba usando productos existentes
 * Incluye usuarios adicionales y pedidos en diferentes fechas
 */

class MoreTestDataInserter {
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

  async getExistingProducts() {
    try {
      const [products] = await this.connection.execute(
        "SELECT id_producto, nombre_producto, precio_producto FROM productos WHERE activo = true",
      );
      console.log(`📦 Productos disponibles: ${products.length}`);
      return products;
    } catch (error) {
      console.error("❌ Error obteniendo productos:", error.message);
      return [];
    }
  }

  async insertMoreUsers() {
    try {
      console.log("\n👥 Insertando usuarios adicionales...");

      const additionalUsers = [
        {
          nombre_usuario: "Laura Rodríguez",
          correo_usuario: "laura.rodriguez@test.com",
          telefono_usuario: "3001111111",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Diego Martínez",
          correo_usuario: "diego.martinez@test.com",
          telefono_usuario: "3002222222",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Sofia García",
          correo_usuario: "sofia.garcia@test.com",
          telefono_usuario: "3003333333",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Andrés López",
          correo_usuario: "andres.lopez@test.com",
          telefono_usuario: "3004444444",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Valentina Herrera",
          correo_usuario: "valentina.herrera@test.com",
          telefono_usuario: "3005555555",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Sebastián Torres",
          correo_usuario: "sebastian.torres@test.com",
          telefono_usuario: "3006666666",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Isabella Morales",
          correo_usuario: "isabella.morales@test.com",
          telefono_usuario: "3007777777",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
        {
          nombre_usuario: "Nicolás Jiménez",
          correo_usuario: "nicolas.jimenez@test.com",
          telefono_usuario: "3008888888",
          contraseña_usuario: "password123",
          id_rol: 1,
          activo: true,
          email_verificado: true,
        },
      ];

      const insertedUsers = [];

      for (const user of additionalUsers) {
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
        `📊 Total usuarios adicionales insertados/verificados: ${insertedUsers.length}`,
      );
      return insertedUsers;
    } catch (error) {
      console.error("❌ Error insertando usuarios adicionales:", error.message);
      throw error;
    }
  }

  async insertOrdersWithDifferentDates(userIds, products) {
    try {
      console.log("\n📦 Insertando pedidos en diferentes fechas...");

      if (userIds.length === 0 || products.length === 0) {
        console.log(
          "⚠️  No hay usuarios o productos disponibles para crear pedidos",
        );
        return [];
      }

      // Generar fechas de los últimos 30 días
      const today = new Date();
      const orders = [];

      // Crear pedidos para los últimos 30 días
      for (let i = 0; i < 30; i++) {
        const orderDate = new Date(today);
        orderDate.setDate(today.getDate() - i);

        // Crear 1-3 pedidos por día
        const ordersPerDay = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < ordersPerDay; j++) {
          const randomUser =
            userIds[Math.floor(Math.random() * userIds.length)];
          const randomProducts = this.getRandomProducts(
            products,
            Math.floor(Math.random() * 3) + 1,
          );

          const total = randomProducts.reduce(
            (sum, item) => sum + item.precio_producto * item.cantidad,
            0,
          );

          const order = {
            id_usuario: randomUser,
            items: randomProducts,
            total: total,
            notas: this.getRandomNote(),
            metodo_pago: this.getRandomPaymentMethod(),
            tipo_servicio: this.getRandomServiceType(),
            direccion_entrega: this.getRandomAddress(),
            detalle_direccion: this.getRandomAddressDetail(),
            id_estado: this.getRandomState(),
            fecha_pedido: orderDate,
          };

          orders.push(order);
        }
      }

      const insertedOrders = [];

      for (const order of orders) {
        try {
          await this.connection.beginTransaction();

          // Crear pedido con fecha específica
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
              fecha_pedido
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
              order.fecha_pedido,
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
              [orderId, item.id_producto, item.cantidad, item.precio_producto],
            );
          }

          await this.connection.commit();
          insertedOrders.push(orderId);

          if (insertedOrders.length % 10 === 0) {
            console.log(`✅ ${insertedOrders.length} pedidos creados...`);
          }
        } catch (error) {
          await this.connection.rollback();
          console.error(`❌ Error creando pedido:`, error.message);
        }
      }

      console.log(`📊 Total pedidos insertados: ${insertedOrders.length}`);
      return insertedOrders;
    } catch (error) {
      console.error("❌ Error insertando pedidos:", error.message);
      throw error;
    }
  }

  getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((product) => ({
      id_producto: product.id_producto,
      cantidad: Math.floor(Math.random() * 3) + 1,
      precio_producto: product.precio_producto,
    }));
  }

  getRandomNote() {
    const notes = [
      "Sin cebolla",
      "Bien cocido",
      "Para llevar",
      "Extra queso",
      "Sin picante",
      "Rápido por favor",
      "Con salsa aparte",
      "Sin sal",
      "Bien caliente",
      "Con limón",
      null,
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  getRandomPaymentMethod() {
    const methods = ["efectivo", "tarjeta", "transferencia"];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  getRandomServiceType() {
    const types = ["domicilio", "mesa", "para_llevar"];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomAddress() {
    const addresses = [
      "Calle 123 #45-67",
      "Carrera 45 #78-90",
      "Avenida 5 #12-34",
      "Calle 80 #15-20",
      "Carrera 30 #25-40",
      "Avenida 68 #50-25",
      "Calle 100 #10-15",
      "Carrera 15 #35-50",
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  getRandomAddressDetail() {
    const details = [
      "Apartamento 301",
      "Casa",
      "Oficina 201",
      "Local 15",
      "Segundo piso",
      "Frente al parque",
      "Esquina",
      "Interior 5",
    ];
    return details[Math.floor(Math.random() * details.length)];
  }

  getRandomState() {
    // Estados: 1=carrito, 2=pendiente, 3=pagado, 4=entregado, 5=cancelado
    const states = [2, 3, 4]; // Solo estados válidos para pedidos confirmados
    return states[Math.floor(Math.random() * states.length)];
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

      // Mostrar pedidos por fecha
      const [ordersByDate] = await this.connection.execute(`
        SELECT 
          DATE(fecha_pedido) as fecha,
          COUNT(*) as total_pedidos,
          SUM(total_pedido) as total_ventas
        FROM pedidos 
        WHERE id_estado != 1 
        GROUP BY DATE(fecha_pedido) 
        ORDER BY fecha DESC 
        LIMIT 10
      `);

      console.log("\n📅 Pedidos por fecha (últimos 10 días):");
      ordersByDate.forEach((row) => {
        console.log(
          `   - ${row.fecha}: ${row.total_pedidos} pedidos, $${row.total_ventas} en ventas`,
        );
      });

      // Mostrar usuarios más activos
      const [activeUsers] = await this.connection.execute(`
        SELECT 
          u.nombre_usuario,
          COUNT(p.id_pedido) as total_pedidos,
          SUM(p.total_pedido) as total_gastado
        FROM usuarios u
        LEFT JOIN pedidos p ON u.id_usuario = p.id_usuario AND p.id_estado != 1
        WHERE u.activo = true
        GROUP BY u.id_usuario
        ORDER BY total_pedidos DESC
        LIMIT 5
      `);

      console.log("\n👥 Usuarios más activos:");
      activeUsers.forEach((user) => {
        console.log(
          `   - ${user.nombre_usuario}: ${user.total_pedidos} pedidos, $${user.total_gastado || 0} gastado`,
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
      console.log("🚀 Insertando más datos de prueba...");

      await this.connect();

      // Obtener productos existentes
      const products = await this.getExistingProducts();
      if (products.length === 0) {
        console.error("❌ No hay productos disponibles en la base de datos");
        return;
      }

      // Insertar usuarios adicionales
      const userIds = await this.insertMoreUsers();

      // Insertar pedidos en diferentes fechas
      await this.insertOrdersWithDifferentDates(userIds, products);

      // Verificar datos
      await this.verifyData();

      console.log("🎉 Inserción de datos adicionales completada");
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
  const inserter = new MoreTestDataInserter();
  inserter.run();
}

export default MoreTestDataInserter;
