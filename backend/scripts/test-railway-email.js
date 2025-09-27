#!/usr/bin/env node

/**
 * Script de prueba específico para Railway - Sistema de Email
 * Ejecutar con: node scripts/test-railway-email.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  createEmailTransporter,
  sendWithRetry,
  createMailOptions,
} from "../src/config/emailConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../.env") });

console.log("🚄 ===== TEST EMAIL RAILWAY - SABOR APP =====");
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || "NO CONFIGURADO"}`);
console.log(
  `🚄 Railway URL: ${process.env.RAILWAY_PUBLIC_DOMAIN || "NO CONFIGURADO"}`,
);
console.log("");

// Verificar variables de entorno críticas
const requiredVars = ["EMAIL_USER", "EMAIL_PASSWORD", "NODE_ENV"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Variables de entorno faltantes:", missingVars.join(", "));
  console.error("💡 Asegúrate de configurar estas variables en Railway");
  process.exit(1);
}

console.log("✅ Variables de entorno configuradas correctamente");
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(
  `📧 EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "***CONFIGURADO***" : "NO CONFIGURADO"}`,
);
console.log("");

// Función para ejecutar test completo
const runRailwayEmailTest = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
    tests: [],
  };

  // Test 1: Crear transporter
  console.log("🔍 Test 1: Creando transporter optimizado para Railway...");
  const transporterTest = {
    name: "Creación del transporter",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createEmailTransporter();
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

  // Test 2: Verificar conexión SMTP
  console.log("🔍 Test 2: Verificando conexión SMTP...");
  const connectionTest = {
    name: "Conexión SMTP",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createEmailTransporter();
    const startTime = Date.now();
    await transporter.verify();
    const endTime = Date.now();

    connectionTest.status = "success";
    connectionTest.details.message = "Conexión SMTP exitosa";
    connectionTest.details.responseTime = `${endTime - startTime}ms`;
    console.log(
      `✅ Conexión SMTP verificada exitosamente (${endTime - startTime}ms)`,
    );
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

  // Test 3: Enviar email de prueba con sistema de reintentos
  console.log(
    "🔍 Test 3: Enviando email de prueba con sistema de reintentos...",
  );
  const emailTest = {
    name: "Envío de email de prueba",
    status: "pending",
    details: {},
  };

  if (connectionTest.status === "success" || true) {
    // Intentar aunque falle la verificación
    try {
      const transporter = createEmailTransporter();
      const testEmail = process.env.EMAIL_USER; // Enviar a la misma cuenta
      const startTime = Date.now();

      const mailOptions = createMailOptions(
        testEmail,
        `🚄 Test Railway Email - ${new Date().toISOString()}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff6f00; margin: 0;">🚄 Test Railway Email</h1>
              <p style="color: #666; margin: 10px 0;">Sabor App - Sistema de Email</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">✅ Sistema de Email Funcionando</h3>
              <p>Si recibes este email, el sistema de correo está funcionando correctamente en Railway.</p>
              
              <h4 style="color: #333; margin: 15px 0 10px 0;">Información del Test:</h4>
              <ul style="color: #555; line-height: 1.6;">
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
                <li><strong>Railway Domain:</strong> ${process.env.RAILWAY_PUBLIC_DOMAIN || "N/A"}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>To:</strong> ${testEmail}</li>
                <li><strong>Configuración:</strong> Optimizada para Railway</li>
              </ul>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d; font-weight: bold;">🎉 ¡El sistema de email está funcionando correctamente!</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Este email fue enviado automáticamente por el script de prueba de Railway.
              </p>
              <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
                Sabor App - Sistema de Restaurante
              </p>
            </div>
          </div>
        `,
      );

      const result = await sendWithRetry(transporter, mailOptions, 3);
      const endTime = Date.now();

      emailTest.status = "success";
      emailTest.details.message = "Email de prueba enviado exitosamente";
      emailTest.details.messageId = result.messageId;
      emailTest.details.responseTime = `${endTime - startTime}ms`;
      console.log(
        `✅ Email de prueba enviado exitosamente (${endTime - startTime}ms)`,
      );
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
  console.log("📊 ===== RESUMEN DEL TEST RAILWAY =====");
  console.log(`📊 Estado general: ${results.overallStatus.toUpperCase()}`);
  console.log(`📊 Tests exitosos: ${successTests}/${totalTests}`);
  console.log(`📊 Tests fallidos: ${results.summary.failed}`);
  console.log(`📊 Tests omitidos: ${results.summary.skipped}`);
  console.log("");

  // Mostrar recomendaciones específicas para Railway
  console.log("💡 ===== RECOMENDACIONES PARA RAILWAY =====");
  if (results.overallStatus === "error") {
    console.log("❌ Se encontraron problemas en la configuración de email:");
    console.log("");
    console.log("🔧 Pasos para solucionar en Railway:");
    console.log(
      "   1. Verificar que EMAIL_USER y EMAIL_PASSWORD estén configurados",
    );
    console.log(
      "   2. Asegurar que la contraseña sea una 'App Password' de Gmail",
    );
    console.log(
      "   3. Verificar que la verificación en 2 pasos esté activada en Gmail",
    );
    console.log("   4. Revisar los logs de Railway para errores específicos");
    console.log("");
    console.log("🚄 Configuraciones específicas para Railway:");
    console.log("   - Timeouts reducidos para mejor compatibilidad");
    console.log("   - Pool de conexiones desactivado");
    console.log("   - Sistema de reintentos inteligente");
    console.log("   - TLS configurado para máxima compatibilidad");
  } else {
    console.log(
      "✅ ¡El sistema de email está funcionando correctamente en Railway!",
    );
    console.log("   - Todas las pruebas pasaron exitosamente");
    console.log("   - El email de prueba fue enviado");
    console.log(
      "   - Revisa tu bandeja de entrada para confirmar la recepción",
    );
    console.log("");
    console.log("🚄 Configuración optimizada para Railway:");
    console.log("   - Timeouts ajustados para Railway");
    console.log("   - Sistema de reintentos robusto");
    console.log("   - Manejo de errores inteligente");
  }

  return results;
};

// Ejecutar test
runRailwayEmailTest()
  .then((results) => {
    console.log("");
    console.log("🏁 Test Railway completado");
    console.log(`📊 Estado final: ${results.overallStatus.toUpperCase()}`);
    process.exit(results.overallStatus === "success" ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error ejecutando test Railway:", error);
    process.exit(1);
  });
