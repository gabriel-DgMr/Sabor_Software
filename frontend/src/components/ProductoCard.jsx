import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

import { useCart } from '../context/useCart.js';
import { FormatPriceCOP } from '../utils/format.js';
import { getImageUrl } from '../utils/imageUtils.js';

import MensajeExito from './DialogoExito.jsx';
import { GoCheck, GoX } from 'react-icons/go';

const ProductoCard = React.memo(({ producto }) => {
  const [productoExpandido, setProductoExpandido] = useState(false);
  const [exitoOpen, setExitoOpen] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const { addItemToCart } = useCart();
  const { t } = useTranslation();
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [peticion, setPeticion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setProductoExpandido(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setProductoExpandido(false);
  }, []);

  const handleAgregar = useCallback(() => {
    setDialogoAgregar(true);
    setCantidad(1);
    setPeticion('');
  }, []);

  const handleConfirmarAgregar = async () => {
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
      setMensajeExito(t('producto_agregado', { nombre: producto.nombre_producto }));
      setExitoOpen(true);
      setDialogoAgregar(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setMensajeError(error.message || 'Error al agregar producto al carrito');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarAgregar = () => {
    setDialogoAgregar(false);
  };

  return (
    <>
      <div
        className="productos__card-producto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          alt={producto.nombre_producto}
          className="productos__imagen"
          src={getImageUrl(producto.imagen_producto)}
        />
        <div className="productos__info">
          <h4 className="productos__nombre">{producto.nombre_producto}</h4>
          {/* Calificación en estrellas */}
          <div className="productos__calificacion">
            {(() => {
              const estrellas = [];
              const calificacion = Number(producto.calificacion) || 0;
              for (let i = 1; i <= 5; i++) {
                if (calificacion >= i) {
                  estrellas.push(
                    <FaStar key={i} className="productos__estrella productos__estrella--llena" />
                  );
                } else if (calificacion >= i - 0.5) {
                  estrellas.push(
                    <FaStarHalfAlt
                      key={i}
                      className="productos__estrella productos__estrella--media"
                    />
                  );
                } else {
                  estrellas.push(
                    <FaRegStar key={i} className="productos__estrella productos__estrella--vacia" />
                  );
                }
              }
              return estrellas;
            })()}
            <span className="productos__calificacion-num">
              {!isNaN(Number(producto.calificacion))
                ? Number(producto.calificacion).toFixed(1)
                : '0.0'}
            </span>
          </div>
          <p className={`productos__descripcion${productoExpandido ? ' expandida' : ''}`}>
            {producto.descripcion_producto}
          </p>
          <div className="productos__footer">
            <p className="productos__precio">{FormatPriceCOP(producto.precio_producto)}</p>
            <button className="btn-agregarpr" onClick={handleAgregar} disabled={loading}>
              {loading ? 'Agregando...' : t('agregar')}
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo de éxito */}
      <MensajeExito
        duration={2000}
        message={mensajeExito}
        open={exitoOpen}
        onClose={() => setExitoOpen(false)}
        icon={<GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />}
      />

      {/* Diálogo de error */}
      <MensajeExito
        duration={3000}
        message={mensajeError}
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        icon={<GoX className="GoX" style={{ fontSize: '2.5rem' }} />}
      />

      {dialogoAgregar &&
        ReactDOM.createPortal(
          <div className="dialogo-agregar-producto__overlay">
            <div className="dialogo-agregar-producto">
              <div className="dialogo-agregar-producto__contenido">
                <div className="dialogo-agregar-producto__izquierda">
                  <img
                    alt={producto.nombre_producto}
                    className="dialogo-agregar-producto__imagen"
                    src={getImageUrl(producto.imagen_producto)}
                  />
                  <div className="dialogo-agregar-producto__info">
                    <h3 className="dialogo-agregar-producto__nombre">{producto.nombre_producto}</h3>
                    <p className="dialogo-agregar-producto__precio">
                      {FormatPriceCOP(producto.precio_producto)}
                    </p>
                  </div>
                </div>
                <div className="dialogo-agregar-producto__derecha">
                  <label className="dialogo-agregar-producto__label">
                    Unidades:
                    <input
                      className="dialogo-agregar-producto__input"
                      min="1"
                      type="number"
                      value={cantidad}
                      onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={loading}
                    />
                  </label>
                  <label className="dialogo-agregar-producto__label">
                    Petición especial:
                    <textarea
                      className="dialogo-agregar-producto__textarea"
                      placeholder="¿Alguna petición especial para este producto?"
                      value={peticion}
                      onChange={e => setPeticion(e.target.value)}
                      disabled={loading}
                    />
                  </label>
                  <div className="dialogo-agregar-producto__acciones">
                    <button
                      className="dialogo-agregar-producto__boton dialogo-agregar-producto__boton--confirmar"
                      onClick={handleConfirmarAgregar}
                      disabled={loading}
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
                    </button>
                    <button
                      className="dialogo-agregar-producto__boton dialogo-agregar-producto__boton--cancelar"
                      onClick={handleCancelarAgregar}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

ProductoCard.displayName = 'ProductoCard';

ProductoCard.propTypes = {
  producto: PropTypes.shape({
    nombre_producto: PropTypes.string.isRequired,
    precio_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imagen_producto: PropTypes.string.isRequired,
    calificacion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    descripcion_producto: PropTypes.string,
  }).isRequired,
};

export default ProductoCard;
