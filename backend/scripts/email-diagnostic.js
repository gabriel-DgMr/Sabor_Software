#!/usr/bin/env node

/**
 * Script de diagnóstico para el sistema de email
 * Ejecutar con: node scripts/email-diagnostic.js
 */

import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../.env") });

console.log("🔍 ===== DIAGNÓSTICO DE EMAIL - SABOR APP =====");
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || "NO CONFIGURADO"}`);
console.log("");

// Configuración de email
const emailConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
};

console.log("📧 ===== CONFIGURACIÓN DE EMAIL =====");
console.log(`📧 EMAIL_USER: ${emailConfig.user || "NO CONFIGURADO"}`);
console.log(
  `📧 EMAIL_PASSWORD: ${emailConfig.password ? "***CONFIGURADO***" : "NO CONFIGURADO"}`,
);
console.log(`📧 Service: ${emailConfig.service}`);
console.log(`📧 Host: ${emailConfig.host}`);
console.log(`📧 Port: ${emailConfig.port}`);
console.log(`📧 Secure: ${emailConfig.secure}`);
console.log("");

// Función para crear transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: emailConfig.service,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5,
  });
};

// Función para ejecutar diagnóstico
const runDiagnostic = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: [],
  };

  // Test 1: Verificar variables de entorno
  console.log("🔍 Test 1: Verificando variables de entorno...");
  const envTest = {
    name: "Variables de entorno",
    status: "pending",
    details: {},
  };

  envTest.details.EMAIL_USER = process.env.EMAIL_USER
    ? "CONFIGURADO"
    : "NO CONFIGURADO";
  envTest.details.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
    ? "CONFIGURADO"
    : "NO CONFIGURADO";
  envTest.details.NODE_ENV = process.env.NODE_ENV || "NO CONFIGURADO";

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    envTest.status = "success";
    console.log("✅ Variables de entorno configuradas correctamente");
  } else {
    envTest.status = "error";
    console.log("❌ Variables de entorno faltantes");
    if (!process.env.EMAIL_USER) console.log("   - EMAIL_USER no configurado");
    if (!process.env.EMAIL_PASSWORD)
      console.log("   - EMAIL_PASSWORD no configurado");
  }
  results.tests.push(envTest);
  console.log("");

  // Test 2: Crear transporter
  console.log("🔍 Test 2: Creando transporter...");
  const transporterTest = {
    name: "Creación del transporter",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createTransporter();
    transporterTest.details.transporterCreated = true;
    transporterTest.status = "success";
    console.log("✅ Transporter creado correctamente");
  } catch (error) {
    transporterTest.status = "error";
    transporterTest.details.error = error.message;
    console.log("❌ Error creando transporter:", error.message);
  }
  results.tests.push(transporterTest);
  console.log("");

  // Test 3: Verificar conexión SMTP
  console.log("🔍 Test 3: Verificando conexión SMTP...");
  const connectionTest = {
    name: "Conexión SMTP",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createTransporter();
    await transporter.verify();
    connectionTest.status = "success";
    connectionTest.details.message = "Conexión SMTP exitosa";
    console.log("✅ Conexión SMTP verificada exitosamente");
  } catch (error) {
    connectionTest.status = "error";
    connectionTest.details.error = error.message;
    connectionTest.details.code = error.code;
    connectionTest.details.command = error.command;
    console.log("❌ Error en conexión SMTP:", error.message);
    console.log("   Código:", error.code);
    console.log("   Comando:", error.command);
  }
  results.tests.push(connectionTest);
  console.log("");

  // Test 4: Enviar email de prueba
  console.log("🔍 Test 4: Enviando email de prueba...");
  const emailTest = {
    name: "Envío de email de prueba",
    status: "pending",
    details: {},
  };

  if (connectionTest.status === "success") {
    try {
      const transporter = createTransporter();
      const testEmail = emailConfig.user; // Enviar a la misma cuenta

      const mailOptions = {
        from: `"Sabor App - Test" <${emailConfig.user}>`,
        to: testEmail,
        subject: `Test Email - ${new Date().toISOString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6f00;">🧪 Test de Email - Sabor App</h2>
            <p>Este es un email de prueba enviado el <strong>${new Date().toLocaleString()}</strong></p>
            <p>Si recibes este email, el sistema de correo está funcionando correctamente.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0;">Información del Test:</h3>
              <ul>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
                <li><strong>From:</strong> ${emailConfig.user}</li>
                <li><strong>To:</strong> ${testEmail}</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Este email fue enviado automáticamente por el script de diagnóstico de Sabor App.
            </p>
          </div>
        `,
        headers: {
          "X-Mailer": "Sabor App - Diagnostic Script",
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
        },
      };

      const result = await transporter.sendMail(mailOptions);
      emailTest.status = "success";
      emailTest.details.message = "Email de prueba enviado exitosamente";
      emailTest.details.messageId = result.messageId;
      emailTest.details.response = result.response;
      console.log("✅ Email de prueba enviado exitosamente");
      console.log("   Message ID:", result.messageId);
    } catch (error) {
      emailTest.status = "error";
      emailTest.details.error = error.message;
      emailTest.details.code = error.code;
      emailTest.details.command = error.command;
      console.log("❌ Error enviando email de prueba:", error.message);
      console.log("   Código:", error.code);
      console.log("   Comando:", error.command);
    }
  } else {
    emailTest.status = "skipped";
    emailTest.details.reason = "Conexión SMTP falló";
    console.log("⏭️ Test de email omitido debido a falla en conexión SMTP");
  }
  results.tests.push(emailTest);
  console.log("");

  // Calcular estado general
  const successTests = results.tests.filter(
    (test) => test.status === "success",
  ).length;
  const totalTests = results.tests.filter(
    (test) => test.status !== "skipped",
  ).length;

  results.overallStatus = successTests === totalTests ? "success" : "error";
  results.summary = {
    total: totalTests,
    successful: successTests,
    failed: results.tests.filter((test) => test.status === "error").length,
    skipped: results.tests.filter((test) => test.status === "skipped").length,
  };

  // Mostrar resumen
  console.log("📊 ===== RESUMEN DEL DIAGNÓSTICO =====");
  console.log(`📊 Estado general: ${results.overallStatus.toUpperCase()}`);
  console.log(`📊 Tests exitosos: ${successTests}/${totalTests}`);
  console.log(`📊 Tests fallidos: ${results.summary.failed}`);
  console.log(`📊 Tests omitidos: ${results.summary.skipped}`);
  console.log("");

  // Mostrar recomendaciones
  console.log("💡 ===== RECOMENDACIONES =====");
  if (results.overallStatus === "error") {
    console.log("❌ Se encontraron problemas en la configuración de email:");

    results.tests.forEach((test) => {
      if (test.status === "error") {
        console.log(
          `   - ${test.name}: ${test.details.error || "Error desconocido"}`,
        );
      }
    });

    console.log("");
    console.log("🔧 Pasos para solucionar:");
    console.log(
      "   1. Verificar que EMAIL_USER y EMAIL_PASSWORD estén configurados en .env",
    );
    console.log(
      "   2. Asegurar que la contraseña sea una 'App Password' de Gmail",
    );
    console.log(
      "   3. Verificar que la verificación en 2 pasos esté activada en Gmail",
    );
    console.log("   4. Revisar que no haya bloqueos de firewall o antivirus");
  } else {
    console.log("✅ ¡El sistema de email está funcionando correctamente!");
    console.log("   - Todas las pruebas pasaron exitosamente");
    console.log("   - El email de prueba fue enviado");
    console.log(
      "   - Revisa tu bandeja de entrada para confirmar la recepción",
    );
  }

  return results;
};

// Ejecutar diagnóstico
runDiagnostic()
  .then((results) => {
    console.log("");
    console.log("🏁 Diagnóstico completado");
    process.exit(results.overallStatus === "success" ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error ejecutando diagnóstico:", error);
    process.exit(1);
  });
