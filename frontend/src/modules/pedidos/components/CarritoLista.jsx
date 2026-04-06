import React from 'react';
import PropTypes from 'prop-types';
import CarritoItem from './CarritoItem';
import { IoCart } from 'react-icons/io5';

/**
 * CarritoLista - Contenedor de items del carrito con su encabezado.
 * BEM: .carrito-seccion
 */
const CarritoLista = ({ items, onUpdateQuantity, onRemoveItem, t }) => {
  if (items.length === 0) {
    return (
      <div className="estado-vacio">
        <IoCart className="estado-vacio__icono" />
        <p>{t('carrito_vacio')}</p>
      </div>
    );
  }

  return (
    <div className="carrito-seccion">
      <header className="carrito-seccion__encabezado">
        <h2 className="carrito-seccion__titulo">{t('carrito_pedido_actual')}</h2>
      </header>

      <ul className="carrito-lista">
        {items.map((item, index) => (
          <CarritoItem
            key={`${item.id_producto}-${index}`}
            item={item}
            onRemoveItem={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
            t={t}
          />
        ))}
      </ul>
    </div>
  );
};

CarritoLista.propTypes = {
  items: PropTypes.array.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoLista;
