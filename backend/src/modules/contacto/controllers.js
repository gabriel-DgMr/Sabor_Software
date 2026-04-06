import * as contactoServices from "./services.js";

/**
 * Controlador para enviar un mensaje de contacto.
 */
export const enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // Obtener id_usuario si el usuario está autenticado (proporcionado por el middleware de auth)
    const id_usuario = req.user ? req.user.id : null;

    if (!mensaje) {
      return res.status(400).json({
        success: false,
        error: "El mensaje es obligatorio.",
      });
    }

    // Validar email si no hay id_usuario
    if (!id_usuario && !email) {
      return res.status(400).json({
        success: false,
        error:
          "El correo electrónico es obligatorio para usuarios no autenticados.",
      });
    }

    await contactoServices.procesarMensajeContacto({
      id_usuario,
      nombre,
      email,
      mensaje,
    });

    res.status(201).json({
      success: true,
      mensaje:
        "Mensaje enviado correctamente. Nos pondremos en contacto pronto.",
    });
  } catch (error) {
    console.error("Error en enviarMensajeContacto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno al procesar el mensaje de contacto.",
    });
  }
};
