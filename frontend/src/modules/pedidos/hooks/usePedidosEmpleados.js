import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidos-service';

export const usePedidosEmpleados = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('mesa');

  const cargarPedidos = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const datosPedidos = await obtenerPedidos();
      setPedidos(datosPedidos);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const cambiarEstado = async (pedidoId, estadoActual) => {
    try {
      const siguienteEstado = obtenerSiguienteEstado(estadoActual);
      if (!siguienteEstado) return;

      const nuevoEstadoId = mapearEstadoAId(siguienteEstado);

      setPedidos(prev => prev.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: true } : p)));

      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId
            ? { ...p, estado: siguienteEstado, id_estado: nuevoEstadoId, cambiandoEstado: false }
            : p
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setPedidos(prev => prev.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: false } : p)));
    }
  };

  const pedidosFiltrados =
    filtroActivo === 'todos' ? pedidos : pedidos.filter(p => p.tipo_servicio === filtroActivo);

  return {
    pedidosFiltrados,
    cargando,
    filtroActivo,
    setFiltroActivo,
    cambiarEstado,
  };
};
