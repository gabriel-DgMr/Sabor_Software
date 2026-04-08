import api from '../../../shared/services/api';

/**
 * Servicio de Reservas
 * Centraliza todas las llamadas a la API relacionadas con reservaciones de mesas.
 */
const reservasService = {
  /**
   * Obtiene todas las reservaciones.
   */
  getTodas: async () => {
    try {
      const response = await api.get('/reservas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene reservaciones filtradas por fecha (YYYY-MM-DD).
   */
  getPorFecha: async fecha => {
    try {
      const response = await api.get(`/reservas/fecha/${fecha}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener reservaciones para ${fecha}:`, error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de una reservación (confirmada, cancelada, completada).
   */
  actualizarEstado: async (id, estado) => {
    try {
      const response = await api.put(`/reservas/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado de reserva ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una reservación.
   */
  eliminar: async id => {
    try {
      const response = await api.delete(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar reserva ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva reservación (Cliente).
   */
  crear: async datosReserva => {
    try {
      const response = await api.post('/reservas/hacerReserva', datosReserva);
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de reservaciones del usuario actual.
   */
  getMiHistorial: async () => {
    try {
      const response = await api.get('/reservas/historial');
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de reservas:', error);
      throw error;
    }
  },
};

export default reservasService;
