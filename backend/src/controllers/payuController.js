import axios from "axios";
import crypto from "crypto-js";

// Configuración PayU usando variables de entorno
const PAYU_CONFIG = {
  // URLs - usar sandbox por defecto hasta tener cuenta real
  API_URL:
    process.env.PAYU_TEST_MODE === "false" && process.env.PAYU_API_LOGIN
      ? "https://api.payulatam.com/payments-api/4.0/service.cgi"
      : "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
  REPORTS_URL:
    process.env.PAYU_TEST_MODE === "false" && process.env.PAYU_API_LOGIN
      ? "https://api.payulatam.com/reports-api/4.0/service.cgi"
      : "https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi",

  // Credenciales - usar sandbox por defecto hasta tener cuenta real
  API_LOGIN: process.env.PAYU_API_LOGIN || "pRRXKOl8ikMmt9u",
  API_KEY: process.env.PAYU_API_KEY || "4Vj8eK4rloUd272L48hsrarnUA",
  MERCHANT_ID: process.env.PAYU_MERCHANT_ID || "508029",
  ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID || "512321",

  // URL del frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // URL del backend
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",

  // Modo de prueba - forzar sandbox si no hay credenciales reales
  TEST_MODE:
    !process.env.PAYU_API_LOGIN || process.env.PAYU_TEST_MODE === "true",

  // Indicador de modo simulación
  SIMULATION_MODE: !process.env.PAYU_API_LOGIN,
};

/**
 * Genera la firma MD5 requerida por PayU
 */
const generateSignature = (
  apiKey,
  merchantId,
  referenceCode,
  amount,
  currency,
) => {
  // PayU requiere el monto con exactamente 2 decimales y punto como separador
  const formattedAmount = parseFloat(amount).toFixed(2);
  const signature = `${apiKey}~${merchantId}~${referenceCode}~${formattedAmount}~${currency}`;
  console.log("Cadena para firma:", signature);
  const hash = crypto.MD5(signature).toString();
  console.log("Firma generada:", hash);
  return hash;
};

/**
 * Crea una orden de pago con PayU
 */
export const crearOrdenPago = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "No se proporcionaron items para el pago",
      });
    }

    // Calcular el total
    const totalAmount = items.reduce((sum, item) => {
      return sum + Number(item.precio_unitario) * Number(item.cantidad);
    }, 0);

    // Generar referencia única
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generar firma
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      totalAmount,
      "COP",
    );

    // Descripción de los productos
    const description = items
      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join(", ");

    // Datos para PayU
    const payuData = {
      language: "es",
      command: "SUBMIT_TRANSACTION",
      merchant: {
        apiLogin: PAYU_CONFIG.API_LOGIN,
        apiKey: PAYU_CONFIG.API_KEY,
      },
      transaction: {
        order: {
          accountId: PAYU_CONFIG.ACCOUNT_ID,
          referenceCode: referenceCode,
          description: description.substring(0, 255), // PayU limita a 255 caracteres
          language: "es",
          signature: signature,
          notifyUrl: `${PAYU_CONFIG.BACKEND_URL}/api/webhook/payu`,
          additionalValues: {
            TX_VALUE: {
              value: totalAmount,
              currency: "COP",
            },
          },
          buyer: {
            merchantBuyerId: req.user?.id_usuario?.toString() || "1",
            fullName: req.user?.nombre_usuario || "Cliente Sabor",
            emailAddress: req.user?.correo_usuario || "cliente@sabor.com",
            contactPhone: req.user?.telefono_usuario || "3001234567",
            dniNumber: req.user?.documento_usuario || "12345678",
            shippingAddress: {
              street1: "Calle 123 #45-67",
              street2: "",
              city: "Bogotá",
              state: "Bogotá D.C.",
              country: "CO",
              postalCode: "110111",
              phone: req.user?.telefono_usuario || "3001234567",
            },
          },
          shippingAddress: {
            street1: "Calle 123 #45-67",
            street2: "",
            city: "Bogotá",
            state: "Bogotá D.C.",
            country: "CO",
            postalCode: "110111",
            phone: "3001234567",
          },
        },
        payer: {
          merchantPayerId: req.user?.id_usuario?.toString() || "1",
          fullName: req.user?.nombre_usuario || "Cliente Sabor",
          emailAddress: req.user?.correo_usuario || "cliente@sabor.com",
          contactPhone: req.user?.telefono_usuario || "3001234567",
          dniNumber: req.user?.documento_usuario || "12345678",
          billingAddress: {
            street1: "Calle 123 #45-67",
            street2: "",
            city: "Bogotá",
            state: "Bogotá D.C.",
            country: "CO",
            postalCode: "110111",
            phone: req.user?.telefono_usuario || "3001234567",
          },
        },
        creditCard: {
          number: "4037997623271984",
          securityCode: "321",
          expirationDate: "2030/12",
          name: "APPROVED",
        },
        extraParameters: {
          INSTALLMENTS_NUMBER: 1,
        },
        type: "AUTHORIZATION_AND_CAPTURE",
        paymentMethod: "VISA",
        paymentCountry: "CO",
        deviceSessionId: referenceCode,
        ipAddress: req.ip || "127.0.0.1",
        cookie: "pt1t38347bs6jc9ruv2ecpv7o2",
        userAgent: req.get("User-Agent") || "Mozilla/5.0",
      },
      test: PAYU_CONFIG.TEST_MODE,
    };

    console.log("Datos enviados a PayU:", JSON.stringify(payuData, null, 2));

    // Hacer la petición a PayU
    const response = await axios.post(PAYU_CONFIG.API_URL, payuData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Respuesta de PayU:", JSON.stringify(response.data, null, 2));

    if (response.data.code === "SUCCESS") {
      // Para sandbox, generar URL de pago simulada
      const paymentUrl = `${PAYU_CONFIG.FRONTEND_URL}/checkout/payu?reference=${referenceCode}&amount=${totalAmount}`;

      res.json({
        success: true,
        paymentUrl: paymentUrl,
        referenceCode: referenceCode,
        transactionId: response.data.transactionResponse?.transactionId,
        state: response.data.transactionResponse?.state,
      });
    } else {
      throw new Error(response.data.error || "Error en la respuesta de PayU");
    }
  } catch (error) {
    console.error("Error al procesar pago con PayU:", error);

    let errorMessage = "Error al procesar el pago con PayU";
    if (error.response?.data) {
      errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Genera formulario de pago directo para PayU
 */
export const generarFormularioPago = async (req, res) => {
  try {
    const { items, buyerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "No se proporcionaron items para el pago",
      });
    }

    // Validar email del comprador
    if (!buyerEmail || !buyerEmail.includes("@")) {
      return res.status(400).json({
        error: "Email del comprador es requerido y debe ser válido",
      });
    }

    // Calcular el total
    const totalAmount = items.reduce((sum, item) => {
      return sum + Number(item.precio_unitario) * Number(item.cantidad);
    }, 0);

    // Generar referencia única
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generar firma para el formulario
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      totalAmount,
      "COP",
    );

    // Descripción de los productos
    const description = items
      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join(", ");

    // Datos del formulario
    const formData = {
      merchantId: PAYU_CONFIG.MERCHANT_ID,
      accountId: PAYU_CONFIG.ACCOUNT_ID,
      description: description.substring(0, 255),
      referenceCode: referenceCode,
      amount: parseFloat(totalAmount).toFixed(2), // Formatear con 2 decimales
      tax: "0.00",
      taxReturnBase: "0.00",
      currency: "COP",
      signature: signature,
      test: PAYU_CONFIG.TEST_MODE ? 1 : 0,
      buyerEmail: buyerEmail,
      responseUrl: `${PAYU_CONFIG.FRONTEND_URL}/carrito`,
      confirmationUrl: `${PAYU_CONFIG.BACKEND_URL}/api/webhook/payu`,
    };

    // Log para debugging
    console.log("🔍 === PAYU CHECKOUT WEB DEBUG ===");
    console.log("📦 Items del carrito:", JSON.stringify(items, null, 2));
    console.log("💰 Total calculado:", totalAmount);
    console.log("📝 Código de referencia:", referenceCode);
    console.log("🔑 Firma generada:", signature);
    console.log("📧 Email del comprador:", buyerEmail);
    console.log("🌐 URLs:", {
      responseUrl: formData.responseUrl,
      confirmationUrl: formData.confirmationUrl,
      actionUrl: PAYU_CONFIG.TEST_MODE
        ? "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"
        : "https://checkout.payulatam.com/ppp-web-gateway-payu/",
    });
    console.log("🔧 Configuración PayU:", {
      testMode: PAYU_CONFIG.TEST_MODE,
      simulationMode: PAYU_CONFIG.SIMULATION_MODE,
      apiLogin: PAYU_CONFIG.API_LOGIN,
      merchantId: PAYU_CONFIG.MERCHANT_ID,
      accountId: PAYU_CONFIG.ACCOUNT_ID,
      frontendUrl: PAYU_CONFIG.FRONTEND_URL,
      backendUrl: PAYU_CONFIG.BACKEND_URL,
    });

    // Advertencia si está en modo simulación
    if (PAYU_CONFIG.SIMULATION_MODE) {
      console.warn(
        "⚠️ MODO SIMULACIÓN ACTIVO - No hay cuenta PayU configurada",
      );
      console.warn(
        "⚠️ Los pagos serán simulados, no se procesarán transacciones reales",
      );
    }
    console.log("📋 FormData completo:", JSON.stringify(formData, null, 2));

    // Si está en modo simulación, simular el pago directamente
    if (PAYU_CONFIG.SIMULATION_MODE) {
      console.log("🎭 SIMULANDO PAGO - Redirigiendo a simulación local");

      // Simular éxito después de 2 segundos
      setTimeout(() => {
        // Redirigir al carrito con parámetros de éxito simulados
        const simulatedUrl = `${PAYU_CONFIG.FRONTEND_URL}/carrito?status=success&referenceCode=${referenceCode}&transactionState=4&TX_VALUE=${totalAmount}`;
        console.log("🎭 URL de simulación:", simulatedUrl);
      }, 2000);

      return res.json({
        success: true,
        simulation: true,
        message: "Modo simulación activo - No se procesarán pagos reales",
        simulatedUrl: `${PAYU_CONFIG.FRONTEND_URL}/carrito?status=success&referenceCode=${referenceCode}&transactionState=4&TX_VALUE=${totalAmount}`,
        formData: formData,
        actionUrl: `${PAYU_CONFIG.BACKEND_URL}/api/payu/simulate`,
        referenceCode: referenceCode,
      });
    }

    res.json({
      success: true,
      formData: formData,
      actionUrl: PAYU_CONFIG.TEST_MODE
        ? "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"
        : "https://checkout.payulatam.com/ppp-web-gateway-payu/",
      referenceCode: referenceCode,
    });
  } catch (error) {
    console.error("Error al generar formulario PayU:", error);
    res.status(500).json({
      error: "Error al generar formulario de pago",
      details: error.message,
    });
  }
};

/**
 * Simula un pago exitoso (para modo simulación)
 */
export const simularPago = async (req, res) => {
  try {
    console.log("🎭 Simulando pago exitoso...");

    const { referenceCode, amount } = req.query;

    // Simular delay de procesamiento
    setTimeout(() => {
      const simulatedUrl = `${PAYU_CONFIG.FRONTEND_URL}/carrito?status=success&referenceCode=${referenceCode}&transactionState=4&TX_VALUE=${amount}`;
      console.log("🎭 Redirigiendo a:", simulatedUrl);
      res.redirect(simulatedUrl);
    }, 2000);
  } catch (error) {
    console.error("Error en simulación de pago:", error);
    res.status(500).json({
      error: "Error en simulación de pago",
      details: error.message,
    });
  }
};

/**
 * Consulta el estado de una transacción
 */
export const consultarTransaccion = async (req, res) => {
  try {
    const { referenceCode } = req.params;

    const queryData = {
      language: "es",
      command: "ORDER_DETAIL_BY_REFERENCE_CODE",
      merchant: {
        apiLogin: PAYU_CONFIG.API_LOGIN,
        apiKey: PAYU_CONFIG.API_KEY,
      },
      details: {
        referenceCode: referenceCode,
      },
      test: PAYU_CONFIG.TEST_MODE,
    };

    const response = await axios.post(PAYU_CONFIG.REPORTS_URL, queryData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error al consultar transacción:", error);
    res.status(500).json({
      error: "Error al consultar el estado de la transacción",
      details: error.message,
    });
  }
};
