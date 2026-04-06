import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../shared/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import CarritoLista from './CarritoLista';
import CarritoResumen from './CarritoResumen';
import DialogoModal from '../../../shared/components/DialogoExito.jsx';
import { FaUtensils } from 'react-icons/fa6';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import '../styles/pedidos.css';
import '../styles/modal-mesa.css';

/**
 * CarritoUI - Vista principal del carrito de compras.
 * BEM: .seccion-carrito
 */
const CarritoUI = ({
  loading,
  error,
  setError,
  setLoading,
  cartItems,
  modal,
  setModal,
  mesaInput,
  setMesaInput,
  mesaModal,
  mesaError,
  setMesaError,
  obtenerMesaActual,
  cerrarMesaModal,
  confirmarMesaModal,
  solicitarMesa,
  limpiarMesa,
  procesarPago,
  handleEliminarCarrito,
  handlePagoEfectivo,
  handleUpdateQuantity,
  handleRemoveItem,
  t,
}) => {
  useGSAP(() => {
    if (mesaModal.open) {
      gsap.fromTo(
        '.modal-mesa-contenedor',
        {
          y: 30,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'expo.out',
        }
      );

      gsap.fromTo(
        '.modal-mesa__icono-contenedor',
        { scale: 0, rotation: -45 },
        { scale: 1, rotation: 0, duration: 0.8, delay: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, [mesaModal.open]);

  if (loading) {
    return (
      <div className="tablero">
        <Header />
        <main className="tablero__principal">
          <div className="cargando">
            <div className="spinner"></div>
            <p>{t('carrito_cargando') || 'Cargando carrito...'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tablero">
        <Header />
        <main className="tablero__principal">
          <div className="notificacion notificacion--error">
            <p>{error}</p>
            <button
              className="boton boton--secundario"
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              {t('carrito_reintentar')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalCarrito = cartItems.reduce(
    (sum, item) => sum + item.precio_unitario * (item.cantidad || 1),
    0
  );

  return (
    <div className="pagina-carrito">
      <Header />

      <main className="seccion-carrito">
        <div className="contenedor-carrito">
          <CarritoLista
            items={cartItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            t={t}
          />

          {cartItems.length > 0 && (
            <CarritoResumen
              mesa={obtenerMesaActual()}
              total={totalCarrito}
              onEliminarCarrito={handleEliminarCarrito}
              onLimpiarMesa={limpiarMesa}
              onPagoEfectivo={handlePagoEfectivo}
              onProcesarPago={procesarPago}
              onSolicitarMesa={() => solicitarMesa(null, { forcePrompt: true })}
              t={t}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Modales - Podrían ser atomizados en el futuro si crecen más */}
      <DialogoModal {...modal} onClose={() => setModal(m => ({ ...m, open: false }))}>
        {modal.children || modal.message}
      </DialogoModal>

      <DialogoModal open={mesaModal.open} onClose={cerrarMesaModal} className="dialogo-modal--mesa">
        <div className="modal-mesa-contenedor">
          <div className="modal-mesa__cabecera">
            <div className="modal-mesa__icono-contenedor">
              <FaUtensils />
            </div>
            <h3 className="modal-mesa__titulo">{t('carrito_mesa_titulo')}</h3>
            <p className="modal-mesa__descripcion">{t('carrito_mesa_desc')}</p>
          </div>

          <div className="modal-mesa__formulario">
            <div className="modal-mesa__campo">
              <input
                type="number"
                className={`modal-mesa__input ${mesaError ? 'modal-mesa__input--error' : ''}`}
                min="1"
                placeholder={t('carrito_mesa_placeholder')}
                value={mesaInput}
                autoFocus
                onChange={e => {
                  setMesaInput(e.target.value.replace(/[^0-9]/g, ''));
                  setMesaError('');
                }}
              />
              {mesaError && <span className="modal-mesa__mensaje-error">{mesaError}</span>}
            </div>

            <div className="modal-mesa__acciones">
              <button className="modal-mesa__boton-confirmar" onClick={confirmarMesaModal}>
                {t('carrito_mesa_guardar')}
              </button>
              <button className="modal-mesa__boton-cancelar" onClick={cerrarMesaModal}>
                {t('carrito_mesa_cancelar')}
              </button>
            </div>
          </div>
        </div>
      </DialogoModal>
    </div>
  );
};

CarritoUI.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  cartItems: PropTypes.array.isRequired,
  modal: PropTypes.object.isRequired,
  setModal: PropTypes.func.isRequired,
  mesaInput: PropTypes.string.isRequired,
  setMesaInput: PropTypes.func.isRequired,
  mesaModal: PropTypes.object.isRequired,
  mesaError: PropTypes.string,
  setMesaError: PropTypes.func.isRequired,
  obtenerMesaActual: PropTypes.func.isRequired,
  cerrarMesaModal: PropTypes.func.isRequired,
  confirmarMesaModal: PropTypes.func.isRequired,
  solicitarMesa: PropTypes.func.isRequired,
  limpiarMesa: PropTypes.func.isRequired,
  procesarPago: PropTypes.func.isRequired,
  handleEliminarCarrito: PropTypes.func.isRequired,
  handlePagoEfectivo: PropTypes.func.isRequired,
  handleUpdateQuantity: PropTypes.func.isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default CarritoUI;
