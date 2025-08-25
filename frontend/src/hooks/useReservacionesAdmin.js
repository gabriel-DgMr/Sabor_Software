import { useState, useCallback } from 'react';
import { useReservaciones } from './useReservaciones.js';

export const useReservacionesAdmin = () => {
  const reservacionesData = useReservaciones();
  const [filtros, setFiltros] = useState({
    hora: 'todos',
    estado: 'todos',
    mesa: 'todos',
  });

  // Aplicar filtros combinados
  const aplicarFiltros = useCallback(() => {
    let reservacionesFiltradas = reservacionesData.reservaciones;

    // Filtrar por estado
    if (filtros.estado !== 'todos') {
      reservacionesFiltradas = reservacionesFiltradas.filter(
        reservacion => reservacion.estado === filtros.estado
      );
    }

    // Filtrar por hora
    if (filtros.hora !== 'todos') {
      reservacionesFiltradas = reservacionesFiltradas.filter(reservacion => {
        const horaReservacion = parseInt(reservacion.hora_reservacion.split(':')[0]);
        return horaReservacion === parseInt(filtros.hora);
      });
    }

    // Filtrar por mesa
    if (filtros.mesa !== 'todos') {
      reservacionesFiltradas = reservacionesFiltradas.filter(
        reservacion => reservacion.numero_mesa === parseInt(filtros.mesa)
      );
    }

    return reservacionesFiltradas;
  }, [reservacionesData.reservaciones, filtros]);

  // Actualizar filtros
  const actualizarFiltros = useCallback(nuevosFiltros => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      hora: 'todos',
      estado: 'todos',
      mesa: 'todos',
    });
  }, []);

  // Obtener reservaciones agrupadas por hora
  const obtenerReservacionesPorHora = useCallback(() => {
    const reservacionesFiltradas = aplicarFiltros();
    const agrupadas = {};

    reservacionesFiltradas.forEach(reservacion => {
      const hora = reservacion.hora_reservacion.split(':')[0];
      if (!agrupadas[hora]) {
        agrupadas[hora] = [];
      }
      agrupadas[hora].push(reservacion);
    });

    return agrupadas;
  }, [aplicarFiltros]);

  // Obtener estadísticas de la fecha actual
  const obtenerEstadisticasFecha = useCallback(() => {
    const reservacionesFiltradas = aplicarFiltros();
    const total = reservacionesFiltradas.length;

    const porEstado = reservacionesFiltradas.reduce((acc, reservacion) => {
      acc[reservacion.estado] = (acc[reservacion.estado] || 0) + 1;
      return acc;
    }, {});

    const porHora = reservacionesFiltradas.reduce((acc, reservacion) => {
      const hora = reservacion.hora_reservacion.split(':')[0];
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      porEstado,
      porHora,
      promedioPersonas:
        total > 0
          ? reservacionesFiltradas.reduce((sum, r) => sum + r.numero_personas, 0) / total
          : 0,
    };
  }, [aplicarFiltros]);

  return {
    // Datos del hook base
    ...reservacionesData,

    // Filtros
    filtros,
    actualizarFiltros,
    limpiarFiltros,

    // Funciones específicas de administración
    aplicarFiltros,
    obtenerReservacionesPorHora,
    obtenerEstadisticasFecha,

    // Utilidades adicionales
    reservacionesFiltradas: aplicarFiltros(),
    estadisticas: obtenerEstadisticasFecha(),
  };
};
