import axios from "axios";
import crypto from "crypto-js";

// Configuración PayU usando variables de entorno
const PAYU_CONFIG = {
  // URLs - cambiar a producción cuando sea necesario
  API_URL:
    process.env.PAYU_TEST_MODE === "true"
      ? "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi"
      : "https://api.payulatam.com/payments-api/4.0/service.cgi",
  REPORTS_URL:
    process.env.PAYU_TEST_MODE === "true"
      ? "https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi"
      : "https://api.payulatam.com/reports-api/4.0/service.cgi",

  // Credenciales desde variables de entorno
  API_LOGIN: process.env.PAYU_API_LOGIN || "pRRXKOl8ikMmt9u",
  API_KEY: process.env.PAYU_API_KEY || "4Vj8eK4rloUd272L48hsrarnUA",
  MERCHANT_ID: process.env.PAYU_MERCHANT_ID || "508029",
  ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID || "512321",

  // URL del frontend
  FRONTEND_URL:
    process.env.PAYU_RETURN_URL_OVERRIDE?.trim() ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",

  // Modo de prueba
  TEST_MODE: process.env.PAYU_TEST_MODE === "true",
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
  const hash = crypto.MD5(signature).toString().toUpperCase();
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
    const totalAmountRaw = items.reduce((sum, item, index) => {
      const precio = Number(item.precio_unitario ?? item.precio ?? 0);
      const cantidad = Number(item.cantidad ?? item.qty ?? 1);

      if (Number.isNaN(precio) || Number.isNaN(cantidad)) {
        throw new Error(`Precio o cantidad inválidos en el item ${index + 1}`);
      }

      return sum + precio * cantidad;
    }, 0);

    const totalAmount = Number(totalAmountRaw.toFixed(2));
    const formattedAmount = totalAmount.toFixed(2);

    // Generar referencia única
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generar firma
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      formattedAmount,
      "COP",
    );

    // Descripción de los productos
    const description = items
      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join(", ");

    console.log("[PayU] Datos calculados para formulario:", {
      totalAmountRaw,
      totalAmount,
      formattedAmount,
      referenceCode,
      signature,
    });

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
          notifyUrl: `${PAYU_CONFIG.FRONTEND_URL.replace(/\/$/, "")}/api/webhook/payu`,
          additionalValues: {
            TX_VALUE: {
              value: formattedAmount,
              currency: "COP",
            },
            TX_TAX: {
              value: "0.00",
              currency: "COP",
            },
            TX_TAX_RETURN_BASE: {
              value: "0.00",
              currency: "COP",
            },
          },
          buyer: {
            merchantBuyerId: "1",
            fullName: "Cliente Sabor",
            emailAddress: "cliente@sabor.com",
            contactPhone: "3001234567",
            dniNumber: "12345678",
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
          merchantPayerId: "1",
          fullName: "Cliente Sabor",
          emailAddress: "cliente@sabor.com",
          contactPhone: "3001234567",
          dniNumber: "12345678",
          billingAddress: {
            street1: "Calle 123 #45-67",
            street2: "",
            city: "Bogotá",
            state: "Bogotá D.C.",
            country: "CO",
            postalCode: "110111",
            phone: "3001234567",
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
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "No se proporcionaron items para el pago",
      });
    }

    // Calcular el total
    const totalAmount = items.reduce((sum, item, index) => {
      const precio = Number(item.precio_unitario ?? item.precio ?? 0);
      const cantidad = Number(item.cantidad ?? item.qty ?? 1);

      if (Number.isNaN(precio) || Number.isNaN(cantidad)) {
        throw new Error(`Precio o cantidad inválidos en el item ${index + 1}`);
      }

      return sum + precio * cantidad;
    }, 0);

    const formattedAmount = Number(totalAmount).toFixed(2);

    // Generar referencia única
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generar firma para el formulario
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      formattedAmount,
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
      amount: formattedAmount,
      tax: "0.00",
      taxReturnBase: "0.00",
      currency: "COP",
      signature: signature,
      test: PAYU_CONFIG.TEST_MODE ? "1" : "0",
      buyerEmail: "cliente@sabor.com",
      responseUrl: `${PAYU_CONFIG.FRONTEND_URL.replace(/\/$/, "")}/carrito`,
      confirmationUrl: `${PAYU_CONFIG.FRONTEND_URL.replace(/\/$/, "")}/api/webhook/payu`,
    };

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
