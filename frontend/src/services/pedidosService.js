const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
