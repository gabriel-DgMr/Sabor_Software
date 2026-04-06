import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElement,
} from '../../../shared/utils/animationUtils';

export const useResetPasswordContainer = () => {
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleShowMessage = (type, text) => {
    setGlobalMessage({ type, text });
    const selector =
      type === 'success' ? '.formulario__mensaje-exito' : '.formulario__mensaje-error';

    setTimeout(() => animateElement(selector, 'fade-in'), 0);

    if (type === 'success') {
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => {
          setGlobalMessage({ type: '', text: '' });
          navigate('/');
        }, ANIM_DURATION);
      }, 2000);
    } else {
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
    }
  };

  return { globalMessage, handleShowMessage };
};

export default useResetPasswordContainer;
