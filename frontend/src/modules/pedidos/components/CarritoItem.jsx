import React from 'react';
import PropTypes from 'prop-types';
import { GoTrash } from 'react-icons/go';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';

/**
 * CarritoItem - Representación individual de un producto en el carrito.
 * BEM: .carrito-item
 */
const CarritoItem = ({ item, onUpdateQuantity, onRemoveItem, t }) => {
  const subtotal = item.precio_unitario * (item.cantidad || 1);

  return (
    <li className="carrito-item">
      {item.imagen_producto && (
        <img
          className="carrito-item__imagen"
          src={getImageUrl(item.imagen_producto)}
          alt={item.nombre_producto}
        />
      )}

      <div className="carrito-item__info">
        <h3 className="carrito-item__nombre">{item.nombre_producto}</h3>
        <p className="carrito-item__precio">{item.precio_unitario.toLocaleString('es-CO')} COP</p>
        {item.peticion && <span className="carrito-item__peticion">📝 {item.peticion}</span>}
      </div>

      <div className="carrito-item__controles">
        <div className="selector-cantidad">
          <button
            className="selector-cantidad__boton"
            onClick={() =>
              onUpdateQuantity(item.id_producto, Math.max(1, (item.cantidad || 1) - 1))
            }
          >
            -
          </button>
          <span className="selector-cantidad__valor">{item.cantidad || 1}</span>
          <button
            className="selector-cantidad__boton"
            onClick={() => onUpdateQuantity(item.id_producto, (item.cantidad || 1) + 1)}
          >
            +
          </button>
        </div>

        <button
          className="boton-moderno boton-moderno--peligro"
          onClick={() => onRemoveItem(item.id_producto)}
          title={t('carrito_eliminar')}
        >
          <GoTrash />
        </button>
      </div>
    </li>
  );
};

CarritoItem.propTypes = {
  item: PropTypes.object.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoItem;
