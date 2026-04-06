import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils';

export const useResetPassword = ({ onShowMessage }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState('');
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token || isTokenVerified) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/reset-password/${token}`
        );
        const data = await response.json();

        if (!isMounted) return;

        if (response.ok) {
          setEmail(data.email);
          setIsTokenVerified(true);
        } else {
          onShowMessage('error', t('reset_invalid_link'));
          setTimeout(() => navigate('/login'), VISIBLE_DURATION + ANIM_DURATION);
        }
      } catch (_error) {
        if (!isMounted) return;
        onShowMessage('error', t('reset_error_verifying_link'));
        setTimeout(() => navigate('/login'), VISIBLE_DURATION + ANIM_DURATION);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, navigate, onShowMessage, isTokenVerified, t]);

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const form = e.target;
    const contraseña_cliente = form.password.value;
    const confirmarContraseña = form.confirmPassword.value;

    const newErrors = {};
    if (!contraseña_cliente) {
      newErrors.password = t('reset_password_required');
    } else if (contraseña_cliente.length < 8) {
      newErrors.password = t('reset_password_min_length');
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(contraseña_cliente)
    ) {
      newErrors.password = t('reset_password_complexity');
    }

    if (!confirmarContraseña) {
      newErrors.confirmPassword = t('reset_confirm_required');
    } else if (contraseña_cliente !== confirmarContraseña) {
      newErrors.confirmPassword = t('contrasenas_no_coinciden');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contraseña_cliente }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onShowMessage('success', t('reset_success'));
      } else {
        onShowMessage('error', data.message || t('reset_error'));
      }
    } catch (_error) {
      onShowMessage('error', t('reset_error_server'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  return { email, loading, errors, t, handleSubmit, handleInputChange };
};

export default useResetPassword;
