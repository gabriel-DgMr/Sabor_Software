import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useCart } from '../context/useCart.js';
import { FormatPriceCOP } from '../utils/format.js';

import MensajeExito from './DialogoExito.jsx';

const ProductoCard = React.memo(({ producto }) => {
  const [productoExpandido, setProductoExpandido] = useState(false);
  const [exitoOpen, setExitoOpen] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const { addItemToCart } = useCart();
  const { t } = useTranslation();
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [peticion, setPeticion] = useState('');

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

  const handleConfirmarAgregar = () => {
    addItemToCart({
      nombre: producto.nombre_producto,
      precio: Number(producto.precio_producto),
      imagen: producto.imagen_producto,
      cantidad: Number(cantidad),
      peticion: peticion.trim()
    });
    setMensajeExito(t('producto_agregado', { nombre: producto.nombre_producto }));
    setExitoOpen(true);
    setDialogoAgregar(false);
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
          src={`http://localhost:3000/uploads/productos/${producto.imagen_producto}`}
        />
        <div className="productos__info">
          <h4 className="productos__nombre">{producto.nombre_producto}</h4>
          <p
            className={`productos__descripcion${productoExpandido ? ' expandida' : ''}`}
          >
            {producto.descripcion_producto}
          </p>
          <div className="productos__footer">
            <p className="productos__precio">{FormatPriceCOP(producto.precio_producto)}</p>
            <button className="btn-agregarpr" onClick={handleAgregar}>
              {t('agregar')}
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
      />
      {dialogoAgregar && ReactDOM.createPortal(
        <div className="dialogo-agregar-producto__overlay">
          <div className="dialogo-agregar-producto">
            <div className="dialogo-agregar-producto__contenido">
              <div className="dialogo-agregar-producto__izquierda">
                <img
                  src={`http://localhost:3000/uploads/productos/${producto.imagen_producto}`}
                  alt={producto.nombre_producto}
                  className="dialogo-agregar-producto__imagen"
                />
                <div className="dialogo-agregar-producto__info">
                  <h3 className="dialogo-agregar-producto__nombre">{producto.nombre_producto}</h3>
                  <p className="dialogo-agregar-producto__precio">{FormatPriceCOP(producto.precio_producto)}</p>
                </div>
              </div>
              <div className="dialogo-agregar-producto__derecha">
                <label className="dialogo-agregar-producto__label">
                  Unidades:
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ''))}
                    className="dialogo-agregar-producto__input"
                  />
                </label>
                <label className="dialogo-agregar-producto__label">
                  Petición especial:
                  <textarea
                    value={peticion}
                    onChange={e => setPeticion(e.target.value)}
                    className="dialogo-agregar-producto__textarea"
                    placeholder="¿Alguna petición especial para este producto?"
                  />
                </label>
                <div className="dialogo-agregar-producto__acciones">
                  <button className="dialogo-agregar-producto__boton dialogo-agregar-producto__boton--confirmar" onClick={handleConfirmarAgregar}>
                    Agregar
                  </button>
                  <button className="dialogo-agregar-producto__boton dialogo-agregar-producto__boton--cancelar" onClick={handleCancelarAgregar}>
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

export default ProductoCard; 