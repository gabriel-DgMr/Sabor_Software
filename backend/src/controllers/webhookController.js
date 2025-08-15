import { updatePedidoEstadoPorPago } from "../models/pedidoModel.js";
import fetch from "node-fetch";

// Webhook MercadoPago
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
