import * as domicilioModel from "../models/domicilioModel.js";

// Para clientes: historial de sus propios domicilios
export const getHistorialDomicilios = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const domicilios = await domicilioModel.getDomiciliosByUserId(id_usuario);
    res.json(domicilios);
  } catch (error) {
    console.error("Error en getHistorialDomicilios:", error); // log detallado
    res.status(500).json({ message: error.message });
  }
};

// Para empleados/admin: ver todos los domicilios
export const getDomicilios = async (req, res) => {
  try {
    const domicilios = await domicilioModel.getDomicilios();
    res.json(domicilios);
  } catch (error) {
    console.error("Error en getDomicilios:", error);
    res.status(500).json({ message: error.message });
  }
};
