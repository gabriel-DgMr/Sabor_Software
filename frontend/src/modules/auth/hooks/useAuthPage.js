import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElement,
} from '../../../shared/utils/animationUtils';

export const useAuthPage = ({ isOpen, onClose, isPage = false, initialView = 'login' }) => {
  const navigate = useNavigate();
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pendingVerificationEmail')) {
      return 'verify-email';
    }
    return initialView;
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
    if (!isPage && !isOpen) {
      setGlobalMessage({ type: '', text: '' });
      setView('login');
    }
  }, [isOpen, isPage]);

  useEffect(() => {
    if (isOpen || isPage) {
      const email = localStorage.getItem('pendingVerificationEmail') || '';
      setPendingVerificationEmail(email);
      if (email) {
        setView('verify-email');
      }
    }
  }, [isOpen, isPage]);

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

  const handleShowMessage = (type, text) => {
    setGlobalMessage({ type, text });
    const selector =
      type === 'success' ? '.formulario__mensaje-exito' : '.formulario__mensaje-error';

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

  const handleLoginSuccess = (destRoute = '/') => {
    setTimeout(
      () => {
        if (onClose) {
          onClose();
        } else if (isPage) {
          navigate(destRoute); // Smoother transition without full app reload
        }
      },
      VISIBLE_DURATION + ANIM_DURATION + 50
    );
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

  return {
    view,
    setView,
    globalMessage,
    t,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    handleShowMessage,
    handleLoginSuccess,
    handleVerificationSuccess,
    handleBackToLogin,
  };
};

export default useAuthPage;
