// backend/src/controllers/domicilioController.js
import * as domicilioModel from "../models/domicilioModel.js";

export const getHistorialDomicilios = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const domicilios = await domicilioModel.getDomiciliosByUserId(id_usuario);
    res.json(domicilios);
 } catch (error) {
  console.error("Error en getHistorialDomicilios:", error); // 👈 imprime el error completo
  res.status(500).json({ message: error.message });
}

};