import React from 'react';
import PropTypes from 'prop-types';
import { getImageUrl } from '../../../shared/utils/imageUtils';

/**
 * ProductoItem - Componente de tarjeta de producto premium para el administrador.
 */
const ProductoItem = ({ producto, onEdit, onDelete, isEditing, isDeleting, admin = false }) => {
  const formatearPrecio = precio => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const agotado = producto.stock <= 0;

  return (
    <article
      className={`tarjeta-producto-admin ${agotado ? 'tarjeta-producto-admin--agotado' : ''}`}
    >
      <div className="tarjeta-producto-admin__imagen-wrap">
        <img
          alt={producto.nombre_producto}
          className="tarjeta-producto-admin__imagen"
          src={getImageUrl(producto.imagen_producto)}
        />
        <div className="tarjeta-producto-admin__badges">
          <span className="badge-sabor badge-sabor--categoria">
            {producto.nombre_categoria || 'General'}
          </span>
          <span
            className={`badge-sabor ${agotado ? 'badge-sabor--agotado' : 'badge-sabor--stock'}`}
          >
            {agotado ? 'Agotado' : `Stock: ${producto.stock}`}
          </span>
        </div>
      </div>

      <div className="tarjeta-producto-admin__cuerpo">
        <h3 className="tarjeta-producto-admin__nombre">{producto.nombre_producto}</h3>
        <p className="tarjeta-producto-admin__descripcion">
          {producto.descripcion_producto || 'Sin descripción disponible.'}
        </p>

        <div className="tarjeta-producto-admin__footer">
          <span className="tarjeta-producto-admin__precio">
            {formatearPrecio(producto.precio_producto)}
          </span>
          {admin && (
            <div className="tarjeta-producto-admin__acciones">
              <button
                className="boton-accion-admin boton-accion-admin--editar"
                disabled={isEditing}
                title="Editar producto"
                onClick={() => onEdit(producto)}
              >
                {isEditing ? '...' : '✎'}
              </button>
              <button
                className="boton-accion-admin boton-accion-admin--eliminar"
                disabled={isDeleting}
                title="Eliminar producto"
                onClick={() => onDelete(producto.id_producto)}
              >
                {isDeleting ? '...' : '🗑'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

ProductoItem.propTypes = {
  producto: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isDeleting: PropTypes.bool,
  isEditing: PropTypes.bool,
  admin: PropTypes.bool,
};

export default ProductoItem;
