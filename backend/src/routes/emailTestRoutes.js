import express from "express";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Configurar transporter para pruebas
const testTransporter = nodemailer.createTransporter({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
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

// Endpoint para probar la configuración de email
router.get("/test-email-config", async (req, res) => {
  try {
    console.log("🔍 Probando configuración de email...");

    // Verificar configuración
    if (!config.email.user || !config.email.password) {
      return res.status(500).json({
        status: "error",
        message: "Configuración de email no encontrada",
        details: {
          user: config.email.user ? "✅ Configurado" : "❌ No configurado",
          password: config.email.password
            ? "✅ Configurado"
            : "❌ No configurado",
        },
      });
    }

    // Verificar conexión SMTP
    await testTransporter.verify();

    res.json({
      status: "success",
      message: "Configuración de email válida",
      details: {
        user: config.email.user,
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        connection: "✅ Conectado exitosamente",
      },
    });
  } catch (error) {
    console.error("❌ Error en configuración de email:", error);
    res.status(500).json({
      status: "error",
      message: "Error en la configuración de email",
      error: error.message,
      code: error.code,
      details: {
        user: config.email.user ? "✅ Configurado" : "❌ No configurado",
        password: config.email.password
          ? "✅ Configurado"
          : "❌ No configurado",
        connection: "❌ Error de conexión",
      },
    });
  }
});

// Endpoint para enviar email de prueba
router.post("/send-test-email", async (req, res) => {
  try {
    const { to } = req.body;
    const testEmail = to || config.email.user; // Enviar a ti mismo si no se especifica

    console.log(`📧 Enviando email de prueba a: ${testEmail}`);

    const mailOptions = {
      from: `"Sabor App - Test" <${config.email.user}>`,
      to: testEmail,
      subject: "Test Email - Sabor App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6f00;">✅ Test de Email Exitoso</h2>
          <p>Este es un email de prueba del sistema de Sabor App.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0;">Detalles del Test:</h3>
            <ul style="color: #666;">
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Servidor:</strong> ${process.env.NODE_ENV || "development"}</li>
              <li><strong>Status:</strong> ✅ Funcionando correctamente</li>
            </ul>
          </div>
          
          <p>Si recibes este email, el sistema de envío de códigos de verificación está funcionando correctamente.</p>
          
          <p style="color: #666; font-size: 14px;">
            Saludos,<br>
            El equipo de Sabor
          </p>
        </div>
      `,
      headers: {
        "X-Mailer": "Sabor App - Test",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    };

    const result = await testTransporter.sendMail(mailOptions);

    console.log(`✅ Email de prueba enviado exitosamente:`, {
      to: testEmail,
      messageId: result.messageId,
      response: result.response,
    });

    res.json({
      status: "success",
      message: "Email de prueba enviado exitosamente",
      details: {
        to: testEmail,
        messageId: result.messageId,
        response: result.response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`❌ Error enviando email de prueba:`, error);
    res.status(500).json({
      status: "error",
      message: "Error enviando email de prueba",
      error: error.message,
      code: error.code,
      response: error.response,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint para diagnosticar problemas de email
router.get("/email-diagnostics", async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      configuration: {
        user: config.email.user ? "✅ Configurado" : "❌ No configurado",
        password: config.email.password
          ? "✅ Configurado"
          : "❌ No configurado",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
      },
      tests: {},
    };

    // Test 1: Verificar configuración
    try {
      if (!config.email.user || !config.email.password) {
        throw new Error("Configuración incompleta");
      }
      diagnostics.tests.configuration = "✅ Válida";
    } catch (error) {
      diagnostics.tests.configuration = `❌ Error: ${error.message}`;
    }

    // Test 2: Verificar conexión SMTP
    try {
      await testTransporter.verify();
      diagnostics.tests.smtpConnection = "✅ Conectado";
    } catch (error) {
      diagnostics.tests.smtpConnection = `❌ Error: ${error.message}`;
    }

    // Test 3: Verificar variables de entorno
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_USER: process.env.EMAIL_USER
        ? "✅ Configurado"
        : "❌ No configurado",
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
        ? "✅ Configurado"
        : "❌ No configurado",
    };
    diagnostics.environmentVariables = envVars;

    res.json({
      status: "success",
      message: "Diagnóstico completado",
      diagnostics,
    });
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    res.status(500).json({
      status: "error",
      message: "Error en diagnóstico",
      error: error.message,
    });
  }
});

export default router;
