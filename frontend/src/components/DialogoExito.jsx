import PropTypes from 'prop-types';
import React from 'react';

const SuccessDialog = ({ message, open, onClose, duration = 2000 }) => {
  React.useEffect(() => {
    if (open && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="success-dialog-overlay">
      <div className="success-dialog">
        <span className="success-dialog__icon" role="img" aria-label="éxito">✅</span>
        <p className="success-dialog__message">{message}</p>
      </div>
      {/* Los estilos de este diálogo están en index.css (ver: // Estilos SuccessDialog) */}
    </div>
  );
};

SuccessDialog.propTypes = {
  message: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  duration: PropTypes.number, // en milisegundos
};

export default SuccessDialog;
