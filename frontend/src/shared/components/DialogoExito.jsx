import PropTypes from 'prop-types';
import React from 'react';
import { GoCheck } from 'react-icons/go';

const DialogoModal = ({
  open,
  onClose,
  message,
  className = '',
  icon = null,
  confirmText = null,
  cancelText = null,
  onConfirm = null,
  onCancel = null,
  duration = null,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="dialogo-modal__overlay"
      onClick={e => {
        if (e.target.classList.contains('dialogo-modal__overlay')) onClose?.();
      }}
    >
      <div className={`dialogo-modal ${className}`}>
        {/* Botón de cierre (X) */}
        <button className="dialogo-modal__close" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <div className="dialogo-modal__cuerpo">
          {icon && <div className="dialogo-modal__icono">{icon}</div>}
          {children ? children : <p className="dialogo-modal__mensaje">{message}</p>}
        </div>

        {(confirmText || cancelText) && (
          <div className="dialogo-modal__acciones">
            {confirmText && (
              <button
                className="dialogo-modal__btn dialogo-modal__btn--confirmar"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
            {cancelText && (
              <button
                className="dialogo-modal__btn dialogo-modal__btn--cancelar"
                onClick={onCancel}
              >
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
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  icon: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  duration: PropTypes.number,
  children: PropTypes.node,
};

export default DialogoModal;
