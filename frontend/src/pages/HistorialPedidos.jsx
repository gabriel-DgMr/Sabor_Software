import axios from 'axios';
import React, { useEffect, useState } from 'react';

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/pedidos';
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false
        });
        setPedidos(res.data);
      } catch (_err) {
        setError('Error al cargar el historial de pedidos');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) return <div>Cargando historial de pedidos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="historial-pedidos">
      <h2>Historial de Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No tienes pedidos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Recomendaciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido._id}>
                <td>{new Date(pedido.createdAt).toLocaleString()}</td>
                <td>{pedido.items && pedido.items.join(', ')}</td>
                <td>${pedido.total}</td>
                <td>{pedido.recomendaciones || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistorialPedidos; 