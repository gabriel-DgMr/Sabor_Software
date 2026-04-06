import { pagosService } from "./services.js";

/**
 * @description Crea una orden directa en PayU
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const crearOrdenPago = async (req, res) => {
  try {
    const result = await pagosService.crearOrdenPayU(
      req.body.items,
      req.user,
      req.ip,
      req.get("User-Agent"),
    );
    res.json(result);
  } catch (error) {
    console.error("Error al procesar pago con PayU:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @description Genera un formulario de checkout PayU Web
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const generarFormularioPago = (req, res) => {
  try {
    const result = pagosService.generarFormularioPayU(
      req.body.items,
      req.body.buyerEmail,
    );
    res.json(result);
  } catch (error) {
    console.error("Error al generar formulario PayU:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @description Consulta el estado de transacción con referencia
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const consultarTransaccion = async (req, res) => {
  try {
    const result = await pagosService.consultarTransaccionPayU(
      req.params.referenceCode,
    );
    res.json(result);
  } catch (error) {
    console.error("Error al consultar transaccion:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @description Maneja Webhooks de PayU
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const payuWebhook = async (req, res) => {
  try {
    console.log("🔔 PayU Webhook recibido!", req.body);
    await pagosService.procesarWebhookPayU(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook PayU:", error);
    res.status(500).send("Error");
  }
};

/**
 * @description Maneja Webhooks de MercadoPago (legacy)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const mercadopagoWebhook = async (req, res) => {
  try {
    await pagosService.procesarWebhookMercadopago(
      req.query.id,
      req.query.topic,
    );
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook MercadoPago:", error);
    res.status(500).send("Error");
  }
};
