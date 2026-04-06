import React from 'react';
import PropTypes from 'prop-types';

/**
 * DashboardHeader - Encabezado para las páginas del tablero.
 * Sigue la metodología BEM en Español (.encabezado-tablero)
 */
const DashboardHeader = ({ titulo, subtitulo }) => {
  return (
    <header className="encabezado-tablero">
      <div className="encabezado-tablero__titulos">
        <h1 className="encabezado-tablero__titulo">{titulo}</h1>
        {subtitulo && <h2 className="encabezado-tablero__subtitulo">{subtitulo}</h2>}
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.string,
};

export default DashboardHeader;
