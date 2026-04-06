import React from 'react';
import PropTypes from 'prop-types';
import { mapearEstado } from '../services/pedidos-service';

/**
 * DomicilioItem - Representación individual de un pedido a domicilio.
 * Aplica BEM (.tarjeta-pedido)
 */
const DomicilioItem = ({ pedido, onCambiarEstado, onMarcarRecibido, estaActualizando }) => {
  const esCompletado = pedido.estado === 'completado' || pedido.estado === 'recibido';

  return (
    <article className="tarjeta-pedido">
      <div className="tarjeta-pedido__contenido">
        <header className="tarjeta-pedido__encabezado">
          <h2 className="tarjeta-pedido__titulo">
            Orden #{pedido.id} - {pedido.cliente}
          </h2>
          <span className={`tarjeta-pedido__estado tarjeta-pedido__estado--${pedido.estado}`}>
            {mapearEstado(pedido.estado)}
          </span>
        </header>

        <div className="tarjeta-pedido__detalles">
          <p className="tarjeta-pedido__productos">{pedido.productos}</p>
          <p className="tarjeta-pedido__direccion">
            <strong>📍 Dirección:</strong> {pedido.direccion_entrega}
            {pedido.detalle_direccion && ` (${pedido.detalle_direccion})`}
          </p>
          {pedido.notas && (
            <p className="tarjeta-pedido__notas">
              <strong>📝 Notas:</strong> {pedido.notas}
            </p>
          )}
          <p className="tarjeta-pedido__total">
            Total: <span>${pedido.total?.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <footer className="tarjeta-pedido__acciones">
        {/* Botón Principal de Flujo */}
        <button
          className="boton boton--primario"
          disabled={esCompletado || estaActualizando}
          onClick={() => onCambiarEstado(pedido.id, pedido.estado)}
        >
          {estaActualizando ? 'Procesando...' : esCompletado ? 'Completado' : 'Siguiente Estado'}
        </button>

        {/* Botón de Confirmación de Recepción */}
        {!pedido.recibido_cliente ? (
          <button
            className="boton boton--exito"
            disabled={estaActualizando}
            onClick={() => onMarcarRecibido(pedido.id)}
          >
            {estaActualizando ? '...' : 'Confirmar Recepción'}
          </button>
        ) : (
          <div className="tarjeta-pedido__recibido">Pedido recibido ✅</div>
        )}
      </footer>
    </article>
  );
};

DomicilioItem.propTypes = {
  pedido: PropTypes.object.isRequired,
  onCambiarEstado: PropTypes.func.isRequired,
  onMarcarRecibido: PropTypes.func.isRequired,
  estaActualizando: PropTypes.bool,
};

export default DomicilioItem;
