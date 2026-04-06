import { useEffect, useState, useCallback } from 'react';
import domicilioService from '../../../shared/services/domicilioService';

export const useHistorialDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [marcandoRecibido, setMarcandoRecibido] = useState({});
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const fetchDomicilios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await domicilioService.getHistorialDomicilios();
      setDomicilios(res.data);
    } catch (error) {
      setDomicilios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomicilios();
  }, [fetchDomicilios]);

  const handleRecibido = async id_pedido => {
    try {
      setUpdating(prev => ({ ...prev, [id_pedido]: true }));
      setMarcandoRecibido(prev => ({ ...prev, [id_pedido]: true }));

      await domicilioService.marcarComoRecibido(id_pedido);

      setDomicilios(prev =>
        prev.map(d =>
          d.id_pedido === id_pedido
            ? {
                ...d,
                recibido_cliente: true,
                id_estado: 6,
                nombre_estado: 'Recibido',
              }
            : d
        )
      );

      setMensaje({
        texto: '¡Domicilio marcado como recibido exitosamente!',
        tipo: 'success',
      });

      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      console.error('Error al marcar pedido como recibido:', error);
      setMensaje({
        texto: error.response?.data?.message || 'Error al marcar como recibido',
        tipo: 'error',
      });

      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    } finally {
      setUpdating(prev => ({ ...prev, [id_pedido]: false }));
      setMarcandoRecibido(prev => ({ ...prev, [id_pedido]: false }));
    }
  };

  const formatearEstado = estado => {
    const estadosMap = {
      Pendiente: 'Pendiente',
      'En Preparación': 'En Preparación',
      Completado: 'Completado',
      Cancelado: 'Cancelado',
      Recibido: 'Recibido',
    };
    return estadosMap[estado] || estado;
  };

  const puedeMarcarComoRecibido = estado => {
    return estado && estado.toLowerCase() === 'completado';
  };

  return {
    domicilios,
    loading,
    updating,
    marcandoRecibido,
    mensaje,
    handleRecibido,
    formatearEstado,
    puedeMarcarComoRecibido,
  };
};
