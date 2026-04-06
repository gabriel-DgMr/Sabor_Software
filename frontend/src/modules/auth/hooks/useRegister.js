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
import { validarRegistro } from '../../../shared/utils/validaciones';

export const useRegister = ({ onRegisterSuccess }) => {
  const { registerUser, loading } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    const errorMap = {
      nombre: 'nombre_usuario',
      email: 'correo_usuario',
      telefono: 'telefono_usuario',
      password: 'contraseña_usuario',
      confirmPassword: 'confirmPassword',
    };

    const fieldInErrorState = errorMap[name];
    if (fieldInErrorState && errors[fieldInErrorState]) {
      const nuevosErrores = { ...errors };
      delete nuevosErrores[fieldInErrorState];
      setErrors(nuevosErrores);
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const validationData = {
      nombre_usuario: formData.nombre,
      correo_usuario: formData.email,
      telefono_usuario: formData.telefono,
      contraseña_usuario: formData.password,
    };

    const validationErrors = validarRegistro(validationData);

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirma_contrasena');
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = t('contrasenas_no_coinciden');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await registerUser({
      nombre_usuario: validationData.nombre_usuario.trim(),
      correo_usuario: validationData.correo_usuario.trim(),
      telefono_usuario: validationData.telefono_usuario.trim(),
      contraseña_usuario: validationData.contraseña_usuario,
    });

    if (result && result.success) {
      if (result.requiresVerification) {
        toast.warn(t('verificacion_requerida_registro'));
        setRegisteredEmail(validationData.correo_usuario.trim());
        setShowVerification(true);
        localStorage.setItem('pendingVerificationEmail', formData.correo_usuario.trim());
      } else {
        const mensajeExito = result.message || t('registro_exitoso');
        toast.success(mensajeExito);
        setSuccessMessage(mensajeExito);
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 2000);
        // No es necesario form.reset() ya que navegamos o usamos controlled inputs
      }
      return;
    } else {
      const mensajeError = result.message || t('error_registro');
      toast.error(mensajeError);
      // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.
      setGlobalError(mensajeError);
    }
  };

  const handleVerificationSuccess = () => {
    const mensajeExito = t('cuenta_activada_exitosamente');
    toast.success(mensajeExito);
    setSuccessMessage(mensajeExito);
    setTimeout(() => {
      setSuccessMessage('');
      setShowVerification(false);
      localStorage.removeItem('pendingVerificationEmail');
      if (onRegisterSuccess) {
        onRegisterSuccess(true);
      } else {
        navigate('/');
      }
    }, 2000);
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    localStorage.removeItem('pendingVerificationEmail');
    if (onRegisterSuccess) {
      onRegisterSuccess(false);
    }
  };

  return {
    formData,
    errors,
    globalError,
    successMessage,
    showVerification,
    registeredEmail,
    loading,
    t,
    handleRegister,
    handleInputChange,
    handleVerificationSuccess,
    handleBackToLogin,
  };
};

export default useRegister;
