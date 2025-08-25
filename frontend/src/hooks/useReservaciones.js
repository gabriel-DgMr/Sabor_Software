import { useState, useEffect, useCallback } from 'react';
import { reservacionService } from '../services/reservacionService.js';

export const useReservaciones = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Cargar reservaciones por fecha
  const cargarReservaciones = useCallback(
    async (fecha = fechaSeleccionada) => {
      try {
        setLoading(true);
        setError(null);
        const data = await reservacionService.getReservacionesByFecha(fecha);
        setReservaciones(data);
      } catch (error) {
        setError('Error al cargar las reservaciones');
        console.error('Error al cargar reservaciones:', error);
      } finally {
        setLoading(false);
      }
    },
    [fechaSeleccionada]
  );

  // Cargar todas las reservaciones
  const cargarTodasReservaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservacionService.getAllReservaciones();
      setReservaciones(data);
    } catch (error) {
      setError('Error al cargar todas las reservaciones');
      console.error('Error al cargar todas las reservaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de reservación
  const actualizarEstadoReservacion = useCallback(
    async (id, nuevoEstado) => {
      try {
        setError(null);
        await reservacionService.updateEstadoReservacion(id, nuevoEstado);
        // Recargar reservaciones después de actualizar
        await cargarReservaciones();
      } catch (error) {
        setError('Error al actualizar el estado de la reservación');
        console.error('Error al actualizar estado:', error);
        throw error;
      }
    },
    [cargarReservaciones]
  );

  // Eliminar reservación
  const eliminarReservacion = useCallback(
    async id => {
      try {
        setError(null);
        await reservacionService.deleteReservacion(id);
        // Recargar reservaciones después de eliminar
        await cargarReservaciones();
      } catch (error) {
        setError('Error al eliminar la reservación');
        console.error('Error al eliminar reservación:', error);
        throw error;
      }
    },
    [cargarReservaciones]
  );

  // Filtrar reservaciones por estado
  const filtrarPorEstado = useCallback(
    estado => {
      if (estado === 'todos') return reservaciones;
      return reservaciones.filter(reservacion => reservacion.estado === estado);
    },
    [reservaciones]
  );

  // Filtrar reservaciones por hora
  const filtrarPorHora = useCallback(
    hora => {
      if (hora === 'todos') return reservaciones;
      return reservaciones.filter(reservacion => {
        const horaReservacion = parseInt(reservacion.hora_reservacion.split(':')[0]);
        return horaReservacion === parseInt(hora);
      });
    },
    [reservaciones]
  );

  // Obtener estadísticas de reservaciones
  const obtenerEstadisticas = useCallback(() => {
    const total = reservaciones.length;
    const porEstado = reservaciones.reduce((acc, reservacion) => {
      acc[reservacion.estado] = (acc[reservacion.estado] || 0) + 1;
      return acc;
    }, {});

    const porHora = reservaciones.reduce((acc, reservacion) => {
      const hora = reservacion.hora_reservacion.split(':')[0];
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      porEstado,
      porHora,
    };
  }, [reservaciones]);

  // Cargar reservaciones cuando cambie la fecha
  useEffect(() => {
    cargarReservaciones();
  }, [fechaSeleccionada, cargarReservaciones]);

  return {
    // Estado
    reservaciones,
    loading,
    error,
    fechaSeleccionada,

    // Setters
    setFechaSeleccionada,

    // Funciones principales
    cargarReservaciones,
    cargarTodasReservaciones,
    actualizarEstadoReservacion,
    eliminarReservacion,

    // Funciones de filtrado
    filtrarPorEstado,
    filtrarPorHora,

    // Utilidades
    obtenerEstadisticas,

    // Limpiar error
    limpiarError: () => setError(null),
  };
};
