import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { GoCheck, GoX, GoAlert } from 'react-icons/go';

export const useCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, setModal] = useState({ open: false, message: '', icon: null, onConfirm: null });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    let message = '';
    let icon = null;

    switch (status) {
      case 'success':
        message = '¡Pago realizado con éxito! Tu pedido ha sido recibido.';
        icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
        break;
      case 'failure':
        message = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
        icon = <GoX className="GoX" style={{ fontSize: '2.5rem' }} />;
        break;
      case 'pending':
        message = 'El pago está pendiente de confirmación. Te avisaremos cuando se procese.';
        icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
        break;
      default:
        message = 'No se pudo determinar el estado del pago.';
        icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
    }

    setModal({
      open: true,
      message,
      icon,
      onConfirm: () => {
        setModal(m => ({ ...m, open: false }));
        navigate('/');
      },
    });
  }, [location, navigate]);

  return {
    modal,
    setModal,
  };
};
