const API_URL = import.meta.env.VITE_API_URL || '/api';

export const reservacionService = {
  // Obtener todas las reservaciones
  getAllReservaciones: async () => {
    const response = await fetch(`${API_URL}/reservas`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones');
    }
    return await response.json();
  },

  // Obtener reservaciones por fecha
  getReservacionesByFecha: async fecha => {
    const response = await fetch(`${API_URL}/reservas/fecha/${fecha}`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones por fecha');
    }
    return await response.json();
  },

  // Obtener reservaciones por estado (usando filtros en getAllReservaciones)
  getReservacionesByEstado: async estado => {
    const response = await fetch(`${API_URL}/reservas`);
    if (!response.ok) {
      throw new Error('Error al obtener reservaciones');
    }
    const data = await response.json();
    // Filtrar por estado en el frontend ya que no hay endpoint específico
    return data.filter(reserva => reserva.estado === estado);
  },

  // Actualizar estado de reservación
  updateEstadoReservacion: async (id, estado) => {
    const response = await fetch(`${API_URL}/reservas/${id}/estado`, {
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
    const response = await fetch(`${API_URL}/reservas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar reservación');
    }
    return await response.json();
  },
};
