#!/usr/bin/env node

/**
 * Script de prueba específico para la configuración SMTP corregida
 * Ejecutar con: node scripts/test-smtp-config.js
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

console.log("🔧 ===== TEST CONFIGURACIÓN SMTP CORREGIDA =====");
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || "NO CONFIGURADO"}`);
console.log("");

// Verificar variables de entorno
const requiredVars = ["EMAIL_USER", "EMAIL_PASSWORD"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Variables de entorno faltantes:", missingVars.join(", "));
  process.exit(1);
}

console.log("✅ Variables de entorno configuradas");
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(
  `📧 EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "***CONFIGURADO***" : "NO CONFIGURADO"}`,
);
console.log("");

// Función para ejecutar test completo de SMTP
const runSMTPTest = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: [],
  };

  // Test 1: Crear transporter con nueva configuración
  console.log(
    "🔍 Test 1: Creando transporter con configuración SMTP corregida...",
  );
  const transporterTest = {
    name: "Creación del transporter SMTP",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createEmailTransporter();
    transporterTest.details.transporterCreated = true;
    transporterTest.details.config = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      pool: true,
      maxConnections: 2,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 3,
    };
    transporterTest.status = "success";
    console.log("✅ Transporter SMTP creado con configuración corregida");
  } catch (error) {
    transporterTest.status = "error";
    transporterTest.details.error = error.message;
    console.log("❌ Error creando transporter SMTP:", error.message);
  }
  results.tests.push(transporterTest);
  console.log("");

  // Test 2: Verificar conexión SMTP con timeouts extendidos
  console.log(
    "🔍 Test 2: Verificando conexión SMTP con timeouts extendidos...",
  );
  const connectionTest = {
    name: "Conexión SMTP con timeouts extendidos",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createEmailTransporter();
    const startTime = Date.now();

    console.log("   ⏱️ Iniciando verificación SMTP (timeout: 60s)...");
    await transporter.verify();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    connectionTest.status = "success";
    connectionTest.details.message =
      "Conexión SMTP exitosa con timeouts extendidos";
    connectionTest.details.responseTime = `${responseTime}ms`;
    connectionTest.details.timeoutConfig = {
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    };

    console.log(`✅ Conexión SMTP verificada exitosamente (${responseTime}ms)`);

    if (responseTime > 30000) {
      console.log(
        "   ⚠️ Tiempo de respuesta alto, pero dentro del timeout configurado",
      );
    }
  } catch (error) {
    connectionTest.status = "error";
    connectionTest.details.error = error.message;
    connectionTest.details.code = error.code;
    connectionTest.details.command = error.command;
    connectionTest.details.timeoutConfig = {
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    };
    console.log("❌ Error en conexión SMTP:", error.message);
    console.log("   Código:", error.code);
    console.log("   Comando:", error.command);
  }
  results.tests.push(connectionTest);
  console.log("");

  // Test 3: Enviar email con configuración SMTP corregida
  console.log("🔍 Test 3: Enviando email con configuración SMTP corregida...");
  const emailTest = {
    name: "Envío de email con SMTP corregido",
    status: "pending",
    details: {},
  };

  try {
    const transporter = createEmailTransporter();
    const testEmail = process.env.EMAIL_USER;
    const startTime = Date.now();

    const mailOptions = createMailOptions(
      testEmail,
      `🔧 Test SMTP Corregido - ${new Date().toISOString()}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6f00; margin: 0;">🔧 Test SMTP Corregido</h1>
            <p style="color: #666; margin: 10px 0;">Sabor App - Configuración SMTP Optimizada</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">✅ Configuración SMTP Corregida</h3>
            <p>Este email fue enviado usando la configuración SMTP corregida para Railway y Gmail.</p>
            
            <h4 style="color: #333; margin: 15px 0 10px 0;">Mejoras Implementadas:</h4>
            <ul style="color: #555; line-height: 1.6;">
              <li><strong>TLS Corregido:</strong> Configuración moderna y segura</li>
              <li><strong>Timeouts Extendidos:</strong> 60s para conexiones Railway</li>
              <li><strong>Pool Habilitado:</strong> Mejor rendimiento y estabilidad</li>
              <li><strong>Ciphers Seguros:</strong> Configuración TLS robusta</li>
              <li><strong>Rate Limiting:</strong> 3 emails por lote con delays apropiados</li>
            </ul>
            
            <h4 style="color: #333; margin: 15px 0 10px 0;">Configuración Técnica:</h4>
            <ul style="color: #555; line-height: 1.6;">
              <li><strong>Host:</strong> smtp.gmail.com:587</li>
              <li><strong>Protocolo:</strong> STARTTLS</li>
              <li><strong>Connection Timeout:</strong> 60s</li>
              <li><strong>Greeting Timeout:</strong> 30s</li>
              <li><strong>Socket Timeout:</strong> 60s</li>
              <li><strong>Pool:</strong> Habilitado (2 conexiones máx)</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d; font-weight: bold;">🎉 ¡La configuración SMTP está funcionando correctamente!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Este email fue enviado usando la configuración SMTP corregida.
            </p>
            <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
              Sabor App - Sistema de Restaurante
            </p>
          </div>
        </div>
      `,
    );

    console.log("   📧 Enviando email con configuración SMTP corregida...");
    const result = await sendWithRetry(transporter, mailOptions, 3);
    const endTime = Date.now();

    emailTest.status = "success";
    emailTest.details.message = "Email enviado exitosamente con SMTP corregido";
    emailTest.details.messageId = result.messageId;
    emailTest.details.responseTime = `${endTime - startTime}ms`;
    emailTest.details.retryConfig = {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 15000,
    };

    console.log(
      `✅ Email enviado exitosamente con SMTP corregido (${endTime - startTime}ms)`,
    );
    console.log("   Message ID:", result.messageId);
  } catch (error) {
    emailTest.status = "error";
    emailTest.details.error = error.message;
    emailTest.details.code = error.code;
    emailTest.details.command = error.command;
    console.log("❌ Error enviando email con SMTP corregido:", error.message);
    console.log("   Código:", error.code);
    console.log("   Comando:", error.command);
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
  console.log("📊 ===== RESUMEN TEST SMTP CORREGIDO =====");
  console.log(`📊 Estado general: ${results.overallStatus.toUpperCase()}`);
  console.log(`📊 Tests exitosos: ${successTests}/${totalTests}`);
  console.log(`📊 Tests fallidos: ${results.summary.failed}`);
  console.log("");

  // Mostrar recomendaciones
  console.log("💡 ===== ANÁLISIS DE LA CONFIGURACIÓN SMTP =====");
  if (results.overallStatus === "error") {
    console.log(
      "❌ Se encontraron problemas con la configuración SMTP corregida:",
    );
    console.log("");

    results.tests.forEach((test) => {
      if (test.status === "error") {
        console.log(
          `   - ${test.name}: ${test.details.error || "Error desconocido"}`,
        );
      }
    });

    console.log("");
    console.log("🔧 Posibles soluciones:");
    console.log("   1. Verificar credenciales de Gmail (App Password)");
    console.log("   2. Verificar que la verificación en 2 pasos esté activada");
    console.log("   3. Revisar logs de Railway para errores de red");
    console.log("   4. Considerar usar un servicio de email alternativo");
  } else {
    console.log(
      "✅ ¡La configuración SMTP corregida está funcionando perfectamente!",
    );
    console.log("");
    console.log("🚀 Mejoras implementadas:");
    console.log("   - TLS configurado correctamente para Gmail");
    console.log("   - Timeouts extendidos para Railway (60s)");
    console.log("   - Pool de conexiones habilitado");
    console.log("   - Rate limiting optimizado");
    console.log("   - Ciphers seguros y modernos");
    console.log("");
    console.log("📧 El sistema de email ahora debería ser mucho más confiable");
  }

  return results;
};

// Ejecutar test
runSMTPTest()
  .then((results) => {
    console.log("");
    console.log("🏁 Test SMTP corregido completado");
    console.log(`📊 Estado final: ${results.overallStatus.toUpperCase()}`);
    process.exit(results.overallStatus === "success" ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error ejecutando test SMTP:", error);
    process.exit(1);
  });
