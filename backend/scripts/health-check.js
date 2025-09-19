#!/usr/bin/env node

import http from "http";
import { config } from "../src/config/config.js";

/**
 * Script de health check para Docker y monitoreo
 */

const healthCheck = () => {
  const options = {
    hostname: "localhost",
    port: config.server.port,
    path: "/api/health",
    method: "GET",
    timeout: 3000,
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Health check passed");
      process.exit(0);
    } else {
      console.error(`❌ Health check failed with status: ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on("error", (err) => {
    console.error("❌ Health check failed:", err.message);
    process.exit(1);
  });

  req.on("timeout", () => {
    console.error("❌ Health check timeout");
    req.destroy();
    process.exit(1);
  });

  req.end();
};

// Ejecutar health check si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck();
}

export default healthCheck;
