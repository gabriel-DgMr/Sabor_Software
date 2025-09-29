#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración de Brevo
 * Ejecutar con: node scripts/test-brevo.js
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  createEmailTransporter,
  sendWithRetry,
  createMailOptions,
} from "../src/config/emailConfig.js";

// Configurar path para .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

async function testBrevoConfiguration() {
  console.log("🚀 ===== PRUEBA DE CONFIGURACIÓN DE BREVO =====");
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log("");

  // Verificar variables de entorno
  console.log("🔍 Verificando variables de entorno...");
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser) {
    console.error("❌ ERROR: EMAIL_USER no está configurado");
    return;
  }

  if (!emailPassword) {
    console.error("❌ ERROR: EMAIL_PASSWORD no está configurado");
    return;
  }

  if (!emailPassword || emailPassword.length < 10) {
    console.error(
      "❌ ERROR: EMAIL_PASSWORD no parece ser una API key de Brevo válida",
    );
    console.error("   Verifica que hayas configurado tu API key correctamente");
    return;
  }

  console.log(`✅ EMAIL_USER: ${emailUser}`);
  console.log(`✅ EMAIL_PASSWORD: ${emailPassword.substring(0, 10)}...`);
  console.log("");

  // Crear transporter
  console.log("🔧 Creando cliente de Brevo...");
  try {
    const transporter = createEmailTransporter();
    console.log("✅ Cliente de Brevo creado exitosamente");
  } catch (error) {
    console.error("❌ ERROR creando cliente de Brevo:", error.message);
    return;
  }

  // Solicitar email de prueba
  console.log("");
  console.log(
    "📧 Para probar el envío de email, necesito un email de destino.",
  );
  console.log(
    "   Puedes usar tu propio email para recibir el email de prueba.",
  );
  console.log("");

  // En un entorno real, aquí pedirías el email por consola
  // Para este script, usaremos el EMAIL_USER como destino
  const testEmail = emailUser;

  console.log(`📧 Enviando email de prueba a: ${testEmail}`);

  try {
    const transporter = createEmailTransporter();
    const mailOptions = createMailOptions(
      testEmail,
      "🧪 Prueba de Brevo - Sabor App",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🎉 ¡Brevo Configurado Correctamente!</h2>
          <p>Este es un email de prueba para verificar que Brevo está funcionando correctamente en tu aplicación Sabor.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Configuración Exitosa</h3>
            <ul>
              <li><strong>Servicio:</strong> Brevo</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>API Key:</strong> Configurada correctamente</li>
              <li><strong>Email de origen:</strong> ${emailUser}</li>
            </ul>
          </div>
          
          <p>Si recibes este email, significa que:</p>
          <ul>
            <li>✅ Tu API key de Brevo es válida</li>
            <li>✅ La configuración está correcta</li>
            <li>✅ Los emails de verificación funcionarán</li>
          </ul>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💡 Próximo paso:</strong> Prueba registrarte en tu aplicación para verificar que los códigos de verificación llegan correctamente.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Este email fue enviado automáticamente por el script de prueba de Brevo.<br>
            Aplicación: Sabor App | Servicio: Brevo
          </p>
        </div>
      `,
    );

    const result = await sendWithRetry(transporter, mailOptions, 3);

    console.log("");
    console.log("🎉 ===== PRUEBA EXITOSA =====");
    console.log("✅ Email enviado correctamente con Brevo");
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log("");
    console.log(
      "🔍 Verifica tu bandeja de entrada (y spam) para confirmar que recibiste el email.",
    );
    console.log("");
    console.log(
      "🚀 ¡Tu aplicación está lista para enviar emails de verificación!",
    );
  } catch (error) {
    console.error("");
    console.error("❌ ===== ERROR EN PRUEBA =====");
    console.error("❌ Error enviando email:", error.message);
    console.error("");
    console.error("🔍 Posibles causas:");
    console.error("   - API key de Brevo inválida o expirada");
    console.error("   - Email de destino inválido");
    console.error("   - Problemas de conectividad");
    console.error("   - Cuenta de Brevo suspendida");
    console.error("");
    console.error("💡 Soluciones:");
    console.error("   1. Verifica tu API key en brevo.com");
    console.error("   2. Asegúrate de que el email de destino es válido");
    console.error("   3. Revisa el estado de tu cuenta en Brevo");
    console.error("   4. Contacta soporte de Brevo si el problema persiste");
  }
}

// Ejecutar prueba
testBrevoConfiguration().catch(console.error);
