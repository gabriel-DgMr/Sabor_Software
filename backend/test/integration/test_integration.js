import axios from "axios";
import mysql from "mysql2/promise";
import { config } from "./src/config/config.js";

const BASE_URL = "http://localhost:3001/api";

class IntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async test(name, testFunction) {
    try {
      await this.log(`Testing: ${name}`);
      await testFunction();
      this.testResults.passed++;
      this.testResults.tests.push({ name, status: "PASSED" });
      await this.log(`✅ PASSED: ${name}`, "success");
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({
        name,
        status: "FAILED",
        error: error.message,
      });
      await this.log(`❌ FAILED: ${name} - ${error.message}`, "error");
    }
  }

  async checkDatabaseStructure() {
    const connection = await mysql.createConnection(config.db);

    // Verificar que la tabla users existe
    const [usersTables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (usersTables.length === 0) {
      throw new Error("Users table does not exist");
    }

    // Verificar estructura de la tabla users
    const [usersColumns] = await connection.execute("DESCRIBE users");

    const requiredColumns = [
      "id",
      "tipo_usuario",
      "nombre",
      "email",
      "password",
      "telefono",
      "imagen",
      "activo",
    ];
    for (const column of requiredColumns) {
      if (!usersColumns.some((col) => col.Field === column)) {
        throw new Error(`Required column '${column}' not found in users table`);
      }
    }

    // Verificar que las tablas clientes y empleados aún existen
    const [clientesTables] = await connection.execute(
      "SHOW TABLES LIKE 'clientes'",
    );
    const [empleadosTables] = await connection.execute(
      "SHOW TABLES LIKE 'empleados'",
    );

    if (clientesTables.length === 0 || empleadosTables.length === 0) {
      throw new Error("Clientes or empleados table missing");
    }

    await connection.end();
  }

  async testUserRegistration() {
    const testUser = {
      nombre: "Usuario Test",
      email: "test@example.com",
      telefono: "04123456789",
      password: "TestPassword123!",
    };

    const response = await axios.post(
      `${BASE_URL}/auth/register-cliente`,
      testUser,
    );

    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error("Registration failed");
    }

    return response.data.user;
  }

  async testUserLogin() {
    const loginData = {
      email: "test@example.com",
      password: "TestPassword123!",
    };

    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error("Login failed");
    }

    if (!response.data.token) {
      throw new Error("Token not returned");
    }

    return response.data.token;
  }

  async testUserProfile(token) {
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error("Profile retrieval failed");
    }

    if (!response.data.user) {
      throw new Error("User data not returned");
    }

    return response.data.user;
  }

  async testUsersList(token) {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error("Users list retrieval failed");
    }

    if (!Array.isArray(response.data.users)) {
      throw new Error("Users list is not an array");
    }

    return response.data.users;
  }

  async testProductEndpoints() {
    const response = await axios.get(`${BASE_URL}/productos`);

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    return response.data;
  }

  async testCategoriaEndpoints() {
    const response = await axios.get(`${BASE_URL}/categorias`);

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    return response.data;
  }

  async cleanup() {
    try {
      const connection = await mysql.createConnection(config.db);
      await connection.execute(
        "DELETE FROM users WHERE email = 'test@example.com'",
      );
      await connection.end();
      await this.log("Cleanup completed");
    } catch (error) {
      await this.log(`Cleanup failed: ${error.message}`, "error");
    }
  }

  async runAllTests() {
    await this.log("🚀 Starting Integration Tests for Sistema Sabor");
    await this.log("=================================================");

    let userToken = null;

    // Test 1: Database Structure
    await this.test("Database Structure Verification", async () => {
      await this.checkDatabaseStructure();
    });

    // Test 2: API Health Check
    await this.test("API Health Check", async () => {
      const response = await axios.get(`${BASE_URL}/categorias`);
      if (response.status !== 200) {
        throw new Error("API not responding correctly");
      }
    });

    // Test 3: User Registration
    await this.test("User Registration (Cliente)", async () => {
      await this.testUserRegistration();
    });

    // Test 4: User Login
    await this.test("User Login", async () => {
      userToken = await this.testUserLogin();
    });

    // Test 5: User Profile
    await this.test("User Profile Retrieval", async () => {
      if (!userToken) throw new Error("No token available");
      await this.testUserProfile(userToken);
    });

    // Test 6: Users List (Protected Route)
    await this.test("Users List (Protected Route)", async () => {
      if (!userToken) throw new Error("No token available");
      await this.testUsersList(userToken);
    });

    // Test 7: Product Endpoints
    await this.test("Product Endpoints", async () => {
      await this.testProductEndpoints();
    });

    // Test 8: Category Endpoints
    await this.test("Category Endpoints", async () => {
      await this.testCategoriaEndpoints();
    });

    // Cleanup
    await this.cleanup();

    // Results Summary
    await this.log("=================================================");
    await this.log("🏁 Integration Tests Completed");
    await this.log(`✅ Passed: ${this.testResults.passed}`);
    await this.log(`❌ Failed: ${this.testResults.failed}`);
    await this.log(
      `📊 Total: ${this.testResults.passed + this.testResults.failed}`,
    );

    if (this.testResults.failed === 0) {
      await this.log("🎉 ALL TESTS PASSED! Migration successful!", "success");
    } else {
      await this.log(
        "⚠️  Some tests failed. Please review the errors above.",
        "error",
      );
    }

    return this.testResults;
  }
}

// Execute tests if run directly
const tester = new IntegrationTester();
tester.runAllTests().catch(console.error);

export default IntegrationTester;
