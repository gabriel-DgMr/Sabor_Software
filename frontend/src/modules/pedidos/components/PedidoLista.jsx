import React from 'react';
import PropTypes from 'prop-types';
import PedidoItem from './PedidoItem';

/**
 * PedidoLista - Grid de pedidos filtrados.
 */
const PedidoLista = ({ pedidos, onCambiarEstado, cargando }) => {
  if (pedidos.length === 0) {
    return (
      <div className="estado-vacio">
        <p>No se encontraron pedidos en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="pedidos-lista">
      {pedidos.map(pedido => (
        <PedidoItem
          key={pedido.id}
          estaCargando={cargando}
          pedido={pedido}
          onCambiarEstado={onCambiarEstado}
        />
      ))}
    </div>
  );
};

PedidoLista.propTypes = {
  pedidos: PropTypes.array.isRequired,
  onCambiarEstado: PropTypes.func.isRequired,
  cargando: PropTypes.bool,
};

export default PedidoLista;
