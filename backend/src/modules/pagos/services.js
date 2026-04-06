import axios from "axios";
import crypto from "crypto-js";
import {
  updateEstadoPedidoPorReferenciaService,
  updateEstadoPedidoService,
} from "../pedidos/services.js";

const PAYU_CONFIG = {
  API_URL: "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
  REPORTS_URL: "https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi",
  API_LOGIN: process.env.PAYU_API_LOGIN || "pRRXKOl8ikMmt9u",
  API_KEY: process.env.PAYU_API_KEY || "4Vj8eK4rloUd272L48hsrarnUA",
  MERCHANT_ID: process.env.PAYU_MERCHANT_ID || "508029",
  ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID || "512321",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  TEST_MODE: true,
  SANDBOX_MODE: true,
};

const generateSignature = (
  apiKey,
  merchantId,
  referenceCode,
  amount,
  currency,
) => {
  const formattedAmount = Number(amount).toFixed(2);
  const signature = `${apiKey}~${merchantId}~${referenceCode}~${formattedAmount}~${currency}`;
  return crypto.MD5(signature).toString();
};

export const pagosService = {
  crearOrdenPayU: async (items, user, ip, userAgent) => {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("No se proporcionaron items para el pago");

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.precio_unitario) * Number(item.cantidad),
      0,
    );
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      totalAmount,
      "COP",
    );
    const description = items
      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join(", ");

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
          referenceCode,
          description: description.slice(0, 255),
          language: "es",
          signature,
          notifyUrl: `${PAYU_CONFIG.BACKEND_URL}/api/pagos/webhook/payu`,
          additionalValues: {
            TX_VALUE: { value: totalAmount, currency: "COP" },
          },
          buyer: {
            merchantBuyerId: user?.id_usuario?.toString() || "1",
            fullName: user?.nombre_usuario || "Cliente Sabor",
            emailAddress: user?.correo_usuario || "cliente@sabor.com",
            contactPhone: user?.telefono_usuario || "3001234567",
            dniNumber: user?.documento_usuario || "12345678",
            shippingAddress: {
              street1: "Calle 123 #45-67",
              street2: "",
              city: "Bogota",
              state: "Bogota D.C.",
              country: "CO",
              postalCode: "110111",
              phone: user?.telefono_usuario || "3001234567",
            },
          },
          shippingAddress: {
            street1: "Calle 123 #45-67",
            street2: "",
            city: "Bogota",
            state: "Bogota D.C.",
            country: "CO",
            postalCode: "110111",
            phone: "3001234567",
          },
        },
        payer: {
          merchantPayerId: user?.id_usuario?.toString() || "1",
          fullName: user?.nombre_usuario || "Cliente Sabor",
          emailAddress: user?.correo_usuario || "cliente@sabor.com",
          contactPhone: user?.telefono_usuario || "3001234567",
          dniNumber: user?.documento_usuario || "12345678",
          billingAddress: {
            street1: "Calle 123 #45-67",
            street2: "",
            city: "Bogota",
            state: "Bogota D.C.",
            country: "CO",
            postalCode: "110111",
            phone: user?.telefono_usuario || "3001234567",
          },
        },
        creditCard: {
          number: "4037997623271984",
          securityCode: "321",
          expirationDate: "2030/12",
          name: "APPROVED",
        },
        extraParameters: { INSTALLMENTS_NUMBER: 1 },
        type: "AUTHORIZATION_AND_CAPTURE",
        paymentMethod: "VISA",
        paymentCountry: "CO",
        deviceSessionId: referenceCode,
        ipAddress: ip || "127.0.0.1",
        cookie: "pt1t38347bs6jc9ruv2ecpv7o2",
        userAgent: userAgent || "Mozilla/5.0",
      },
      test: PAYU_CONFIG.TEST_MODE,
    };

    const response = await axios.post(PAYU_CONFIG.API_URL, payuData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.data.code === "SUCCESS") {
      return {
        success: true,
        paymentUrl: `${PAYU_CONFIG.FRONTEND_URL}/checkout/payu?reference=${referenceCode}&amount=${totalAmount}`,
        referenceCode,
        transactionId: response.data.transactionResponse?.transactionId,
        state: response.data.transactionResponse?.state,
      };
    } else {
      throw new Error(response.data.error || "Error en la respuesta de PayU");
    }
  },

  generarFormularioPayU: (items, buyerEmail) => {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("No se proporcionaron items para el pago");
    if (!buyerEmail || !buyerEmail.includes("@"))
      throw new Error("Email del comprador es requerido y debe ser valido");

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.precio_unitario) * Number(item.cantidad),
      0,
    );
    const referenceCode = `SABOR_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const signature = generateSignature(
      PAYU_CONFIG.API_KEY,
      PAYU_CONFIG.MERCHANT_ID,
      referenceCode,
      totalAmount,
      "COP",
    );
    const description = items
      .map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join(", ");

    const formData = {
      merchantId: PAYU_CONFIG.MERCHANT_ID,
      accountId: PAYU_CONFIG.ACCOUNT_ID,
      description: description.slice(0, 255),
      referenceCode,
      amount: Number(totalAmount).toFixed(2),
      tax: "0.00",
      taxReturnBase: "0.00",
      currency: "COP",
      signature,
      test: PAYU_CONFIG.TEST_MODE ? 1 : 0,
      buyerEmail,
      responseUrl: `${PAYU_CONFIG.FRONTEND_URL}/carrito`,
      confirmationUrl: `${PAYU_CONFIG.BACKEND_URL}/api/pagos/webhook/payu`,
    };

    return {
      success: true,
      sandbox: true,
      message: "Modo sandbox - Puedes probar con tarjetas de prueba",
      formData,
      actionUrl: "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/",
      referenceCode,
    };
  },

  consultarTransaccionPayU: async (referenceCode) => {
    const queryData = {
      language: "es",
      command: "ORDER_DETAIL_BY_REFERENCE_CODE",
      merchant: {
        apiLogin: PAYU_CONFIG.API_LOGIN,
        apiKey: PAYU_CONFIG.API_KEY,
      },
      details: { referenceCode },
      test: PAYU_CONFIG.TEST_MODE,
    };
    const response = await axios.post(PAYU_CONFIG.REPORTS_URL, queryData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  },

  procesarWebhookPayU: async (webhookBody) => {
    const {
      merchant_id,
      state_pol,
      response_code_pol,
      reference_sale,
      sign,
      value,
      currency,
    } = webhookBody;
    const apiKey = process.env.PAYU_API_KEY || "4Vj8eK4rloUd272L48hsrarnUA";
    const expectedSign = crypto
      .MD5(
        `${apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`,
      )
      .toString();

    if (sign && sign !== expectedSign) throw new Error("Invalid signature");

    let nuevoEstado = null;
    switch (state_pol) {
      case "4":
        nuevoEstado = 3;
        break; // Pagado
      case "6":
      case "104":
        nuevoEstado = 4;
        break; // Cancelado
      case "7":
      case "15":
        nuevoEstado = 2;
        break; // Pendiente
      default:
        return true;
    }

    if (reference_sale && nuevoEstado) {
      await updateEstadoPedidoPorReferenciaService(reference_sale, nuevoEstado);
    }
    return true;
  },

  procesarWebhookMercadopago: async (id, topic) => {
    if (topic !== "payment") return true;
    const mpToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      "TEST-2675350345028368-072418-6ec105066a059fa3fd56aac3c35d7c39-2107333883";
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${id}`,
      { headers: { Authorization: `Bearer ${mpToken}` } },
    );
    const pago = await response.json();

    const id_pedido = pago.external_reference;
    let nuevoEstado = null;
    if (pago.status === "approved") nuevoEstado = 3;
    else if (pago.status === "rejected" || pago.status === "cancelled")
      nuevoEstado = 4;
    else if (pago.status === "pending" || pago.status === "in_process")
      nuevoEstado = 2;

    if (id_pedido && nuevoEstado) {
      // Usar metodo estandar de pedidos
      await updateEstadoPedidoService(id_pedido, nuevoEstado);
    }
    return true;
  },
};
