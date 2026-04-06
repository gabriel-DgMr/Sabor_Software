import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FaStar, FaStarHalfAlt, FaRegStar, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { getImageUrl } from '../../../shared/utils/imageUtils.js';
import { FormatPriceCOP } from '../../../shared/utils/format.js';
import { useCart } from '../../pedidos/hooks/useCart.js';

import '../styles/modal-detalle-producto.css';

const ModalDetalleProducto = ({ isOpen, onClose, producto }) => {
  const { t } = useTranslation();
  const { addItemToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [peticion, setPeticion] = useState('');
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const tarjetaRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // GSAP Animaciones
  useGSAP(
    () => {
      if (isOpen) {
        // Entrada
        gsap.set(modalRef.current, { visibility: 'visible' });
        gsap.to(modalRef.current, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          tarjetaRef.current,
          { y: 50, scale: 0.9, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.8)', delay: 0.1 }
        );
        // Animación de los elementos internos
        gsap.fromTo(
          '.modal-detalle__info-lado > *',
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
        );
      } else {
        // Salida
        gsap.to(tarjetaRef.current, {
          y: 30,
          scale: 0.95,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
        gsap.to(modalRef.current, {
          opacity: 0,
          duration: 0.3,
          delay: 0.1,
          onComplete: () => {
            gsap.set(modalRef.current, { visibility: 'hidden' });
          },
        });
      }
    },
    { dependencies: [isOpen], scope: modalRef }
  );

  const handleCerrar = useCallback(() => {
    onClose();
    // Resetear estados al cerrar
    setTimeout(() => {
      setCantidad(1);
      setPeticion('');
    }, 300);
  }, [onClose]);

  const incrementarCantidad = () => setCantidad(prev => prev + 1);
  const decrementarCantidad = () => setCantidad(prev => Math.max(1, prev - 1));

  const handleAgregar = async () => {
    if (!producto) return;

    try {
      setLoading(true);
      await addItemToCart({
        id: producto.id_producto,
        id_producto: producto.id_producto,
        nombre: producto.nombre_producto,
        nombre_producto: producto.nombre_producto,
        precio: Number(producto.precio_producto),
        precio_unitario: Number(producto.precio_producto),
        imagen: producto.imagen_producto,
        imagen_producto: producto.imagen_producto,
        cantidad: Number(cantidad),
        peticion: peticion.trim(),
      });
      handleCerrar();
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!producto) return null;

  const renderEstrellas = () => {
    const estrellas = [];
    const calificacion = Number(producto.calificacion_promedio ?? producto.calificacion) || 0;
    for (let i = 1; i <= 5; i++) {
      if (calificacion >= i) {
        estrellas.push(<FaStar key={i} style={{ color: 'var(--naranja-sabor)' }} />);
      } else if (calificacion >= i - 0.5) {
        estrellas.push(<FaStarHalfAlt key={i} style={{ color: 'var(--naranja-sabor)' }} />);
      } else {
        estrellas.push(<FaRegStar key={i} style={{ color: 'var(--neutral-300)' }} />);
      }
    }
    return estrellas;
  };

  return ReactDOM.createPortal(
    <div className="modal-detalle" ref={modalRef}>
      <div className="modal-detalle__capa" onClick={handleCerrar}></div>

      <div className="modal-detalle__tarjeta" ref={tarjetaRef}>
        <button className="modal-detalle__cerrar" onClick={handleCerrar} aria-label="Cerrar">
          <FaTimes />
        </button>

        <div className="modal-detalle__cuerpo">
          <div className="modal-detalle__imagen-lado">
            <img
              src={getImageUrl(producto.imagen_producto)}
              alt={producto.nombre_producto}
              className="modal-detalle__imagen"
            />
          </div>

          <div className="modal-detalle__info-lado" ref={contentRef}>
            <h2 className="modal-detalle__nombre">{producto.nombre_producto}</h2>

            <div
              className="modal-detalle__calificacion"
              title={`${Number(producto.calificacion_promedio || 0).toFixed(1)} estrellas`}
            >
              {renderEstrellas()}
              <span
                style={{ fontSize: '1.4rem', color: 'var(--neutral-500)', marginLeft: '0.5rem' }}
              >
                ({producto.total_calificaciones || 0})
              </span>
            </div>

            <p className="modal-detalle__precio">{FormatPriceCOP(producto.precio_producto)}</p>

            <p className="modal-detalle__descripcion">
              {producto.descripcion_producto || producto.descripcion}
            </p>

            <div className="modal-detalle__footer">
              <div className="modal-detalle__controles">
                <div className="modal-detalle__selector-cantidad">
                  <button className="modal-detalle__boton-cantidad" onClick={decrementarCantidad}>
                    <FaMinus />
                  </button>
                  <input
                    type="text"
                    className="modal-detalle__input-cantidad"
                    value={cantidad}
                    readOnly
                  />
                  <button className="modal-detalle__boton-cantidad" onClick={incrementarCantidad}>
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className="modal-detalle__peticion">
                <label className="modal-detalle__label">{t('dialog.specialRequest')}</label>
                <textarea
                  className="modal-detalle__textarea"
                  placeholder={t('dialog.specialRequestPlaceholder')}
                  value={peticion}
                  onChange={e => setPeticion(e.target.value)}
                ></textarea>
              </div>

              <button
                className="boton-moderno boton-moderno--primario modal-detalle__boton-agregar"
                onClick={handleAgregar}
                disabled={loading}
              >
                {loading ? t('dialog.adding') : t('dialog.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

ModalDetalleProducto.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  producto: PropTypes.object,
};

export default ModalDetalleProducto;
