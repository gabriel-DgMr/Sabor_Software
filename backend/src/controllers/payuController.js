import fetch from "node-fetch";
import CryptoJS from "crypto-js";

const {
  PAYU_API_LOGIN,
  PAYU_API_KEY,
  PAYU_MERCHANT_ID,
  PAYU_ACCOUNT_ID,
  PAYU_TEST_MODE,
  PAYU_API_URL,
  PAYU_RETURN_URL_OVERRIDE,
} = process.env;

const isTest = (PAYU_TEST_MODE || "true").toString().toLowerCase() === "true";

const DEFAULT_API_URL = isTest
  ? "https://sandbox.api.payulatam.com"
  : "https://api.payulatam.com";

const normalizeAmount = (amount) => {
  const valueNumber = Number(amount);
  if (Number.isNaN(valueNumber)) {
    throw new Error("Monto inválido para generar la firma");
  }
  return valueNumber.toFixed(2);
};

const buildSignature = ({
  apiKey,
  merchantId,
  referenceCode,
  amount,
  currency,
}) => {
  const normalizedAmount = normalizeAmount(amount);
  const raw = `${apiKey}~${merchantId}~${referenceCode}~${normalizedAmount}~${currency}`;
  return CryptoJS.MD5(raw).toString();
};

const buildReferenceCode = (baseCode = "SABOR") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${baseCode}_${timestamp}_${random}`;
};

const getApiBaseUrl = () => {
  if (PAYU_API_URL) {
    return PAYU_API_URL;
  }
  return DEFAULT_API_URL;
};

export const generarFormularioPago = async (req, res) => {
  try {
    const {
      items,
      currency = "COP",
      description = "Pago Sabor",
      referenceCode,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      buyer,
      extraParams = {},
      redirectUrl,
      confirmationUrl,
      test = isTest ? 1 : 0,
      recomendaciones = "",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items es requerido y debe contener productos",
      });
    }

    if (!tipo_servicio || !["mesa", "domicilio"].includes(tipo_servicio)) {
      return res.status(400).json({
        message: "tipo_servicio inválido",
      });
    }

    if (tipo_servicio === "domicilio" && !direccion_entrega) {
      return res.status(400).json({
        message: "direccion_entrega es requerida para domicilio",
      });
    }

    const { total } = items.reduce(
      (acc, item) => {
        const cantidad = Number(item.cantidad || 0);
        const precio = Number(item.precio_unitario || item.precio || 0);
        if (Number.isFinite(cantidad) && Number.isFinite(precio)) {
          acc.total += cantidad * precio;
        }
        return acc;
      },
      { total: 0 },
    );

    if (total <= 0) {
      return res.status(400).json({
        message: "El total calculado debe ser mayor a cero",
      });
    }

    const normalizedAmount = normalizeAmount(total);
    const finalReferenceCode = referenceCode || buildReferenceCode();

    const signature = buildSignature({
      apiKey: PAYU_API_KEY,
      merchantId: PAYU_MERCHANT_ID,
      referenceCode: finalReferenceCode,
      amount: normalizedAmount,
      currency,
    });

    const actionUrl = isTest
      ? "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"
      : "https://checkout.payulatam.com/ppp-web-gateway-payu/";

    const formData = {
      merchantId: PAYU_MERCHANT_ID,
      accountId: PAYU_ACCOUNT_ID,
      description,
      referenceCode: finalReferenceCode,
      amount: normalizedAmount,
      tax: "0",
      taxReturnBase: "0",
      currency,
      signature,
      test,
      responseUrl:
        redirectUrl ||
        PAYU_RETURN_URL_OVERRIDE ||
        "https://sabor-production.up.railway.app/checkout",
    };

    if (buyer?.email) formData.buyerEmail = buyer.email;
    if (buyer?.fullName) formData.buyerFullName = buyer.fullName;
    if (confirmationUrl) formData.confirmationUrl = confirmationUrl;

    formData.extra1 = tipo_servicio;
    if (tipo_servicio === "domicilio") {
      formData.extra2 = direccion_entrega || "";
      if (detalle_direccion) {
        formData.extra3 = detalle_direccion;
      }
    }
    if (recomendaciones) {
      formData.extra4 = recomendaciones;
    }

    formData.extraParameters = {
      ...extraParams,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      recomendaciones,
    };

    return res.status(200).json({
      message: "Formulario generado",
      actionUrl,
      formData,
    });
  } catch (error) {
    console.error("Error generando formulario PayU:", error);
    return res.status(500).json({
      message: "Error generando formulario PayU",
      error: error.message,
    });
  }
};

export const crearOrdenPago = async (req, res) => {
  try {
    const {
      items,
      currency = "COP",
      description = "Pago Sabor",
      referenceCode,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      buyer,
      payer,
      extraParams = {},
      recomendaciones = "",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items es requerido y debe contener productos",
      });
    }

    if (!tipo_servicio || !["mesa", "domicilio"].includes(tipo_servicio)) {
      return res.status(400).json({
        message: "tipo_servicio inválido",
      });
    }

    if (tipo_servicio === "domicilio" && !direccion_entrega) {
      return res.status(400).json({
        message: "direccion_entrega es requerida para domicilio",
      });
    }

    const { total } = items.reduce(
      (acc, item) => {
        const cantidad = Number(item.cantidad || 0);
        const precio = Number(item.precio_unitario || item.precio || 0);
        if (Number.isFinite(cantidad) && Number.isFinite(precio)) {
          acc.total += cantidad * precio;
        }
        return acc;
      },
      { total: 0 },
    );

    if (total <= 0) {
      return res.status(400).json({
        message: "El total calculado debe ser mayor a cero",
      });
    }

    const normalizedAmount = normalizeAmount(total);
    const finalReferenceCode = referenceCode || buildReferenceCode();

    const signature = buildSignature({
      apiKey: PAYU_API_KEY,
      merchantId: PAYU_MERCHANT_ID,
      referenceCode: finalReferenceCode,
      amount: normalizedAmount,
      currency,
    });

    const body = {
      language: "es",
      command: "SUBMIT_TRANSACTION",
      merchant: {
        apiLogin: PAYU_API_LOGIN,
        apiKey: PAYU_API_KEY,
      },
      test: isTest,
      transaction: {
        order: {
          accountId: PAYU_ACCOUNT_ID,
          referenceCode: finalReferenceCode,
          description,
          language: "es",
          signature,
          notifyUrl: req.body.notifyUrl,
          additionalValues: {
            TX_VALUE: {
              value: Number(normalizedAmount),
              currency,
            },
          },
          buyer,
          extraParameters: {
            ...extraParams,
            tipo_servicio,
            direccion_entrega,
            detalle_direccion,
            recomendaciones,
          },
        },
        payer,
        creditCard: req.body.creditCard,
        type: req.body.type,
        paymentMethod: req.body.paymentMethod,
        paymentCountry: req.body.paymentCountry || "CO",
        deviceSessionId: req.body.deviceSessionId,
        ipAddress: req.body.ipAddress,
        cookie: req.body.cookie,
        userAgent: req.body.userAgent,
      },
    };

    const response = await fetch(
      `${getApiBaseUrl()}/payments-api/4.0/service.cgi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok || data?.code !== "SUCCESS") {
      console.error("Error PayU orden:", data);
      return res.status(502).json({
        message: "Error al crear la orden en PayU",
        error: data,
      });
    }

    return res.status(201).json({
      message: "Orden creada",
      data,
    });
  } catch (error) {
    console.error("Error creando orden PayU:", error);
    return res.status(500).json({
      message: "Error creando orden PayU",
      error: error.message,
    });
  }
};

export const consultarTransaccion = async (req, res) => {
  try {
    const { referenceCode } = req.params;

    if (!referenceCode) {
      return res.status(400).json({
        message: "Código de referencia requerido",
      });
    }

    const body = {
      language: "es",
      command: "ORDER_DETAIL_BY_REFERENCE_CODE",
      merchant: {
        apiLogin: PAYU_API_LOGIN,
        apiKey: PAYU_API_KEY,
      },
      test: isTest,
      details: {
        referenceCode,
      },
    };

    const response = await fetch(
      `${getApiBaseUrl()}/reports-api/4.0/service.cgi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok || data?.code !== "SUCCESS") {
      console.error("Error consultando transacción PayU:", data);
      return res.status(502).json({
        message: "Error consultando transacción PayU",
        error: data,
      });
    }

    return res.status(200).json({
      message: "Consulta exitosa",
      data,
    });
  } catch (error) {
    console.error("Error consultando transacción PayU:", error);
    return res.status(500).json({
      message: "Error consultando transacción PayU",
      error: error.message,
    });
  }
};
