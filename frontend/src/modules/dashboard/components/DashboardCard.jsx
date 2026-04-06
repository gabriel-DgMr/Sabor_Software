import React from 'react';
import PropTypes from 'prop-types';

/**
 * DashboardCard - Botón de acción tipo tarjeta para el tablero principal.
 * Sigue la metodología BEM en Español (.tarjeta-accion)
 */
const DashboardCard = ({ titulo, valor, icon, onClick, type = '', gridClass = '' }) => {
  return (
    <button
      className={`bento-card ${type ? `bento-card--${type}` : ''} ${gridClass}`}
      onClick={onClick}
    >
      <div className="bento-card__header">
        {icon && <div className="bento-card__icon">{icon}</div>}
        <h3 className="bento-card__titulo">{titulo}</h3>
      </div>
      {valor && <div className="bento-card__valor">{valor}</div>}
      {!valor && (
        <div
          className="bento-card__footer"
          style={{ fontSize: '1.4rem', fontWeight: 700, opacity: 0.8 }}
        >
          Gestionar →
        </div>
      )}
    </button>
  );
};

const DashboardHeader = ({ titulo, subtitulo }) => {
  return (
    <header className="encabezado-tablero" style={{ textAlign: 'left', marginBottom: '5rem' }}>
      <h1
        className="encabezado-tablero__titulo"
        style={{ fontSize: '4.8rem', letterSpacing: '-1px' }}
      >
        {titulo}
      </h1>
      {subtitulo && (
        <h2 className="encabezado-tablero__subtitulo" style={{ fontSize: '1.8rem', opacity: 0.6 }}>
          {subtitulo}
        </h2>
      )}
    </header>
  );
};

DashboardCard.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  type: PropTypes.string,
  gridClass: PropTypes.string,
};

DashboardHeader.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.string,
};

export default DashboardCard;
