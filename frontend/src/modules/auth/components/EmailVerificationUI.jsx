import React from 'react';
import PropTypes from 'prop-types';
import CampoSesion from './CampoSesion';
import AlertaSesion from './AlertaSesion';
import '../styles/auth.css';

/**
 * EmailVerificationUI - Vista para ingresar el código de verificación.
 */
const EmailVerificationUI = ({
  email,
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
  onBackToLogin,
}) => {
  return (
    <div className="bloque-autenticacion">
      <h2 className="tarjeta-autenticacion__titulo">{t('verificar_email')}</h2>

      <div className="info-mesa" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <span className="info-mesa__label">{t('codigo_enviado_a')}</span>
        <span className="info-mesa__valor" style={{ fontSize: '1.5rem' }}>
          {email}
        </span>
        <p style={{ fontSize: '1.3rem', color: 'var(--neutral-600)', marginTop: '0.5rem' }}>
          {t('ingresa_codigo_6_digitos')}
        </p>
      </div>

      <form noValidate className="formulario-autenticacion" onSubmit={handleVerification}>
        <CampoSesion
          id="codigo-verification"
          name="codigo"
          label={t('codigo_verificacion')}
          placeholder="000000"
          value={codigo}
          onChange={handleInputChange}
          disabled={loading}
          autoComplete="one-time-code"
          error={error}
        />

        {success && <AlertaSesion message={success} type="success" />}

        <div className="acciones-autenticacion">
          <button
            className="boton boton--primario"
            disabled={loading || codigo.length !== 6}
            type="submit"
          >
            {loading ? t('verificando') : t('verificar_cuenta')}
          </button>

          <button
            className="boton boton--secundario"
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

          <button className="enlace-autenticacion" type="button" onClick={onBackToLogin}>
            {t('volver_al_login')}
          </button>
        </div>
      </form>
    </div>
  );
};

EmailVerificationUI.propTypes = {
  email: PropTypes.string.isRequired,
  codigo: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  success: PropTypes.string,
  resendLoading: PropTypes.bool.isRequired,
  countdown: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  handleVerification: PropTypes.func.isRequired,
  handleResendCode: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
};

export default EmailVerificationUI;
