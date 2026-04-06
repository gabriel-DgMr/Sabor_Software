import React from 'react';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import '../styles/auth.css';

/**
 * LoginUI - Contenedor de la vista de inicio de sesión.
 */
const LoginUI = ({
  formData,
  errors,
  globalError,
  successMessage,
  loading,
  handleLogin,
  handleInputChange,
  t,
  onShowForgotPassword,
  onShowVerification,
}) => {
  return (
    <div className="login-ui">
      <LoginForm
        formData={formData}
        errors={errors}
        globalError={globalError}
        handleLogin={handleLogin}
        handleInputChange={handleInputChange}
        loading={loading}
        onShowForgotPassword={onShowForgotPassword}
        successMessage={successMessage}
        t={t}
      />

      <div
        className="autenticacion__separador"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '2.4rem 0',
          color: 'var(--neutral-400)',
        }}
      >
        <hr style={{ flex: 1, borderTop: '1px solid var(--neutral-200)' }} />
        <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>{t('o_continuar_con')}</span>
        <hr style={{ flex: 1, borderTop: '1px solid var(--neutral-200)' }} />
      </div>

      <div className="autenticacion__social">
        <button
          className="autenticacion__social-btn autenticacion__social-btn--google"
          type="button"
        >
          <i className="fab fa-google"></i> {t('google')}
        </button>
        <button
          className="autenticacion__social-btn autenticacion__social-btn--apple"
          type="button"
        >
          <i className="fab fa-apple"></i> {t('apple')}
        </button>
      </div>

      {typeof window !== 'undefined' && localStorage.getItem('pendingVerificationEmail') && (
        <div className="acciones-autenticacion" style={{ marginTop: '2.4rem' }}>
          <button
            className="boton-moderno boton-moderno--secundario"
            style={{ width: '100%' }}
            type="button"
            onClick={onShowVerification}
          >
            {t('volver_a_verificar_email')}
          </button>
        </div>
      )}
    </div>
  );
};

LoginUI.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  globalError: PropTypes.string,
  successMessage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  onShowForgotPassword: PropTypes.func.isRequired,
  onShowVerification: PropTypes.func.isRequired,
};

export default LoginUI;
