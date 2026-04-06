const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Obtener todos los pedidos (para administradores)
export const obtenerPedidos = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

// Actualizar estado de un pedido
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevoEstado }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

// Mapeo de estados de la base de datos a texto legible
export const mapearEstado = estado => {
  const estadosMap = {
    pendiente: 'Pendiente',
    'en-preparacion': 'En preparación',
    completado: 'Completado',
    cancelado: 'Cancelado',
    recibido: 'Recibido',
  };
  return estadosMap[estado] || estado;
};

// Mapeo de estados de la base de datos a IDs
export const mapearEstadoAId = estado => {
  const estadosMap = {
    pendiente: 2,
    'en-preparacion': 5,
    completado: 3,
    cancelado: 4,
    recibido: 6,
  };
  return estadosMap[estado] || 2;
};

// Obtener el siguiente estado en la secuencia
export const obtenerSiguienteEstado = estadoActual => {
  const secuenciaEstados = ['pendiente', 'en-preparacion', 'completado'];
  const indiceActual = secuenciaEstados.indexOf(estadoActual);

  if (indiceActual === -1 || indiceActual === secuenciaEstados.length - 1) {
    return secuenciaEstados[0]; // Volver al inicio si no se encuentra o es el último
  }

  return secuenciaEstados[indiceActual + 1];
};

// --- Gestión de Carrito ---

// Obtener carrito desde la base de datos
export const obtenerCarrito = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { items: [] };

  const response = await fetch(`${API_BASE_URL}/pedidos/carrito`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return { items: [] };
  if (!response.ok) throw new Error('Error al cargar el carrito');

  return await response.json();
};

// Agregar producto al carrito
export const agregarAlCarrito = async (id_producto, cantidad, id_mesa) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Debes iniciar sesión para agregar productos');

  const response = await fetch(`${API_BASE_URL}/pedidos/carrito/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_producto,
      cantidad,
      id_mesa: id_mesa ? Number(id_mesa) : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al agregar producto');
  }

  return await response.json();
};

// Eliminar producto del carrito
export const eliminarDelCarrito = async id_producto => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/pedidos/carrito/remove`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id_producto }),
  });

  if (response.status === 404) return { items: [] };
  if (!response.ok) throw new Error('Error al eliminar producto');

  return await response.json();
};

// Actualizar cantidad de un producto en el carrito
export const actualizarCantidadCarrito = async (id_producto, cantidad) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/pedidos/carrito/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id_producto, cantidad }),
  });

  if (response.status === 404) return { items: [] };
  if (!response.ok) throw new Error('Error al actualizar cantidad');

  return await response.json();
};

// Vaciar el carrito
export const vaciarCarrito = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/pedidos/carrito/vaciar`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return;
  if (!response.ok) throw new Error('Error al vaciar el carrito');

  return await response.json();
};

// Confirmar pedido
export const confirmarPedidoAPI = async datosPedido => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Debes iniciar sesión para confirmar el pedido');

  const response = await fetch(`${API_BASE_URL}/pedidos/carrito/confirmar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosPedido),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al confirmar el pedido');
  }

  return await response.json();
};

// Marcar pedido como recibido por el cliente
export const marcarPedidoRecibido = async pedidoId => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/pedidos/recibir/${pedidoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al marcar el pedido como recibido');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al marcar pedido como recibido:', error);
    throw error;
  }
};
