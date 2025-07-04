import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { ANIM_DURATION, VISIBLE_DURATION, animateElement } from '../../utils/animationUtils';

import ForgotPassword from './ForgotPassword';
import Login from './Login';
import Register from './Register';
import './AuthPage.css';

const AuthPage = ({ isOpen, onClose }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot-password'
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isOpen) {
      setGlobalMessage({ type: '', text: '' });
      setView('login'); // Resetear a login cuando se cierra
    }
  }, [isOpen]);

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

  const handleRegisterSuccess = () => {
    setView('login');
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onShowForgotPassword={() => setView('forgot-password')}
            onShowMessage={handleShowMessage}
          />
        );
      case 'register':
        return (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onShowMessage={handleShowMessage}
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
          <div
            className={`auth-page__mensaje ${globalMessage.type === 'success' ? 'formulario__mensaje-exito' : 'formulario__mensaje-error'}`}>
            {globalMessage.text}
          </div>
        )}

        {view !== 'forgot-password' && (
          <div className="auth-page__toggle-view">
            {view === 'login' ? (
              <p>
                ¿No tienes una cuenta?{' '}
                <button className="auth-page__toggle-button" onClick={() => setView('register')}>
                  Regístrate
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <button className="auth-page__toggle-button" onClick={() => setView('login')}>
                  Inicia Sesión
                </button>
              </p>
            )}
          </div>
        )}
        {view === 'forgot-password' && (
          <div className="auth-page__toggle-view">
            <p>
              ¿Recordaste tu contraseña?{' '}
              <button className="auth-page__toggle-button" onClick={() => setView('login')}>
                Volver al inicio de sesión
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
