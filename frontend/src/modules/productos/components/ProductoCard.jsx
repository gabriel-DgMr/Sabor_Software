import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

import { useCart } from '../../pedidos/hooks/useCart.js';
import { FormatPriceCOP } from '../../../shared/utils/format.js';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';

import MensajeExito from '../../../shared/components/DialogoExito.jsx';
import ModalDetalleProducto from './ModalDetalleProducto.jsx';
import { GoCheck, GoX } from 'react-icons/go';
import '../../../shared/styles/iconos.css';

const ProductoCard = React.memo(({ producto }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [exitoOpen, setExitoOpen] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const { addItemToCart } = useCart();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleAbrirModal = useCallback(() => {
    setModalAbierto(true);
  }, []);

  const handleCerrarModal = useCallback(() => {
    setModalAbierto(false);
  }, []);

  const handleAgregarRapido = async e => {
    e.stopPropagation();
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
        cantidad: 1,
        peticion: '',
      });
      setMensajeExito(t('producto_agregado', { nombre: producto.nombre_producto }));
      setExitoOpen(true);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setMensajeError(error.message || 'Error al agregar producto al carrito');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="tarjeta-producto" onClick={handleAbrirModal}>
        <div className="tarjeta-producto__imagen-contenedor">
          <img
            alt={producto.nombre_producto}
            className="tarjeta-producto__imagen"
            src={getImageUrl(producto.imagen_producto)}
          />
        </div>
        <div className="tarjeta-producto__contenido">
          <h4 className="tarjeta-producto__nombre">{producto.nombre_producto}</h4>

          <div
            className="productos__calificacion"
            style={{ justifyContent: 'center', marginBottom: '1rem' }}
            title={`Calificación promedio: ${Number(
              producto.calificacion_promedio ?? producto.calificacion ?? 0
            ).toFixed(1)} (${Number(producto.total_calificaciones ?? 0)} opiniones)`}
          >
            {(() => {
              const estrellas = [];
              const calificacion =
                Number(producto.calificacion_promedio ?? producto.calificacion) || 0;
              for (let i = 1; i <= 5; i++) {
                if (calificacion >= i) {
                  estrellas.push(
                    <FaStar
                      key={i}
                      className="productos__estrella productos__estrella--llena"
                      style={{ color: 'var(--naranja-sabor)' }}
                    />
                  );
                } else if (calificacion >= i - 0.5) {
                  estrellas.push(
                    <FaStarHalfAlt
                      key={i}
                      className="productos__estrella productos__estrella--media"
                      style={{ color: 'var(--naranja-sabor)' }}
                    />
                  );
                } else {
                  estrellas.push(
                    <FaRegStar
                      key={i}
                      className="productos__estrella productos__estrella--vacia"
                      style={{ color: 'var(--neutral-300)' }}
                    />
                  );
                }
              }
              return estrellas;
            })()}
          </div>

          <p className="tarjeta-producto__descripcion">{producto.descripcion_producto}</p>

          <button
            className="productos__toggle-boton"
            style={{
              color: 'var(--naranja-sabor)',
              fontWeight: 600,
              fontSize: '1.2rem',
              marginBottom: '1rem',
            }}
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleAbrirModal();
            }}
          >
            {t('ver_mas')}
          </button>

          <div className="tarjeta-producto__footer">
            <p className="tarjeta-producto__precio">{FormatPriceCOP(producto.precio_producto)}</p>
            <button
              className="boton-moderno boton-moderno--primario"
              onClick={handleAgregarRapido}
              disabled={loading}
              style={{ padding: '0.8rem 1.6rem', fontSize: '1.4rem' }}
            >
              {loading ? '...' : t('agregar')}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      <ModalDetalleProducto isOpen={modalAbierto} onClose={handleCerrarModal} producto={producto} />

      {/* Diálogo de éxito */}
      <MensajeExito
        duration={2000}
        message={mensajeExito}
        open={exitoOpen}
        onClose={() => setExitoOpen(false)}
        icon={<GoCheck className="icono icono--exito icono--grande" />}
      />

      {/* Diálogo de error */}
      <MensajeExito
        duration={3000}
        message={mensajeError}
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        icon={<GoX className="icono icono--error icono--grande" />}
      />
    </>
  );
});

ProductoCard.displayName = 'ProductoCard';

ProductoCard.propTypes = {
  producto: PropTypes.shape({
    id_producto: PropTypes.number.isRequired,
    nombre_producto: PropTypes.string.isRequired,
    precio_producto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imagen_producto: PropTypes.string.isRequired,
    calificacion_promedio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    calificacion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_calificaciones: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    descripcion_producto: PropTypes.string,
  }).isRequired,
};

export default ProductoCard;
