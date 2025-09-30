import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import StarRating from './StarRating';
import PropTypes from 'prop-types';
import { getImageUrl } from '../utils/imageUtils.js';

const RatingModal = ({
  isOpen,
  onClose,
  producto,
  pedidoId,
  initialRating = 0,
  initialComment = '',
  onSubmit,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setError('');
    }
  }, [isOpen, initialRating, initialComment]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        productoId: producto.id_producto,
        pedidoId,
        calificacion: rating,
        comentario: comment.trim() || null,
      });

      // Cerrar modal después de envío exitoso
      onClose();
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      setError(error.message || 'Error al enviar la calificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="rating-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="rating-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #eee',
          }}
        >
          <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Calificar Producto</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
            }}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Product Info */}
        <div
          className="product-info"
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          {producto.imagen_producto && (
            <img
              src={getImageUrl(producto.imagen_producto)}
              alt={producto.nombre_producto}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{producto.nombre_producto}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              Cantidad: {producto.cantidad} | Precio: ${producto.precio_unitario?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="rating-section" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '1.1rem',
                fontWeight: '500',
                color: '#333',
              }}
            >
              ¿Cómo calificarías este producto?
            </label>
            <StarRating
              rating={rating}
              interactive={true}
              size={32}
              onRatingChange={setRating}
              showValue={true}
            />
          </div>

          {/* Comment */}
          <div className="comment-section" style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#333',
              }}
            >
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con este producto..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              maxLength={500}
              disabled={loading}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              {comment.length}/500 caracteres
            </small>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div
            className="modal-buttons"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#666',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: rating === 0 ? '#ccc' : '#007bff',
                color: 'white',
                borderRadius: '6px',
                cursor: loading || rating === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? <FaSpinner className="fa-spin" /> : <FaCheck />}
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  producto: PropTypes.object.isRequired,
  pedidoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialRating: PropTypes.number,
  initialComment: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default RatingModal;
