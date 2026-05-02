import { useState, useEffect } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import {
  actualizarEstadoPedido,
  marcarPedidoRecibido,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidos-service';
import domicilioService from '../services/domicilio-service';
import { toast } from 'react-toastify';

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
      const res = await domicilioService.getDomicilios();
      setPedidos(res.data);
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
      toast.success(`Pedido #${pedidoId} actualizado a ${siguienteEstado}`);
      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      const mensajeError = 'No se pudo actualizar el estado del pedido.';
      toast.error(mensajeError);
      setError(mensajeError);
    } finally {
      setActualizando(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const marcarRecibido = async pedidoId => {
    try {
      setActualizando(prev => ({ ...prev, [pedidoId]: true }));
      await marcarPedidoRecibido(pedidoId);

      setPedidos(prev => prev.map(p => (p.id === pedidoId ? { ...p, recibido_cliente: true } : p)));
      toast.success(`Pedido #${pedidoId} marcado como recibido`);
      setError(null);
    } catch (err) {
      console.error('Error al marcar pedido como recibido:', err);
      const mensajeError = 'No se pudo marcar el pedido como recibido.';
      toast.error(mensajeError);
      setError(mensajeError);
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
