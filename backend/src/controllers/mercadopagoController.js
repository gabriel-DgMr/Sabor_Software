import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken:
    "TEST-2675350345028368-072418-6ec105066a059fa3fd56aac3c35d7c39-2107333883",
  options: { timeout: 5000 },
});
const preferenceClient = new Preference(client);

export const crearPreferencia = async (req, res) => {
  try {
    const { items } = req.body;

    // Cambia esta URL por la de tu frontend local expuesta por ngrok
    const FRONTEND_URL = "https://69a1bd860dac.ngrok-free.app";
    const preferenceData = {
      items: items.map((item) => ({
        title: item.nombre_producto,
        unit_price: Number(item.precio_unitario),
        quantity: Number(item.cantidad),
        currency_id: "COP",
      })),
      back_urls: {
        success: `${FRONTEND_URL}/checkout?status=success`,
        failure: `${FRONTEND_URL}/checkout?status=failure`,
        pending: `${FRONTEND_URL}/checkout?status=pending`,
      },
      auto_return: "approved",
    };

    console.log(
      "Preference enviada a Mercado Pago:",
      JSON.stringify(preferenceData, null, 2),
    );

    const response = await preferenceClient.create({ body: preferenceData });
    res.json({ init_point: response.init_point });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear preferencia de pago",
      detalle: error.message,
    });
  }
};
