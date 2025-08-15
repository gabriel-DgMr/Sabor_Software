import PropTypes from 'prop-types';
import React from 'react';
import { GoX, GoCheck, GoAlert } from 'react-icons/go';

const DialogoModal = ({
  open,
  onClose,
  message,
  icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />,
  confirmText = null,
  cancelText = null,
  onConfirm = null,
  onCancel = null,
  duration = null,
}) => {
  // El modal ya no se cierra automáticamente por duración

  if (!open) return null;

  return (
    <div className="success-dialog-overlay">
      <div
        className="success-dialog"
        style={{
          background: '#fff',
          border: 'none',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          borderRadius: '16px',
          minWidth: '320px',
          maxWidth: '90vw',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 32px 24px 32px',
        }}
      >
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
            zIndex: 2,
          }}
        >
          ×
        </button>
        <span
          aria-label="icono"
          className="success-dialog__icon"
          role="img"
          style={{ display: 'block', textAlign: 'center', margin: '0 auto' }}
        >
          {icon}
        </span>
        <p className="success-dialog__message" style={{ textAlign: 'center' }}>
          {message}
        </p>
        {(confirmText || cancelText) && (
          <div className="success-dialog__actions">
            {confirmText && (
              <button className="success-dialog__btn" onClick={onConfirm}>
                {confirmText}
              </button>
            )}
            {cancelText && (
              <button className="success-dialog__btn" onClick={onCancel}>
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
  message: PropTypes.string.isRequired,
  icon: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  duration: PropTypes.number,
};

export default DialogoModal;
