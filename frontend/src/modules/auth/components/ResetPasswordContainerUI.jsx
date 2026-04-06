import React from 'react';
import PropTypes from 'prop-types';
import { GoCheck, GoX } from 'react-icons/go';
import ResetPassword from '../pages/ResetPassword';
import '../styles/auth-page.css';

const ResetAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success' ? <GoCheck className="GoCheck" /> : <GoX className="GoX" />;
  return (
    <div
      className={`alerta-sin-tarjeta alerta-sin-tarjeta--grande ${
        type === 'success' ? 'alerta-sin-tarjeta--exito' : 'alerta-sin-tarjeta--error'
      }`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

ResetAlert.propTypes = {
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  message: PropTypes.string,
};

const ResetPasswordContainerUI = ({ globalMessage, handleShowMessage }) => {
  return (
    <div className="modal">
      <div className="modal__contenido">
        <ResetPassword onShowMessage={handleShowMessage} />
        {globalMessage.text && (
          <ResetAlert type={globalMessage.type} message={globalMessage.text} />
        )}
      </div>
    </div>
  );
};

ResetPasswordContainerUI.propTypes = {
  globalMessage: PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  handleShowMessage: PropTypes.func.isRequired,
};

export default ResetPasswordContainerUI;
