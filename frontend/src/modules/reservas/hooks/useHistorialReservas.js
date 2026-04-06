import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const useHistorialReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservas = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reservas/historial', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservas(res.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('No autorizado: Debes iniciar sesión para ver tu historial.');
        } else if (err.response.status === 404) {
          setError('No se encontró el recurso de historial de reservas.');
        } else if (err.response.status === 500) {
          setError('Error interno del servidor al obtener el historial.');
        } else {
          setError(`Error inesperado: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor.');
      } else {
        setError('Error desconocido al cargar el historial de reservaciones.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return {
    reservas,
    loading,
    error,
  };
};
