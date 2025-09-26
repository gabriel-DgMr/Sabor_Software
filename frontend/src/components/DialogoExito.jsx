import PropTypes from 'prop-types';
import React from 'react';
import { GoCheck } from 'react-icons/go';

const DialogoModal = ({
  open,
  onClose,
  message,
  icon = <GoCheck className="dialogo-modal__icon-default" />,
  confirmText = null,
  cancelText = null,
  onConfirm = null,
  onCancel = null,
  duration = null,
}) => {
  if (!open) return null;

  return (
    <div className="dialogo-modal__overlay">
      <div className="dialogo-modal">
        {/* Botón de cierre (X) */}
        <button className="dialogo-modal__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <span aria-label="icono" className="dialogo-modal__icon" role="img">
          {icon}
        </span>

        <div className="dialogo-modal__message">{message}</div>

        {(confirmText || cancelText) && (
          <div className="dialogo-modal__actions">
            {confirmText && (
              <button className="dialogo-modal__btn" onClick={onConfirm}>
                {confirmText}
              </button>
            )}
            {cancelText && (
              <button className="dialogo-modal__btn" onClick={onCancel}>
                {cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

DialogoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  icon: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  duration: PropTypes.number,
};

export default DialogoModal;
