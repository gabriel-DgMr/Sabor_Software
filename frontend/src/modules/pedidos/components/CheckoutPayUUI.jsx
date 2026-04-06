import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../shared/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import LoadingScreen from '../../../shared/components/LoadingScreen.jsx';
import '../styles/pedidos.css';

/**
 * CheckoutPayUUI - Muestra el resultado de la transacción de PayU.
 * BEM: .tarjeta-resultado
 */
const CheckoutPayUUI = ({ loading, paymentInfo, handleContinue, handleGoHome }) => {
  if (loading) {
    return (
      <div className="tablero">
        <Header />
        <main className="seccion-checkout">
          <LoadingScreen />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pagina-checkout">
      <Header />

      <main className="seccion-checkout">
        <div className="tarjeta-resultado">
          <div className="tarjeta-resultado__icono" style={{ color: paymentInfo?.color }}>
            {paymentInfo?.icon}
          </div>

          <h1 className="tarjeta-resultado__titulo" style={{ color: paymentInfo?.color }}>
            Estado del Pago
          </h1>

          <p className="tarjeta-resultado__mensaje">{paymentInfo?.message}</p>

          {paymentInfo?.referenceCode && (
            <div className="tarjeta-resultado__info">
              <div className="tarjeta-resultado__dato">
                <strong>Referencia:</strong>
                <span>{paymentInfo.referenceCode}</span>
              </div>
              {paymentInfo.transactionId && (
                <div className="tarjeta-resultado__dato">
                  <strong>ID Transacción:</strong>
                  <span>{paymentInfo.transactionId}</span>
                </div>
              )}
              {paymentInfo.amount && (
                <div className="tarjeta-resultado__dato">
                  <strong>Monto:</strong>
                  <span>
                    ${parseFloat(paymentInfo.amount).toLocaleString('es-CO')} {paymentInfo.currency}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="tarjeta-resultado__acciones">
            <button className="boton boton--primario" onClick={handleContinue}>
              Volver al Carrito
            </button>
            <button className="boton boton--secundario" onClick={handleGoHome}>
              Ir al Inicio
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

CheckoutPayUUI.propTypes = {
  loading: PropTypes.bool.isRequired,
  paymentInfo: PropTypes.object,
  handleContinue: PropTypes.func.isRequired,
  handleGoHome: PropTypes.func.isRequired,
};

export default CheckoutPayUUI;
