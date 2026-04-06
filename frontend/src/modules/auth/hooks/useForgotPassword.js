import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils';
import { validarEmail } from '../../../shared/utils/validaciones';

export const useForgotPassword = ({ onShowMessage }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});

    const form = e.target;
    const correo_usuario = form.correo_usuario.value;

    const newErrors = {};
    if (!correo_usuario) {
      newErrors.email = t('forgot_email_required');
    } else {
      const correoError = validarEmail(correo_usuario);
      if (correoError) {
        newErrors.email = t('forgot_email_invalid');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo_usuario: correo_usuario.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('forgot_error_request'));
      }

      onShowMessage('success', t('forgot_success'));
      form.reset();
    } catch (error) {
      onShowMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  return { errors, loading, handleSubmit, handleInputChange, t };
};

export default useForgotPassword;
