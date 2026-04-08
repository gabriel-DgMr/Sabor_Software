import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GoTrash, GoPencil } from 'react-icons/go';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';
import ModalEditarMensaje from './ModalEditarMensaje.jsx';

/**
 * CarritoItem - Representación individual de un producto en el carrito.
 * BEM: .carrito-item
 */
const CarritoItem = ({ item, onUpdateQuantity, onRemoveItem, onUpdateMessage, t }) => {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
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
          <p className="carrito-item__precio">
            {Number(item.precio_unitario || 0).toLocaleString('es-CO')} COP
          </p>
          {(item.mensaje || item.peticion) && (
            <span className="carrito-item__peticion">📝 {item.mensaje || item.peticion}</span>
          )}
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

          <div className="carrito-item__acciones">
            <button
              className="boton-moderno boton-moderno--blanco"
              onClick={() => setModalAbierto(true)}
              title={t('carrito_editar_mensaje', 'Editar mensaje')}
              style={{ padding: '8px', minWidth: '40px' }}
            >
              <GoPencil />
            </button>
            <button
              className="boton-moderno boton-moderno--peligro"
              onClick={() => onRemoveItem(item.id_producto)}
              title={t('carrito_eliminar')}
              style={{ padding: '8px', minWidth: '40px' }}
            >
              <GoTrash />
            </button>
          </div>
        </div>
      </li>

      <ModalEditarMensaje
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        item={item}
        onSave={onUpdateMessage}
        t={t}
      />
    </>
  );
};

CarritoItem.propTypes = {
  item: PropTypes.object.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onUpdateMessage: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoItem;
