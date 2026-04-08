import React from 'react';
import PropTypes from 'prop-types';
import CarritoItem from './CarritoItem';
import { IoBagHandleOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * CarritoLista - Contenedor de items del carrito con su encabezado.
 * BEM: .carrito-seccion
 */
const CarritoLista = ({ items, onUpdateQuantity, onRemoveItem, onUpdateMessage, t }) => {
  useGSAP(() => {
    if (items.length === 0) {
      const tl = gsap.timeline();
      tl.fromTo(
        '.carrito-vacio-premium__icono',
        { scale: 0, opacity: 0, rotate: -20 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }
      )
        .fromTo(
          '.carrito-vacio-premium__titulo',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.4'
        )
        .fromTo(
          '.carrito-vacio-premium__texto',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3'
        )
        .fromTo(
          '.carrito-vacio-premium__boton',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        );
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="carrito-vacio-premium">
        <div className="carrito-vacio-premium__ilustracion">
          <IoBagHandleOutline className="carrito-vacio-premium__icono" />
          <div className="carrito-vacio-premium__decoracion"></div>
        </div>
        <h2 className="carrito-vacio-premium__titulo">
          {t('carrito_vacio_titulo') || '¡Tu carrito está esperando!'}
        </h2>
        <p className="carrito-vacio-premium__texto">
          {t('carrito_vacio_descripcion') ||
            'Parece que aún no has añadido ninguna de nuestras delicias. ¡Explora el menú y descubre tu próximo plato favorito!'}
        </p>
        <Link to="/productos" className="boton boton--primario carrito-vacio-premium__boton">
          {t('carrito_ir_al_menu') || 'Explorar Nuestro Menú'}
        </Link>
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
            onUpdateMessage={onUpdateMessage}
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
  onUpdateMessage: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoLista;
