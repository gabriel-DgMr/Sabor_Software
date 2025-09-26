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

// Marcar domicilio como recibido (solo para el cliente propietario)
export const marcarComoRecibido = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "ID de pedido requerido" });
    }

    const actualizado = await domicilioModel.marcarDomicilioComoRecibido(
      id,
      id_usuario,
    );

    if (!actualizado) {
      return res
        .status(404)
        .json({ message: "Pedido no encontrado o no se pudo actualizar" });
    }

    res.json({
      message: "Domicilio marcado como recibido exitosamente",
      pedidoId: id,
    });
  } catch (error) {
    console.error("Error en marcarComoRecibido:", error);
    res.status(500).json({ message: error.message });
  }
};
