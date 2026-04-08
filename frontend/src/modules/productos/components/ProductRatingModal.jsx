import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import StarRating from '../../../shared/components/StarRating';
import '../styles/productRatingModal.css';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';
import { formatearFecha } from '../../../shared/utils/format.js';

const ProductRatingModal = ({
  isOpen,
  onClose,
  producto,
  pedido,
  calificacionActual,
  onSubmit,
}) => {
  const [rating, setRating] = useState(calificacionActual?.calificacion || 0);
  const [comentario, setComentario] = useState(calificacionActual?.comentario || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        productoId: producto.id_producto,
        pedidoId: pedido.id_pedido,
        calificacion: rating,
        comentario: comentario.trim() || null,
      });

      onClose();
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      alert('Error al enviar la calificación. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      <div className="rating-modal" onClick={e => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h3>Calificar Producto</h3>
          <button className="close-button" onClick={handleClose} disabled={isSubmitting}>
            <FaTimes />
          </button>
        </div>

        <div className="rating-modal-content">
          <div className="product-info">
            <img
              src={getImageUrl(producto.imagen_producto)}
              alt={producto.nombre_producto}
              className="product-image"
            />
            <div className="product-details">
              <h4>{producto.nombre_producto}</h4>
              <p className="pedido-info">Pedido del {formatearFecha(pedido.fecha_pedido)}</p>
              <p className="cantidad-info">
                Cantidad: {producto.cantidad} × ${producto.precio_unitario?.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rating-form">
            <div className="rating-section">
              <label>Tu calificación:</label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                readonly={false}
                size={30}
                showNumber={false}
              />
              <span className="rating-text">
                {rating === 0 && 'Selecciona tu calificación'}
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </span>
            </div>

            <div className="comment-section">
              <label htmlFor="comentario">Comentario (opcional):</label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Comparte tu experiencia con este producto..."
                maxLength={500}
                rows={4}
                disabled={isSubmitting}
              />
              <div className="character-count">{comentario.length}/500</div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Enviando...' : calificacionActual ? 'Actualizar' : 'Enviar'}{' '}
                Calificación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductRatingModal;
