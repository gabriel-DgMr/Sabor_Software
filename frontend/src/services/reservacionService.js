const API_URL = import.meta.env.VITE_API_URL || '/api';

export const reservacionService = {
  // Obtener todas las reservaciones
  getAllReservaciones: async () => {
    const response = await fetch(`${API_URL}/reservaciones`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones');
    }
    return await response.json();
  },

  // Obtener reservaciones por fecha
  getReservacionesByFecha: async fecha => {
    const response = await fetch(`${API_URL}/reservaciones/fecha/${fecha}`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones por fecha');
    }
    return await response.json();
  },

  // Obtener reservaciones por estado
  getReservacionesByEstado: async estado => {
    const response = await fetch(`${API_URL}/reservaciones/estado/${estado}`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones por estado');
    }
    return await response.json();
  },

  // Actualizar estado de reservación
  updateEstadoReservacion: async (id, estado) => {
    const response = await fetch(`${API_URL}/reservaciones/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar estado de reservación');
    }
    return await response.json();
  },

  // Eliminar reservación
  deleteReservacion: async id => {
    const response = await fetch(`${API_URL}/reservaciones/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar reservación');
    }
    return await response.json();
  },
};
