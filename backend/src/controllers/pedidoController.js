import { getPedidos as getPedidosFromModel, deletePedido as deletePedidoFromModel, createPedido as createPedidoFromModel, updatePedido as updatePedidoFromModel } from '../models/pedidoModel.js';

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    // Obtener el ID del usuario autenticado del objeto req
    const userId = req.user.userId; // Asumiendo que el middleware de autenticación añade el ID del usuario en req.user.userId

    const pedidos = await getPedidosFromModel(userId); // Pasar el ID del usuario al modelo
    res.json(pedidos);
  } catch (error) {
    console.error('Error en getPedidos:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener los pedidos', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Eliminar un pedido
export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ mensaje: 'ID de pedido no proporcionado' });
    }

    const pedido = await deletePedidoFromModel(id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json({ 
      mensaje: 'Pedido eliminado exitosamente', 
      pedido 
    });
  } catch (error) {
    console.error('Error en deletePedido:', error);
    res.status(500).json({ 
      mensaje: 'Error al eliminar el pedido', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Crear un nuevo pedido
export const createPedido = async (req, res) => {
  try {
    const { items, total, recomendaciones } = req.body;
    const userId = req.user.userId; // Asumiendo que el middleware de autenticación añade el ID del usuario

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ mensaje: 'La lista de items es requerida y debe ser un array no vacío' });
    }

    // Validar cada item en el array
    for (const item of items) {
        if (!item.id_producto || typeof item.id_producto !== 'number') {
            return res.status(400).json({ mensaje: 'Cada item debe tener un id_producto numérico válido' });
        }
        if (!item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
            return res.status(400).json({ mensaje: 'Cada item debe tener una cantidad numérica positiva' });
        }
         if (!item.precio_unitario || typeof item.precio_unitario !== 'number' || item.precio_unitario < 0) {
            return res.status(400).json({ mensaje: 'Cada item debe tener un precio_unitario numérico no negativo' });
        }
    }

    if (!total || typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ mensaje: 'El total es requerido y debe ser un número positivo' });
    }

    // Validar recomendaciones (opcional, puede ser un string vacío)
    if (recomendaciones !== undefined && typeof recomendaciones !== 'string') {
        return res.status(400).json({ mensaje: 'Las recomendaciones deben ser un string' });
    }

    const pedidoGuardado = await createPedidoFromModel({ userId, items, total, recomendaciones });
    
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    console.error('Error en createPedido:', error);
    res.status(400).json({ 
      mensaje: 'Error al crear el pedido', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Actualizar un pedido
export const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: 'ID de pedido no proporcionado' });
    }

    // Validaciones
    if (items && (!Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({ mensaje: 'La lista de items debe ser un array no vacío' });
    }

    if (total && (typeof total !== 'number' || total <= 0)) {
      return res.status(400).json({ mensaje: 'El total debe ser un número positivo' });
    }

    const pedido = await updatePedidoFromModel(id, { items, total });

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error en updatePedido:', error);
    res.status(400).json({ 
      mensaje: 'Error al actualizar el pedido', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}; 