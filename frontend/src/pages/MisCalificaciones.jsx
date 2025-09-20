import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import ProductRatingModal from '../components/ProductRatingModal';
import LoadingScreen from '../components/LoadingScreen';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/misCalificaciones.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const MisCalificaciones = () => {
  const { user, isAuthenticated } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Sabor: Mis Calificaciones';
    if (isAuthenticated) {
      fetchProductosParaCalificar();
    }
  }, [isAuthenticated]);

  const fetchProductosParaCalificar = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/calificaciones/mis-productos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar productos para calificar');
      }

      const data = await response.json();
      setPedidos(data.pedidos || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRateProduct = (producto, pedido) => {
    setSelectedProduct(producto);
    setSelectedOrder(pedido);
    setIsModalOpen(true);
  };

  const handleSubmitRating = async ratingData => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/calificaciones`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al enviar calificación');
      }

      // Actualizar la lista después de calificar
      await fetchProductosParaCalificar();

      alert('¡Calificación enviada exitosamente!');
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      throw error;
    }
  };

  const handleDeleteRating = async calificacionId => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta calificación?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/calificaciones/${calificacionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al eliminar calificación');
      }

      // Actualizar la lista después de eliminar
      await fetchProductosParaCalificar();

      alert('Calificación eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar calificación:', error);
      alert('Error al eliminar la calificación: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <div className="auth-required">
          <p>Debes iniciar sesión para ver tus calificaciones</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <LoadingScreen />
        <Footer />
      </div>
    );
  }

  return (
    <div className="mis-calificaciones-page">
      <Header />

      <main className="mis-calificaciones-main">
        <div className="container">
          <h1>Mis Calificaciones</h1>
          <p className="subtitle">Califica los productos de tus pedidos completados</p>

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={fetchProductosParaCalificar}>Reintentar</button>
            </div>
          )}

          {pedidos.length === 0 ? (
            <div className="no-orders">
              <p>No tienes pedidos completados para calificar</p>
              <p>¡Haz tu primer pedido para poder calificar nuestros productos!</p>
            </div>
          ) : (
            <div className="orders-list">
              {pedidos.map(pedido => (
                <div key={pedido.id_pedido} className="order-card">
                  <div className="order-header">
                    <h3>Pedido #{pedido.id_pedido}</h3>
                    <span className="order-date">
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="products-grid">
                    {pedido.productos.map(producto => (
                      <div key={producto.id_producto} className="product-rating-card">
                        <div className="product-info">
                          <img
                            src={getImageUrl(producto.imagen_producto)}
                            alt={producto.nombre_producto}
                            className="product-image"
                          />
                          <div className="product-details">
                            <h4>{producto.nombre_producto}</h4>
                            <p className="quantity">Cantidad: {producto.cantidad}</p>
                            <p className="price">
                              ${producto.precio_unitario?.toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>

                        <div className="rating-section">
                          {producto.ya_calificado ? (
                            <div className="existing-rating">
                              <StarRating
                                rating={producto.calificacion_actual}
                                readonly={true}
                                size={18}
                                showNumber={true}
                              />
                              {producto.comentario_actual && (
                                <p className="comment">"{producto.comentario_actual}"</p>
                              )}
                              <div className="rating-actions">
                                <button
                                  className="edit-rating-btn"
                                  onClick={() => handleRateProduct(producto, pedido)}
                                  title="Editar calificación"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="delete-rating-btn"
                                  onClick={() => handleDeleteRating(producto.id_calificacion)}
                                  title="Eliminar calificación"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="no-rating">
                              <p>Sin calificar</p>
                              <button
                                className="rate-btn"
                                onClick={() => handleRateProduct(producto, pedido)}
                              >
                                Calificar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ProductRatingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setSelectedOrder(null);
        }}
        producto={selectedProduct}
        pedido={selectedOrder}
        calificacionActual={
          selectedProduct?.ya_calificado
            ? {
                calificacion: selectedProduct.calificacion_actual,
                comentario: selectedProduct.comentario_actual,
              }
            : null
        }
        onSubmit={handleSubmitRating}
      />

      <Footer />
    </div>
  );
};

export default MisCalificaciones;
