import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ANIM_DURATION, VISIBLE_DURATION, animateElement } from '../../utils/animationUtils';
import { GoCheck, GoX } from 'react-icons/go';

import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotPassword';
import Login from './Login';
import Register from './Register';
import './AuthPage.css';

// Componente de alerta visualmente consistente para auth
const AuthAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success'
    ? <GoCheck className="GoCheck" />
    : <GoX className="GoX" />;
  return (
    <div className="alerta-sin-tarjeta">
      {icon}
      <span>{message}</span>
    </div>
  );
};

const AuthPage = ({ isOpen, onClose }) => {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pendingVerificationEmail')) {
      return 'verify-email';
    }
    return 'login';
  });
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
  const { t } = useTranslation();
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pendingVerificationEmail') || '';
    }
    return '';
  });

  useEffect(() => {
    if (!isOpen) {
      setGlobalMessage({ type: '', text: '' });
      setView('login'); // Resetear a login cuando se cierra
    }
  }, [isOpen]);

  // Sincronizar pendingVerificationEmail y vista con localStorage al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const email = localStorage.getItem('pendingVerificationEmail') || '';
      setPendingVerificationEmail(email);
      if (email) {
        setView('verify-email');
      }
    }
  }, [isOpen]);

  // Sincronizar pendingVerificationEmail y vista con localStorage al cambiar la vista
  useEffect(() => {
    const email = localStorage.getItem('pendingVerificationEmail') || '';
    setPendingVerificationEmail(email);
    if (view !== 'verify-email' && email) {
      setView('verify-email');
    }
  }, [view]);

  useEffect(() => {
    setGlobalMessage({ type: '', text: '' });
  }, [view]);

  if (!isOpen) return null;

  const handleShowMessage = (type, text) => {
    setGlobalMessage({ type, text });
    const selector = type === 'success' ? '.formulario__mensaje-exito' : '.formulario__mensaje-error';

    setTimeout(() => animateElement(selector, 'fade-in'), 0);

    setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      }
      setTimeout(() => {
        setGlobalMessage({ type: '', text: '' });
      }, ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  const handleLoginSuccess = () => {
    setTimeout(() => {
      onClose();
    }, VISIBLE_DURATION + ANIM_DURATION + 50);
  };

  const handleVerificationSuccess = () => {
    localStorage.removeItem('pendingVerificationEmail');
    setPendingVerificationEmail('');
    setView('login');
  };

  const handleBackToLogin = () => {
    setView('login');
    localStorage.removeItem('pendingVerificationEmail');
    setPendingVerificationEmail('');
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onShowForgotPassword={() => setView('forgot-password')}
            onShowMessage={handleShowMessage}
            onShowVerification={() => {
              setPendingVerificationEmail(localStorage.getItem('pendingVerificationEmail') || '');
              setView('verify-email');
            }}
          />
        );
      case 'register':
        return (
          <Register
            onRegisterSuccess={() => {
              setPendingVerificationEmail(localStorage.getItem('pendingVerificationEmail') || '');
              setView('verify-email');
            }}
            onShowMessage={handleShowMessage}
          />
        );
      case 'verify-email':
        return (
          <EmailVerification
            email={pendingVerificationEmail}
            onBackToLogin={handleBackToLogin}
            onVerificationSuccess={handleVerificationSuccess}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onShowMessage={handleShowMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__contenido" onClick={e => e.stopPropagation()}>
        <button aria-label="Cerrar" className="modal__boton-cerrar" onClick={onClose}>
          &times;
        </button>

        {renderContent()}

        {globalMessage.text && (
          <AuthAlert type={globalMessage.type} message={globalMessage.text} />
        )}

        {view !== 'forgot-password' && (
          <div className="auth-page__toggle-view">
            {view === 'login' ? (
              <p>
                {t('no_tienes_cuenta')}{' '}
                <button className="auth-page__toggle-button" onClick={() => setView('register')}>
                  {t('registrate')}
                </button>
              </p>
            ) : (
              <p>
                {t('ya_tienes_cuenta')}{' '}
                <button className="auth-page__toggle-button" onClick={() => setView('login')}>
                  {t('iniciar_sesion')}
                </button>
              </p>
            )}
          </div>
        )}
        {view === 'forgot-password' && (
          <div className="auth-page__toggle-view">
            <p>
              {t('forgot_remembered')}{' '}
              <button className="auth-page__toggle-button" onClick={() => setView('login')}>
                {t('volver_al_login')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

AuthPage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AuthPage;
