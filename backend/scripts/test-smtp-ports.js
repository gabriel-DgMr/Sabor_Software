#!/usr/bin/env node

/**
 * Script para probar diferentes puertos SMTP
 * Ejecutar con: node scripts/test-smtp-ports.js
 */

import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../.env") });

console.log("🔌 ===== TEST PUERTOS SMTP =====");
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log("");

// Configuraciones de puertos a probar
const portConfigs = [
  {
    name: "Puerto 587 (STARTTLS) - RECOMENDADO",
    port: 587,
    secure: false,
    description: "Puerto estándar moderno con STARTTLS",
  },
  {
    name: "Puerto 465 (SSL/TLS) - DEPRECADO",
    port: 465,
    secure: true,
    description: "Puerto SSL directo (oficialmente deprecado)",
  },
  {
    name: "Puerto 25 (SMTP clásico) - NO RECOMENDADO",
    port: 25,
    secure: false,
    description: "Puerto SMTP clásico sin encriptación",
  },
];

// Función para crear transporter con configuración específica
const createTransporterForPort = (portConfig) => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: portConfig.port,
    secure: portConfig.secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
      minVersion: "TLSv1.2",
      maxVersion: "TLSv1.3",
    },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    pool: false,
    maxConnections: 1,
    maxMessages: 1,
    ignoreTLS: false,
    requireTLS: true,
  });
};

// Función para probar un puerto específico
const testPort = async (portConfig) => {
  console.log(`🔍 Probando: ${portConfig.name}`);
  console.log(`   📝 Descripción: ${portConfig.description}`);
  console.log(`   🔌 Puerto: ${portConfig.port}`);
  console.log(
    `   🔒 Seguro: ${portConfig.secure ? "SSL/TLS directo" : "STARTTLS"}`,
  );

  const result = {
    port: portConfig.port,
    secure: portConfig.secure,
    name: portConfig.name,
    status: "pending",
    details: {},
  };

  try {
    const transporter = createTransporterForPort(portConfig);

    console.log(`   ⏱️ Verificando conexión...`);
    const startTime = Date.now();

    await transporter.verify();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    result.status = "success";
    result.details = {
      responseTime: `${responseTime}ms`,
      message: "Conexión exitosa",
    };

    console.log(`   ✅ Conexión exitosa (${responseTime}ms)`);

    // Probar envío de email
    console.log(`   📧 Probando envío de email...`);

    const mailOptions = {
      from: `"Test SMTP Ports" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Test Puerto ${portConfig.port} - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff6f00;">🔌 Test Puerto SMTP ${portConfig.port}</h2>
          <p>Este email fue enviado usando el puerto ${portConfig.port}</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4>Configuración utilizada:</h4>
            <ul>
              <li><strong>Puerto:</strong> ${portConfig.port}</li>
              <li><strong>Seguro:</strong> ${portConfig.secure ? "SSL/TLS directo" : "STARTTLS"}</li>
              <li><strong>Host:</strong> smtp.gmail.com</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si recibes este email, el puerto ${portConfig.port} está funcionando correctamente.
          </p>
        </div>
      `,
    };

    const emailResult = await transporter.sendMail(mailOptions);

    result.details.emailSent = true;
    result.details.messageId = emailResult.messageId;

    console.log(`   ✅ Email enviado exitosamente`);
    console.log(`   📧 Message ID: ${emailResult.messageId}`);
  } catch (error) {
    result.status = "error";
    result.details = {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    };

    console.log(`   ❌ Error: ${error.message}`);
    if (error.code) console.log(`   🔍 Código: ${error.code}`);
    if (error.command) console.log(`   📝 Comando: ${error.command}`);
  }

  console.log("");
  return result;
};

// Función principal para probar todos los puertos
const testAllPorts = async () => {
  const results = [];

  console.log("🚀 Iniciando prueba de puertos SMTP...");
  console.log(`📧 Usando: ${process.env.EMAIL_USER}`);
  console.log("");

  for (const portConfig of portConfigs) {
    const result = await testPort(portConfig);
    results.push(result);

    // Pequeña pausa entre pruebas
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Mostrar resumen
  console.log("📊 ===== RESUMEN DE PUERTOS SMTP =====");

  results.forEach((result) => {
    const status = result.status === "success" ? "✅" : "❌";
    const emailStatus = result.details.emailSent ? "📧" : "❌";

    console.log(`${status} ${result.name}`);
    console.log(
      `   Puerto: ${result.port} | Seguro: ${result.secure ? "SSL/TLS" : "STARTTLS"}`,
    );
    console.log(
      `   Estado: ${result.status} ${result.status === "success" ? emailStatus : ""}`,
    );

    if (result.status === "success") {
      console.log(`   ⏱️ Tiempo respuesta: ${result.details.responseTime}`);
      if (result.details.messageId) {
        console.log(`   📧 Message ID: ${result.details.messageId}`);
      }
    } else {
      console.log(`   ❌ Error: ${result.details.error}`);
    }
    console.log("");
  });

  // Recomendaciones
  console.log("💡 ===== RECOMENDACIONES =====");

  const workingPorts = results.filter((r) => r.status === "success");
  const port587 = results.find((r) => r.port === 587);
  const port465 = results.find((r) => r.port === 465);

  if (port587 && port587.status === "success") {
    console.log("✅ Puerto 587 (STARTTLS) - RECOMENDADO");
    console.log("   - Es el estándar moderno");
    console.log("   - Mejor compatibilidad con Railway");
    console.log("   - Gmail lo recomienda oficialmente");
    console.log("   - Funciona mejor con firewalls");
  }

  if (port465 && port465.status === "success") {
    console.log("⚠️ Puerto 465 (SSL/TLS) - FUNCIONA PERO NO RECOMENDADO");
    console.log("   - Oficialmente deprecado");
    console.log("   - Puede tener problemas en algunos entornos");
    console.log("   - Menos compatible con proxies");
  }

  if (workingPorts.length === 0) {
    console.log("❌ Ningún puerto funcionó");
    console.log("   - Verificar credenciales de Gmail");
    console.log("   - Verificar configuración de red");
    console.log("   - Verificar variables de entorno");
  }

  return results;
};

// Ejecutar pruebas
testAllPorts()
  .then((results) => {
    const successCount = results.filter((r) => r.status === "success").length;
    console.log("🏁 Prueba de puertos completada");
    console.log(`📊 Puertos funcionando: ${successCount}/${results.length}`);
    process.exit(successCount > 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error ejecutando pruebas de puertos:", error);
    process.exit(1);
  });
