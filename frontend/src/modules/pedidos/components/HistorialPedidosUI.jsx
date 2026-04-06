import React from 'react';
import PropTypes from 'prop-types';
import '../styles/historialPedidos.css';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import StarRating from '../../../shared/components/StarRating.jsx';
import RatingModal from '../../productos/components/RatingModal.jsx';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';

const HistorialPedidosUI = ({
  pedidos,
  loading,
  error,
  ratingModal,
  productosParaCalificar,
  openRatingModal,
  closeRatingModal,
  handleSubmitRating,
  toggleProductosCalificables,
}) => {
  if (loading) {
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
  }

  if (error) {
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
  }

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
                                    src={getImageUrl(producto.imagen_producto)}
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

HistorialPedidosUI.propTypes = {
  pedidos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  ratingModal: PropTypes.object.isRequired,
  productosParaCalificar: PropTypes.object.isRequired,
  openRatingModal: PropTypes.func.isRequired,
  closeRatingModal: PropTypes.func.isRequired,
  handleSubmitRating: PropTypes.func.isRequired,
  toggleProductosCalificables: PropTypes.func.isRequired,
};

export default HistorialPedidosUI;
