import {
  updatePedidoEstadoPorPago,
  updatePedidoEstadoPorReferencia,
} from "../models/pedidoModel.js";
import crypto from "crypto-js";

// Webhook PayU
export const payuWebhook = async (req, res) => {
  try {
    console.log("🔔 PayU Webhook recibido!");
    console.log("📋 Headers:", req.headers);
    console.log("📋 Body:", req.body);
    console.log("📋 Query params:", req.query);

    // PayU envía los datos en el cuerpo de la petición
    const {
      merchant_id,
      state_pol,
      risk,
      response_code_pol,
      reference_sale,
      reference_pol,
      sign,
      value,
      currency,
      test,
      transaction_date,
    } = req.body;

    // Validar la firma de seguridad (opcional pero recomendado)
    const apiKey = process.env.PAYU_API_KEY || "4Vj8eK4rloUd272L48hsrarnUA";
    const expectedSign = crypto
      .MD5(
        `${apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`,
      )
      .toString();

    if (sign && sign !== expectedSign) {
      console.error("Firma de PayU inválida");
      return res.status(400).send("Invalid signature");
    }

    // Mapear estados de PayU a estados del sistema
    let nuevoEstado = null;
    switch (state_pol) {
      case "4": // Transacción aprobada
        nuevoEstado = 3; // Pagado
        break;
      case "6": // Transacción rechazada
      case "104": // Error
        nuevoEstado = 4; // Cancelado
        break;
      case "7": // Pago pendiente
      case "15": // Pago pendiente
        nuevoEstado = 2; // Pendiente
        break;
      default:
        console.log(`Estado PayU no manejado: ${state_pol}`);
        return res.status(200).send("OK");
    }

    // La referencia viene en reference_sale con formato SABOR_timestamp_randomstring
    if (reference_sale && nuevoEstado) {
      try {
        // Buscar el pedido por referencia de pago
        await updatePedidoEstadoPorReferencia(reference_sale, nuevoEstado);
        console.log(
          `Pedido con referencia ${reference_sale} actualizado a estado ${nuevoEstado}`,
        );
      } catch (error) {
        console.error(
          `Error al actualizar pedido con referencia ${reference_sale}:`,
          error,
        );
        // No fallar el webhook si no se puede actualizar el pedido
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook PayU:", error);
    res.status(500).send("Error");
  }
};

// Mantener el webhook de MercadoPago por compatibilidad (opcional)
export const mercadopagoWebhook = async (req, res) => {
  try {
    const { id, topic } = req.query;
    if (topic !== "payment") {
      return res.status(200).send("OK");
    }
    // Consultar el pago a la API de MercadoPago
    const mpToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      "TEST-2675350345028368-072418-6ec105066a059fa3fd56aac3c35d7c39-2107333883";
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: { Authorization: `Bearer ${mpToken}` },
      },
    );
    const pago = await response.json();
    // Buscar el pedido relacionado (external_reference debe ser el id_pedido)
    const id_pedido = pago.external_reference;
    let nuevoEstado = null;
    if (pago.status === "approved")
      nuevoEstado = 3; // Pagado
    else if (pago.status === "rejected" || pago.status === "cancelled")
      nuevoEstado = 4; // Cancelado
    else if (pago.status === "pending" || pago.status === "in_process")
      nuevoEstado = 2; // Pendiente
    if (id_pedido && nuevoEstado) {
      await updatePedidoEstadoPorPago(id_pedido, nuevoEstado);
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook MercadoPago:", error);
    res.status(500).send("Error");
  }
};
