import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidos-service';
import { toast } from 'react-toastify';

export const usePedidosAdministrador = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

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
      toast.error('Error al cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const cambiarEstado = async (pedidoId, estadoActual) => {
    try {
      setPedidos(prevPedidos =>
        prevPedidos.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: true } : p))
      );

      const siguienteEstado = obtenerSiguienteEstado(estadoActual);
      const nuevoEstadoId = mapearEstadoAId(siguienteEstado);

      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId
            ? {
                ...p,
                estado: siguienteEstado,
                id_estado: nuevoEstadoId,
                cambiandoEstado: false,
              }
            : p
        )
      );

      toast.success(`Pedido #${pedidoId} actualizado a ${siguienteEstado}`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setPedidos(prevPedidos =>
        prevPedidos.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: false } : p))
      );
      const mensajeError = `Error al actualizar el pedido ${pedidoId}: ${err.message}`;
      toast.error(mensajeError);
    }
  };

  const refrescarPedidos = async () => {
    if (!isAuthenticated) return;
    await cargarPedidos();
  };

  const pedidosFiltrados =
    filtroActivo === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtroActivo);

  return {
    filtroActivo,
    setFiltroActivo,
    pedidosFiltrados,
    cargando,
    authLoading,
    isAuthenticated,
    cambiarEstado,
    refrescarPedidos,
  };
};
