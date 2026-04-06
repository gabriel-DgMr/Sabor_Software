import React from 'react';
import PropTypes from 'prop-types';
import { GoCheck, GoX } from 'react-icons/go';

/**
 * AlertaSesion - Alerta estilizada para el flujo de sesión.
 * BEM: .alerta-autenticacion
 */
const AlertaSesion = ({ message, type = 'error', id }) => {
  if (!message) return null;

  const Icon = type === 'success' ? GoCheck : GoX;

  return (
    <div id={id} className={`alerta-autenticacion alerta-autenticacion--${type}`}>
      <Icon className="alerta-autenticacion__icono" />
      <span>{message}</span>
    </div>
  );
};

AlertaSesion.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error']),
  id: PropTypes.string,
};

export default AlertaSesion;
