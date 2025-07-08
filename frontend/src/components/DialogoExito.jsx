import PropTypes from 'prop-types';
import React from 'react';

const DialogoModal = ({
  open,
  onClose,
  message,
  icon = '✅',
  confirmText = null,
  cancelText = null,
  onConfirm = null,
  onCancel = null,
  duration = 3000
}) => {
  React.useEffect(() => {
    if (open && onClose && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        {/* Botón de cierre (X) */}
        <button
          className="success-dialog__close"
          aria-label="Cerrar"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#888',
            zIndex: 2
          }}
        >
          ×
        </button>
        <span aria-label="icono" className="success-dialog__icon" role="img">{icon}</span>
        <p className="success-dialog__message">{message}</p>
        {(confirmText || cancelText) && (
          <div className="success-dialog__actions">
            {confirmText && <button className="success-dialog__btn" onClick={onConfirm}>{confirmText}</button>}
            {cancelText && <button className="success-dialog__btn" onClick={onCancel}>{cancelText}</button>}
          </div>
        )}
      </div>
    </div>
  );
};

DialogoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  message: PropTypes.string.isRequired,
  icon: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  duration: PropTypes.number,
};

export default DialogoModal;
