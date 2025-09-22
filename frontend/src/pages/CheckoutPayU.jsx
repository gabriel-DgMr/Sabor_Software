import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoCheck, GoX, GoAlert } from 'react-icons/go';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

const CheckoutPayU = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    document.title = 'Sabor: Estado del Pago';

    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const transactionState = params.get('transactionState');
    const responseCodePol = params.get('responseCodePol');
    const referenceCode = params.get('referenceCode');
    const reference_pol = params.get('reference_pol');
    const signature = params.get('signature');
    const polTransactionState = params.get('polTransactionState');
    const polResponseCode = params.get('polResponseCode');
    const merchant_id = params.get('merchant_id');
    const value = params.get('TX_VALUE');
    const currency = params.get('currency');

    console.log('Parámetros recibidos de PayU:', {
      transactionState,
      responseCodePol,
      referenceCode,
      reference_pol,
      signature,
      polTransactionState,
      polResponseCode,
      merchant_id,
      value,
      currency,
    });

    // Procesar información del pago
    let status = 'unknown';
    let message = '';
    let icon = null;
    let color = '#666';

    const state = transactionState || polTransactionState;

    switch (state) {
      case '4': // Transacción aprobada
        status = 'success';
        message = '¡Pago aprobado exitosamente!';
        icon = <GoCheck className="status-icon" />;
        color = '#4caf50';
        break;
      case '6': // Transacción rechazada
        status = 'rejected';
        message = 'Pago rechazado. Por favor intenta con otro método de pago.';
        icon = <GoX className="status-icon" />;
        color = '#f44336';
        break;
      case '104': // Error
        status = 'error';
        message = 'Ocurrió un error durante el procesamiento del pago.';
        icon = <GoX className="status-icon" />;
        color = '#f44336';
        break;
      case '7': // Pago pendiente
      case '15': // Pago pendiente
        status = 'pending';
        message = 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
        icon = <GoAlert className="status-icon" />;
        color = '#ff9800';
        break;
      default:
        status = 'unknown';
        message = 'No se pudo determinar el estado del pago.';
        icon = <GoAlert className="status-icon" />;
        color = '#666';
    }

    setPaymentInfo({
      status,
      message,
      icon,
      color,
      referenceCode,
      transactionId: reference_pol,
      amount: value,
      currency: currency || 'COP',
    });

    setLoading(false);
  }, [location]);

  const handleContinue = () => {
    navigate('/carrito');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
          <LoadingScreen />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              color: paymentInfo?.color,
              marginBottom: '1rem',
            }}
          >
            {paymentInfo?.icon}
          </div>

          <h1
            style={{
              color: paymentInfo?.color,
              marginBottom: '1rem',
              fontSize: '1.8rem',
            }}
          >
            Estado del Pago
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              color: '#333',
              lineHeight: '1.5',
            }}
          >
            {paymentInfo?.message}
          </p>

          {paymentInfo?.referenceCode && (
            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                fontSize: '0.9rem',
                color: '#666',
              }}
            >
              <p>
                <strong>Referencia:</strong> {paymentInfo.referenceCode}
              </p>
              {paymentInfo.transactionId && (
                <p>
                  <strong>ID Transacción:</strong> {paymentInfo.transactionId}
                </p>
              )}
              {paymentInfo.amount && (
                <p>
                  <strong>Monto:</strong> ${parseFloat(paymentInfo.amount).toLocaleString('es-CO')}{' '}
                  {paymentInfo.currency}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleContinue}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={e => (e.target.style.backgroundColor = '#007bff')}
            >
              Volver al Carrito
            </button>

            <button
              onClick={handleGoHome}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.target.style.backgroundColor = '#545b62')}
              onMouseOut={e => (e.target.style.backgroundColor = '#6c757d')}
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .status-icon {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutPayU;
