import React from 'react';
import PropTypes from 'prop-types';

/**
 * UsuarioModalConfirmacion - Modal genérico para confirmar acciones críticas.
 */
const UsuarioModalConfirmacion = ({ confirmacion, onCerrar, onConfirmar }) => {
  if (!confirmacion) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__titulo">Confirmar Acción</h3>
        </div>
        <div className="modal__body">
          <p className="modal__mensaje">{confirmacion.mensaje}</p>
        </div>
        <div className="modal__footer">
          <button className="boton boton--secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className={`boton ${confirmacion.tipo === 'desactivacion' ? 'boton--peligro' : 'boton--primario'}`}
            onClick={onConfirmar}
          >
            {confirmacion.tipo === 'cambioRol' ? 'Confirmar Cambio' : 'Desactivar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};

UsuarioModalConfirmacion.propTypes = {
  confirmacion: PropTypes.object,
  onCerrar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
};

export default UsuarioModalConfirmacion;
