import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../app/context/AuthContext.jsx';
import { toast } from 'react-toastify';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils';
import { validarLogin } from '../../../shared/utils/validaciones';
import { obtenerRutaPorRol } from '../../../shared/utils/authUtils';

export const useLogin = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    return () => setErrors({});
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al modificarlo
    const fieldName = name === 'email' ? 'correo_usuario' : 'contraseña_usuario';
    if (errors[fieldName]) {
      const nuevosErrores = { ...errors };
      delete nuevosErrores[fieldName];
      setErrors(nuevosErrores);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setSuccessMessage('');

    const validationData = {
      correo_usuario: formData.email,
      contraseña_usuario: formData.password,
    };

    const validationErrors = validarLogin(validationData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.email.trim(), formData.password);

    if (result && result.success) {
      toast.success(t('login_exito'));
      setSuccessMessage(t('login_exito'));

      if (onLoginSuccess) {
        const destRoute = obtenerRutaPorRol(result.user?.nombre_rol);
        onLoginSuccess(destRoute);
      }
    } else {
      const mensajeError = result.message || t('login_error');
      toast.error(mensajeError);
      setGlobalError(mensajeError);
    }
  };

  return {
    formData,
    errors,
    globalError,
    successMessage,
    loading,
    handleLogin,
    handleInputChange,
    t,
  };
};

export default useLogin;
