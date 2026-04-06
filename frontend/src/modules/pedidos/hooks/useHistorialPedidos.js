import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useHistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    producto: null,
    pedidoId: null,
    initialRating: 0,
    initialComment: '',
  });
  const [productosParaCalificar, setProductosParaCalificar] = useState({});

  const fetchPedidos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para ver tu historial de pedidos');
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: false,
      });
      setPedidos(res.data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      if (err.response?.status === 401) {
        setError('Debes iniciar sesión para ver tu historial de pedidos');
      } else {
        setError('Error al cargar el historial de pedidos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const fetchProductosParaCalificar = useCallback(async pedidoId => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_URL}/calificaciones/pedido/${pedidoId}/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProductosParaCalificar(prev => ({
        ...prev,
        [pedidoId]: res.data.productos,
      }));
    } catch (err) {
      console.error('Error al cargar productos para calificar:', err);
    }
  }, []);

  const openRatingModal = (producto, pedidoId) => {
    setRatingModal({
      isOpen: true,
      producto,
      pedidoId,
      initialRating: producto.calificacion_actual || 0,
      initialComment: producto.comentario_actual || '',
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      producto: null,
      pedidoId: null,
      initialRating: 0,
      initialComment: '',
    });
  };

  const handleSubmitRating = async ratingData => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      await axios.post(`${API_URL}/calificaciones`, ratingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await fetchProductosParaCalificar(ratingData.pedidoId);
      console.log('Calificación enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      throw error;
    }
  };

  const toggleProductosCalificables = pedidoId => {
    if (!productosParaCalificar[pedidoId]) {
      fetchProductosParaCalificar(pedidoId);
    }
  };

  return {
    pedidos,
    loading,
    error,
    ratingModal,
    productosParaCalificar,
    openRatingModal,
    closeRatingModal,
    handleSubmitRating,
    toggleProductosCalificables,
  };
};
