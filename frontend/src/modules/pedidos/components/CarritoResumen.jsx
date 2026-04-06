import React from 'react';
import PropTypes from 'prop-types';
import { GoTrash, GoCreditCard } from 'react-icons/go';
import { BsCash } from 'react-icons/bs';

/**
 * CarritoResumen - Panel lateral con totales y botones de acción.
 * BEM: .carrito-resumen
 */
const CarritoResumen = ({
  total,
  mesa,
  onSolicitarMesa,
  onLimpiarMesa,
  onEliminarCarrito,
  onPagoEfectivo,
  onProcesarPago,
  t,
}) => {
  return (
    <aside className="carrito-resumen">
      <h2 className="carrito-resumen__titulo">{t('carrito_detalles_compra')}</h2>

      <div className="carrito-resumen__seccion">
        <div className="info-mesa">
          <span className="info-mesa__label">{t('carrito_mesa_label')}</span>
          <span className="info-mesa__valor">{mesa || t('carrito_mesa_sin_asignar')}</span>
          <div className="info-mesa__acciones">
            <button className="boton-texto boton-texto--primario" onClick={onSolicitarMesa}>
              {t('carrito_mesa_cambiar')}
            </button>
            {mesa && (
              <button className="boton-texto boton-texto--peligro" onClick={onLimpiarMesa}>
                {t('carrito_mesa_eliminar')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="carrito-resumen__total">
        <span className="label">{t('carrito_total_pagar', 'Total a pagar')}</span>
        <span className="valor">${total.toLocaleString('es-CO')} COP</span>
      </div>

      <div className="carrito-resumen__actions">
        <button className="boton-moderno boton-moderno--blanco" onClick={onProcesarPago}>
          <GoCreditCard /> {t('pagar_payu', 'Pagar con PayU')}
        </button>
        <button className="boton-moderno boton-moderno--primario" onClick={onPagoEfectivo}>
          <BsCash /> {t('pago_efectivo', 'Pago en Efectivo')}
        </button>
        <button className="boton-texto boton-texto--centrado" onClick={onEliminarCarrito}>
          <GoTrash /> {t('carrito_eliminar')}
        </button>
      </div>
    </aside>
  );
};

CarritoResumen.propTypes = {
  total: PropTypes.number.isRequired,
  mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSolicitarMesa: PropTypes.func.isRequired,
  onLimpiarMesa: PropTypes.func.isRequired,
  onEliminarCarrito: PropTypes.func.isRequired,
  onPagoEfectivo: PropTypes.func.isRequired,
  onProcesarPago: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoResumen;
