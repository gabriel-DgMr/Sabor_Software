/**
 * Componente ResetPasswordContainer
 * 
 * Este componente actúa como contenedor para el componente ResetPassword.
 * Maneja los mensajes globales y la navegación después de restablecer la contraseña.
 * Proporciona una capa adicional de manejo de estado y navegación.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ANIM_DURATION, VISIBLE_DURATION, animateElement } from '../../utils/animationUtils';
import { GoCheck, GoX } from 'react-icons/go';

import ResetPassword from './ResetPassword';
import './AuthPage.css';

// Componente de alerta visualmente consistente para reset password
const ResetAlert = ({ type, message }) => {
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

const ResetPasswordContainer = () => {
  // Estado para manejar los mensajes globales
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  /**
   * Maneja la visualización de mensajes globales
   * Incluye animaciones y redirección después de mensajes de éxito
   * @param {string} type - Tipo de mensaje ('success' o 'error')
   * @param {string} text - Texto del mensaje
   */
  const handleShowMessage = (type, text) => {
    setGlobalMessage({ type, text });
    const selector = type === 'success' ? '.formulario__mensaje-exito' : '.formulario__mensaje-error';

    // Animar la aparición del mensaje
    setTimeout(() => animateElement(selector, 'fade-in'), 0);

    if (type === 'success') {
      // Para mensajes de éxito, esperar 2 segundos antes de iniciar el fade-out
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        // Después de la animación de fade-out, redirigir al home
        setTimeout(() => {
          setGlobalMessage({ type: '', text: '' });
          navigate('/');
        }, ANIM_DURATION);
      }, 2000);
    } else {
      // Para mensajes de error, usar la duración estándar
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        // Solo limpiar el mensaje después de la animación
        setTimeout(() => {
          setGlobalMessage({ type: '', text: '' });
        }, ANIM_DURATION);
      }, VISIBLE_DURATION);
    }
  };

  return (
    <div className="modal">
      <div className="modal__contenido">
        {/* Componente principal de restablecimiento de contraseña */}
        <ResetPassword onShowMessage={handleShowMessage} />
        
        {/* Mensaje global que se muestra sobre el formulario */}
        {globalMessage.text && (
          <ResetAlert type={globalMessage.type} message={globalMessage.text} />
        )}
      </div>
    </div>
  );
};

export default ResetPasswordContainer; 