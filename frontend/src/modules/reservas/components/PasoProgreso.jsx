import React from 'react';
import PropTypes from 'prop-types';

/**
 * PasoProgreso - Muestra un paso individual en el flujo de reservación.
 * BEM: .paso-item
 */
const PasoProgreso = ({ numero, etiqueta, activo, completado }) => {
  const claseEstado = activo ? 'paso-item--activo' : completado ? 'paso-item--completado' : '';

  return (
    <div className={`paso-item ${claseEstado}`}>
      <div className="paso-item__circulo">{completado ? '✓' : numero}</div>
      <span className="paso-item__etiqueta">{etiqueta}</span>
    </div>
  );
};

PasoProgreso.propTypes = {
  numero: PropTypes.number.isRequired,
  etiqueta: PropTypes.string.isRequired,
  activo: PropTypes.bool,
  completado: PropTypes.bool,
};

export default PasoProgreso;
