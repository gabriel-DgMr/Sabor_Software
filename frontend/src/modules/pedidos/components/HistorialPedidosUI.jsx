import React from 'react';
import PropTypes from 'prop-types';
import '../styles/historialPedidos.css';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import StarRating from '../../../shared/components/StarRating.jsx';
import RatingModal from '../../productos/components/RatingModal.jsx';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';
import { formatearFecha, formatearHora } from '../../../shared/utils/format.js';

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
      <div className="historial-pedidos">
        <Header />
        <div className="historial-pedidos__contenedor">
          <div className="historial-pedidos__titulo">
            <h2>Cargando historial...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-pedidos">
        <Header />
        <div className="historial-pedidos__contenedor">
          <div className="historial-pedidos__titulo">
            <h2>Error al cargar</h2>
          </div>
          <div className="historial-vacio">
            <div className="historial-vacio__icono">⚠️</div>
            <p className="historial-vacio__texto">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="historial-pedidos">
      <Header />
      <div className="historial-pedidos__contenedor">
        <div className="historial-pedidos__titulo">
          <h2>Mi Historial de Pedidos</h2>
        </div>

        {pedidos.length === 0 ? (
          <div className="historial-vacio">
            <div className="historial-vacio__icono">🍽️</div>
            <p className="historial-vacio__texto">No tienes pedidos registrados todavía.</p>
            <p className="historial-vacio__subtexto">¡Haz tu primer pedido y aparecerá aquí!</p>
          </div>
        ) : (
          pedidos.map(pedido => (
            <article className="pedido-tarjeta" key={pedido.id}>
              <header className="pedido-tarjeta__cabecera">
                <div className="pedido-tarjeta__fecha">
                  <span className="pedido-tarjeta__fecha-texto">
                    {formatearFecha(pedido.createdAt)}
                  </span>
                  <span className="pedido-tarjeta__fecha-subtexto">
                    {formatearHora(pedido.createdAt)}
                  </span>
                </div>
                <div
                  className={`pedido-tarjeta__estado pedido-tarjeta__estado--${pedido.estado?.toLowerCase() || 'pendiente'}`}
                >
                  {pedido.estado || 'Pendiente'}
                </div>
              </header>

              <div className="pedido-tarjeta__cuerpo">
                <section className="pedido-tarjeta__productos">
                  <h4 className="pedido-tarjeta__subtitle">Productos</h4>
                  <ul className="pedido-tarjeta__lista">
                    {(pedido.items || []).map((item, idx) => (
                      <li key={idx} className="pedido-tarjeta__item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <aside className="pedido-tarjeta__resumen">
                  <div className="pedido-tarjeta__total-line">
                    <span className="pedido-tarjeta__total-label">Inversión total</span>
                    <span className="pedido-tarjeta__total-valor">
                      ${pedido.total?.toLocaleString('es-CO') || '0'}
                    </span>
                  </div>
                </aside>
              </div>

              {pedido.recomendaciones && (
                <div className="pedido-tarjeta__recomendaciones">
                  <strong>Nota:</strong> {pedido.recomendaciones}
                </div>
              )}

              {pedido.estado?.toLowerCase() === 'completado' && (
                <div className="pedido-tarjeta__calificaciones">
                  <button
                    className="pedido-tarjeta__btn-calificar"
                    onClick={() => toggleProductosCalificables(pedido.id)}
                  >
                    ⭐ Calificar experiencia con estos productos
                  </button>

                  {productosParaCalificar[pedido.id] && (
                    <div className="productos-calificar">
                      <h5 className="pedido-tarjeta__subtitle">¿Qué te parecieron?</h5>
                      <div className="productos-calificar__grid">
                        {productosParaCalificar[pedido.id].map(producto => (
                          <div key={producto.id_producto} className="producto-fila">
                            <div className="producto-fila__info">
                              {producto.imagen_producto && (
                                <img
                                  src={getImageUrl(producto.imagen_producto)}
                                  alt={producto.nombre_producto}
                                  className="producto-fila__image"
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                  }}
                                />
                              )}
                              <div className="producto-fila__detalles">
                                <span className="producto-fila__nombre">
                                  {producto.nombre_producto}
                                </span>
                                <span className="producto-fila__meta">
                                  Cantidad: {producto.cantidad}
                                </span>
                              </div>
                            </div>

                            <div className="producto-fila__acciones">
                              {producto.ya_calificado ? (
                                <>
                                  <StarRating rating={producto.calificacion_actual} size={16} />
                                  <button
                                    className="btn-calificar-p btn-calificar-p--editar"
                                    onClick={() => openRatingModal(producto, pedido.id)}
                                  >
                                    Editar
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn-calificar-p btn-calificar-p--nuevo"
                                  onClick={() => openRatingModal(producto, pedido.id)}
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
            </article>
          ))
        )}
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
