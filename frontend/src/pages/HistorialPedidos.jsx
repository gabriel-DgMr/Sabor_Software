import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/historialPedidos.css';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Debes iniciar sesión para ver tu historial de pedidos');
          setLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/pedidos';
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false
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
    };
    fetchPedidos();
  }, []);

  if (loading) return (
    <div>
      <Header />
      <div className="historial-pedidos-bg">
        <div className="historial-pedidos-titulo">
          <h2>Historial de Pedidos</h2>
        </div>
        <div className="historial-pedidos-lista">
          <div className="pedido-tarjeta">
            <div className="pedido-tarjeta-header">
              <span>Cargando...</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div>
      <Header />
      <div className="historial-pedidos-bg">
        <div className="historial-pedidos-titulo">
          <h2>Historial de Pedidos</h2>
        </div>
        <div className="historial-pedidos-lista">
          <div className="pedido-tarjeta error">
            <div className="pedido-tarjeta-header">
              <span className="error-message">{error}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div>
      <Header />
      <div className="historial-pedidos-bg">
        <div className="historial-pedidos-titulo">
          <h2>Historial de Pedidos</h2>
        </div>
        <div className="historial-pedidos-lista">
          {pedidos.length === 0 ? (
            <div className="pedido-tarjeta">
              <div className="pedido-tarjeta-header">
                <span>No tienes pedidos registrados</span>
              </div>
              <div className="pedido-productos">
                <p>¡Haz tu primer pedido y aparecerá aquí!</p>
              </div>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <div className="pedido-tarjeta" key={pedido._id}>
                <div className="pedido-tarjeta-header">
                  <span className="pedido-fecha">
                    {new Date(pedido.createdAt).toLocaleString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className={`pedido-estado ${pedido.estado?.toLowerCase() || 'pendiente'}`}>
                    {pedido.estado || 'Pendiente'}
                  </span>
                </div>
                <div className="pedido-productos">
                  <h4>Productos:</h4>
                  <ul>
                    {(pedido.items || []).map((item, idx) => (
                      <li key={idx}>
                        <span className="producto-nombre">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pedido-total">
                  <span>Total:</span> 
                  <span className="pedido-total-monto">
                    ${pedido.total?.toLocaleString('es-CO') || '0'}
                  </span>
                </div>
                {pedido.recomendaciones && (
                  <div className="pedido-recomendaciones">
                    <span>Recomendaciones:</span> 
                    <em>{pedido.recomendaciones}</em>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HistorialPedidos; 