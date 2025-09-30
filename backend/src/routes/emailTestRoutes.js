import express from "express";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Configurar transporter para pruebas
const createTestTransporter = () => {
  return nodemailer.createTransporter({
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
};

// Endpoint para diagnosticar configuración de email
router.get("/diagnostic", async (req, res) => {
  try {
    console.log(
      `🔍 [${new Date().toISOString()}] ===== DIAGNÓSTICO DE EMAIL INICIADO =====`,
    );

    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      emailConfig: {
        user: config.email.user || "NO CONFIGURADO",
        password: config.email.password ? "CONFIGURADO" : "NO CONFIGURADO",
        frontendUrl: config.frontendUrl || "NO CONFIGURADO",
      },
      tests: [],
    };

    // Test 1: Verificar variables de entorno
    console.log(`🔍 Test 1: Verificando variables de entorno...`);
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
      console.log(`✅ Variables de entorno configuradas correctamente`);
    } else {
      envTest.status = "error";
      console.log(`❌ Variables de entorno faltantes`);
    }
    diagnostic.tests.push(envTest);

    // Test 2: Verificar configuración del transporter
    console.log(`🔍 Test 2: Verificando configuración del transporter...`);
    const transporterTest = {
      name: "Configuración del transporter",
      status: "pending",
      details: {},
    };

    try {
      const transporter = createTestTransporter();
      transporterTest.details.transporterCreated = true;
      transporterTest.details.config = {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
      };
      transporterTest.status = "success";
      console.log(`✅ Transporter creado correctamente`);
    } catch (error) {
      transporterTest.status = "error";
      transporterTest.details.error = error.message;
      console.log(`❌ Error creando transporter:`, error.message);
    }
    diagnostic.tests.push(transporterTest);

    // Test 3: Verificar conexión SMTP
    console.log(`🔍 Test 3: Verificando conexión SMTP...`);
    const connectionTest = {
      name: "Conexión SMTP",
      status: "pending",
      details: {},
    };

    try {
      const transporter = createTestTransporter();
      await transporter.verify();
      connectionTest.status = "success";
      connectionTest.details.message = "Conexión SMTP exitosa";
      console.log(`✅ Conexión SMTP verificada exitosamente`);
    } catch (error) {
      connectionTest.status = "error";
      connectionTest.details.error = error.message;
      connectionTest.details.code = error.code;
      connectionTest.details.command = error.command;
      console.log(`❌ Error en conexión SMTP:`, error.message);
    }
    diagnostic.tests.push(connectionTest);

    // Test 4: Enviar email de prueba (solo si las pruebas anteriores pasaron)
    console.log(`🔍 Test 4: Enviando email de prueba...`);
    const emailTest = {
      name: "Envío de email de prueba",
      status: "pending",
      details: {},
    };

    if (connectionTest.status === "success") {
      try {
        const transporter = createTestTransporter();
        const testEmail = config.email.user; // Enviar a la misma cuenta

        const mailOptions = {
          from: `"Sabor App - Test" <${config.email.user}>`,
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
                  <li><strong>From:</strong> ${config.email.user}</li>
                  <li><strong>To:</strong> ${testEmail}</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Este email fue enviado automáticamente por el sistema de diagnóstico de Sabor App.
              </p>
            </div>
          `,
          headers: {
            "X-Mailer": "Sabor App - Diagnostic",
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
          },
        };

        const result = await transporter.sendMail(mailOptions);
        emailTest.status = "success";
        emailTest.details.message = "Email de prueba enviado exitosamente";
        emailTest.details.messageId = result.messageId;
        emailTest.details.response = result.response;
        console.log(`✅ Email de prueba enviado exitosamente`);
      } catch (error) {
        emailTest.status = "error";
        emailTest.details.error = error.message;
        emailTest.details.code = error.code;
        emailTest.details.command = error.command;
        console.log(`❌ Error enviando email de prueba:`, error.message);
      }
    } else {
      emailTest.status = "skipped";
      emailTest.details.reason = "Conexión SMTP falló";
      console.log(`⏭️ Test de email omitido debido a falla en conexión SMTP`);
    }
    diagnostic.tests.push(emailTest);

    // Calcular estado general
    const successTests = diagnostic.tests.filter(
      (test) => test.status === "success",
    ).length;
    const totalTests = diagnostic.tests.filter(
      (test) => test.status !== "skipped",
    ).length;

    diagnostic.overallStatus =
      successTests === totalTests ? "success" : "error";
    diagnostic.summary = {
      total: totalTests,
      successful: successTests,
      failed: diagnostic.tests.filter((test) => test.status === "error").length,
      skipped: diagnostic.tests.filter((test) => test.status === "skipped")
        .length,
    };

    console.log(
      `🔍 [${new Date().toISOString()}] ===== DIAGNÓSTICO COMPLETADO =====`,
    );
    console.log(`📊 Resultado: ${diagnostic.overallStatus.toUpperCase()}`);
    console.log(`📊 Tests exitosos: ${successTests}/${totalTests}`);

    res.json(diagnostic);
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] Error en diagnóstico de email:`,
      error,
    );
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: "error",
      message: "Error ejecutando diagnóstico de email",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Endpoint para enviar email de prueba manual
router.post("/send-test", async (req, res) => {
  try {
    const { to, subject = "Test Email - Sabor App" } = req.body;

    if (!to) {
      return res.status(400).json({
        message: "El campo 'to' es requerido",
      });
    }

    console.log(
      `📧 [${new Date().toISOString()}] Enviando email de prueba a: ${to}`,
    );

    const transporter = createTestTransporter();

    const mailOptions = {
      from: `"Sabor App - Test Manual" <${config.email.user}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6f00;">🧪 Test Manual - Sabor App</h2>
          <p>Este es un email de prueba manual enviado el <strong>${new Date().toLocaleString()}</strong></p>
          <p>Si recibes este email, el sistema de correo está funcionando correctamente.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0;">Detalles del Test:</h3>
            <ul>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
              <li><strong>From:</strong> ${config.email.user}</li>
              <li><strong>To:</strong> ${to}</li>
              <li><strong>Subject:</strong> ${subject}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Este email fue enviado manualmente desde el endpoint de prueba de Sabor App.
          </p>
        </div>
      `,
      headers: {
        "X-Mailer": "Sabor App - Manual Test",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(
      `✅ [${new Date().toISOString()}] Email de prueba enviado exitosamente a: ${to}`,
    );

    res.json({
      timestamp: new Date().toISOString(),
      status: "success",
      message: "Email de prueba enviado exitosamente",
      details: {
        to: to,
        subject: subject,
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
      },
    });
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] Error enviando email de prueba:`,
      error,
    );
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: "error",
      message: "Error enviando email de prueba",
      error: error.message,
      code: error.code,
      command: error.command,
    });
  }
});

export default router;
