import { useState, useEffect } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  marcarPedidoRecibido,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidos-service';

/**
 * Hook personalizado para manejar la lógica de pedidos a domicilio.
 * Centraliza la carga, actualización de estados y marcas de recibido.
 */
export const useDomicilios = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState({});
  const [error, setError] = useState(null);

  const cargarPedidos = async () => {
    if (!isAuthenticated || authLoading) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const datosPedidos = await obtenerPedidos();
      // Filtrar solo domicilios
      setPedidos(datosPedidos.filter(p => p.tipo_servicio === 'domicilio'));
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos a domicilio.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [isAuthenticated, authLoading]);

  const cambiarEstado = async (pedidoId, estadoActual) => {
    try {
      setActualizando(prev => ({ ...prev, [pedidoId]: true }));
      const siguienteEstado = obtenerSiguienteEstado(estadoActual);
      if (!siguienteEstado) return;

      const nuevoEstadoId = mapearEstadoAId(siguienteEstado);
      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId ? { ...p, estado: siguienteEstado, id_estado: nuevoEstadoId } : p
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizando(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const marcarRecibido = async pedidoId => {
    try {
      setActualizando(prev => ({ ...prev, [pedidoId]: true }));
      await marcarPedidoRecibido(pedidoId);

      setPedidos(prev => prev.map(p => (p.id === pedidoId ? { ...p, recibido_cliente: true } : p)));
    } catch (err) {
      console.error('Error al marcar pedido como recibido:', err);
      setError('No se pudo marcar el pedido como recibido.');
    } finally {
      setActualizando(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  return {
    pedidos,
    cargando,
    actualizando,
    error,
    cambiarEstado,
    marcarRecibido,
    recargarPedidos: cargarPedidos,
  };
};
