import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';

const EmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
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
      const response = await fetch('/api/auth/verify-email', {
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
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo_usuario: email,
        }),
      });

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

  return (
    <div className="formulario__contenedor formulario__contenedor--verification">
      <h2 className="modal__titulo">{t('verificar_email')}</h2>

      <div className="verification__info">
        <p>
          {t('codigo_enviado_a')} <strong>{email}</strong>
        </p>
        <p>{t('ingresa_codigo_6_digitos')}</p>
      </div>

      <form noValidate className="formulario" onSubmit={handleVerification}>
        <div className="formulario__campo--codigo">
          <label className="formulario__label" htmlFor="codigo-verification">
            {t('codigo_verificacion')}
          </label>
          <input
            autoComplete="off"
            className={`formulario__input ${error ? 'input--error' : ''}`}
            disabled={loading}
            id="codigo-verification"
            maxLength={6}
            name="codigo"
            placeholder="000000"
            type="text"
            value={codigo}
            onChange={handleInputChange}
          />
          {error && <small className="formulario__mensaje-error">{error}</small>}
        </div>

        {success && <div className="formulario__mensaje-exito">{success}</div>}

        <button
          className="formulario__boton-principal"
          disabled={loading || codigo.length !== 6}
          type="submit"
        >
          {loading ? t('verificando') : t('verificar_cuenta')}
        </button>
      </form>

      <div className="verification__actions">
        <button
          className="formulario__boton-secundario"
          disabled={resendLoading || countdown > 0}
          type="button"
          onClick={handleResendCode}
        >
          {resendLoading
            ? t('reenviando')
            : countdown > 0
              ? `${t('reenviar_en')} ${countdown}s`
              : t('reenviar_codigo')}
        </button>

        <button className="formulario__boton-secundario" type="button" onClick={onBackToLogin}>
          {t('volver_al_login')}
        </button>
      </div>
    </div>
  );
};

EmailVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onVerificationSuccess: PropTypes.func,
  onBackToLogin: PropTypes.func.isRequired,
};

export default EmailVerification;
