import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { GoCheck, GoX, GoAlert } from 'react-icons/go';

export const useCheckoutPayU = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    document.title = 'Sabor: Estado del Pago';

    const params = new URLSearchParams(location.search);
    const transactionState = params.get('transactionState');
    const polTransactionState = params.get('polTransactionState');
    const referenceCode = params.get('referenceCode');
    const reference_pol = params.get('reference_pol');
    const value = params.get('TX_VALUE');
    const currency = params.get('currency');

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

  return {
    loading,
    paymentInfo,
    handleContinue,
    handleGoHome,
  };
};
