import React from 'react';
import PropTypes from 'prop-types';
import DomicilioItem from './DomicilioItem';

/**
 * DomicilioLista - Lista de pedidos a domicilio.
 * Aplica BEM (.pedidos-lista)
 */
const DomicilioLista = ({ pedidos, onCambiarEstado, onMarcarRecibido, actualizando }) => {
  if (pedidos.length === 0) {
    return (
      <div className="estado-vacio">
        <p>No hay pedidos a domicilio para mostrar en este momento.</p>
      </div>
    );
  }

  return (
    <div className="pedidos-lista">
      {pedidos.map(pedido => (
        <DomicilioItem
          key={pedido.id}
          estaActualizando={actualizando[pedido.id]}
          pedido={pedido}
          onCambiarEstado={onCambiarEstado}
          onMarcarRecibido={onMarcarRecibido}
        />
      ))}
    </div>
  );
};

DomicilioLista.propTypes = {
  pedidos: PropTypes.array.isRequired,
  onCambiarEstado: PropTypes.func.isRequired,
  onMarcarRecibido: PropTypes.func.isRequired,
  actualizando: PropTypes.object.isRequired,
};

export default DomicilioLista;
