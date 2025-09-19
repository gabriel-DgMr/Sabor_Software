import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/historialPedidos.css';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import StarRating from '../components/StarRating.jsx';
import RatingModal from '../components/RatingModal.jsx';

const HistorialPedidos = () => {
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
    };
    fetchPedidos();
  }, []);

  // Función para obtener productos que se pueden calificar de un pedido
  const fetchProductosParaCalificar = async pedidoId => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await axios.get(`${apiUrl}/calificaciones/pedido/${pedidoId}/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProductosParaCalificar(prev => ({
        ...prev,
        [pedidoId]: res.data.productos,
      }));
    } catch (err) {
      console.error('Error al cargar productos para calificar:', err);
    }
  };

  // Función para abrir modal de calificación
  const openRatingModal = (producto, pedidoId) => {
    setRatingModal({
      isOpen: true,
      producto,
      pedidoId,
      initialRating: producto.calificacion_actual || 0,
      initialComment: producto.comentario_actual || '',
    });
  };

  // Función para cerrar modal de calificación
  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      producto: null,
      pedidoId: null,
      initialRating: 0,
      initialComment: '',
    });
  };

  // Función para enviar calificación
  const handleSubmitRating = async ratingData => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      await axios.post(`${apiUrl}/calificaciones`, ratingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Actualizar productos para calificar
      await fetchProductosParaCalificar(ratingData.pedidoId);

      console.log('Calificación enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      throw error;
    }
  };

  // Función para mostrar productos calificables cuando se expande un pedido
  const toggleProductosCalificables = pedidoId => {
    if (!productosParaCalificar[pedidoId]) {
      fetchProductosParaCalificar(pedidoId);
    }
  };

  if (loading)
    return (
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

  if (error)
    return (
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
            pedidos.map(pedido => (
              <div className="pedido-tarjeta" key={pedido._id}>
                <div className="pedido-tarjeta-header">
                  <span className="pedido-fecha">
                    {new Date(pedido.createdAt).toLocaleString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
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

                {/* Sección de calificaciones */}
                {pedido.estado?.toLowerCase() === 'completado' && (
                  <div className="pedido-calificaciones">
                    <button
                      className="btn-calificar"
                      onClick={() => toggleProductosCalificables(pedido._id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginTop: '12px',
                      }}
                    >
                      ⭐ Calificar Productos
                    </button>

                    {productosParaCalificar[pedido._id] && (
                      <div className="productos-calificables" style={{ marginTop: '16px' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#333' }}>
                          Productos de este pedido:
                        </h5>
                        <div
                          className="productos-grid"
                          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                        >
                          {productosParaCalificar[pedido._id].map(producto => (
                            <div
                              key={producto.id_producto}
                              className="producto-calificable"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                              }}
                            >
                              <div
                                className="producto-info"
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                              >
                                {producto.imagen_producto && (
                                  <img
                                    src={`http://localhost:3000${producto.imagen_producto}`}
                                    alt={producto.nombre_producto}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                    }}
                                  />
                                )}
                                <div>
                                  <strong style={{ fontSize: '0.95rem' }}>
                                    {producto.nombre_producto}
                                  </strong>
                                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    Cantidad: {producto.cantidad}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="producto-rating"
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                              >
                                {producto.ya_calificado ? (
                                  <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <StarRating rating={producto.calificacion_actual} size={16} />
                                    <button
                                      onClick={() => openRatingModal(producto, pedido._id)}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #007bff',
                                        color: '#007bff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      Editar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openRatingModal(producto, pedido._id)}
                                    style={{
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    Calificar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de calificación */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={closeRatingModal}
        producto={ratingModal.producto}
        pedidoId={ratingModal.pedidoId}
        initialRating={ratingModal.initialRating}
        initialComment={ratingModal.initialComment}
        onSubmit={handleSubmitRating}
      />

      <Footer />
    </div>
  );
};

export default HistorialPedidos;
