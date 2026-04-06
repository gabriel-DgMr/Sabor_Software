import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils';

export const useEmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerification = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo_usuario: email,
          codigo: codigo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
          onBackToLogin();
        }, 2000);
      } else {
        setError(data.message);
        setTimeout(() => animateElements('.formulario__mensaje-error', 'fade-in'), 0);
        setTimeout(() => {
          document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
          });
          setTimeout(() => setError(''), ANIM_DURATION);
        }, VISIBLE_DURATION);
      }
    } catch (_error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo_usuario: email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código reenviado exitosamente');
        setCountdown(60); // 60 segundos de espera
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (_err) {
      setError('Error al reenviar código');
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange = e => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(value);
  };

  return {
    codigo,
    loading,
    error,
    success,
    resendLoading,
    countdown,
    t,
    handleVerification,
    handleResendCode,
    handleInputChange,
  };
};

export default useEmailVerification;
