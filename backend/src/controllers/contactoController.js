import * as mensajeContactoModel from "../models/contactoModel.js";

export const enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;
    // Si el cliente está autenticado, puedes obtener el id_usuario de req.user
    const id_usuario = req.user ? req.user.userId : null;

    if (!mensaje) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    await mensajeContactoModel.crearMensajeContacto({
      id_usuario,
      nombre,
      email,
      mensaje,
    });
    res.status(201).json({ mensaje: "Mensaje enviado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar el mensaje." });
  }
};
