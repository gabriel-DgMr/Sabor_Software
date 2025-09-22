#!/usr/bin/env node

/**
 * Script para verificar la configuración CSP y PayU
 */

import fetch from "node-fetch";

const API_URL = process.env.API_URL || "http://localhost:3000";

async function testCSPHeaders() {
  try {
    console.log("🔍 Verificando headers CSP...");

    const response = await fetch(`${API_URL}/api/health`);
    const headers = response.headers;

    console.log("📋 Headers de respuesta:");
    console.log(
      "Content-Security-Policy:",
      headers.get("content-security-policy"),
    );
    console.log("X-Frame-Options:", headers.get("x-frame-options"));
    console.log(
      "X-Content-Type-Options:",
      headers.get("x-content-type-options"),
    );

    // Verificar si form-action está incluido en CSP
    const csp = headers.get("content-security-policy");
    if (csp && csp.includes("form-action")) {
      console.log("✅ CSP incluye form-action");
      if (csp.includes("checkout.payulatam.com")) {
        console.log("✅ CSP permite PayU checkout");
      } else {
        console.log("❌ CSP NO permite PayU checkout");
      }
    } else {
      console.log("❌ CSP NO incluye form-action");
    }
  } catch (error) {
    console.error("❌ Error al verificar headers:", error.message);
  }
}

async function testPayUFormGeneration() {
  try {
    console.log("\n🔍 Probando generación de formulario PayU...");

    const testItems = [
      {
        nombre_producto: "Producto Test",
        precio_unitario: 10000,
        cantidad: 1,
      },
    ];

    const response = await fetch(`${API_URL}/api/payu/formulario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: testItems }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Formulario PayU generado correctamente");
      console.log("🔗 URL de acción:", data.actionUrl);
      console.log("📝 Referencia:", data.referenceCode);

      // Verificar que la URL de acción es correcta
      if (data.actionUrl.includes("checkout.payulatam.com")) {
        console.log("✅ URL de PayU es correcta");
      } else {
        console.log("❌ URL de PayU no es correcta");
      }
    } else {
      console.log("❌ Error al generar formulario PayU:", response.status);
    }
  } catch (error) {
    console.error("❌ Error al probar PayU:", error.message);
  }
}

async function main() {
  console.log("🚀 Iniciando pruebas de CSP y PayU...\n");

  await testCSPHeaders();
  await testPayUFormGeneration();

  console.log("\n✨ Pruebas completadas");
}

main().catch(console.error);
