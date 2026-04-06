import React from 'react';
import PropTypes from 'prop-types';
import { FiRefreshCcw, FiLoader, FiArrowRight } from 'react-icons/fi';
import { GoCheck } from 'react-icons/go';
import { TbPackage } from 'react-icons/tb';
import { mapearEstado, obtenerSiguienteEstado } from '../services/pedidos-service';

/**
 * PedidoItem - Componente individual para pedidos en el tablero administrativo/empleado.
 * Maneja estados, tipos de servicio y acciones de flujo.
 */
const PedidoItem = ({ pedido, onCambiarEstado, estaCargando }) => {
  const siguienteEstado = obtenerSiguienteEstado(pedido.estado);
  const esCompletado = pedido.estado === 'completado';
  const esRecibido = pedido.estado === 'recibido';
  const bloqueado = esCompletado || esRecibido || pedido.cambiandoEstado || estaCargando;

  return (
    <article className="tarjeta-pedido">
      <div className="tarjeta-pedido__contenido">
        <header className="tarjeta-pedido__encabezado">
          <div className="tarjeta-pedido__titulos">
            <h2 className="tarjeta-pedido__titulo">
              #{pedido.id} - {pedido.cliente}
            </h2>
            <div className="tarjeta-pedido__subtitulos">
              <span className="tarjeta-pedido__tipo">
                {pedido.tipo_servicio === 'mesa' ? `🪑 Mesa: ${pedido.mesa}` : '🚀 Domicilio'}
              </span>
              <span className="tarjeta-pedido__hora">⏰ {pedido.hora}</span>
            </div>
          </div>
          <span className={`tarjeta-pedido__estado tarjeta-pedido__estado--${pedido.estado}`}>
            {mapearEstado(pedido.estado)}
          </span>
        </header>

        <div className="tarjeta-pedido__detalles">
          <p className="tarjeta-pedido__productos">{pedido.productos}</p>

          <div className="tarjeta-pedido__info-pago">
            <p className="tarjeta-pedido__total">
              Total: <span>${pedido.total?.toLocaleString()}</span>
            </p>
            {pedido.metodo_pago === 'payu' && (
              <span className="tarjeta-pedido__badge-pago">💳 PayU</span>
            )}
          </div>

          {pedido.tipo_servicio === 'domicilio' && pedido.direccion_entrega && (
            <p className="tarjeta-pedido__direccion">📍 {pedido.direccion_entrega}</p>
          )}

          {pedido.notas && <p className="tarjeta-pedido__notas">📝 {pedido.notas}</p>}
        </div>
      </div>

      <footer className="tarjeta-pedido__acciones">
        <button
          className={`boton ${esCompletado ? 'boton--exito' : 'boton--primario'} ${pedido.cambiandoEstado ? 'boton--cargando' : ''}`}
          onClick={() => onCambiarEstado(pedido.id, pedido.estado)}
          disabled={bloqueado}
        >
          {pedido.cambiandoEstado ? (
            <>
              <FiLoader className="icono-spin" /> Actualizando...
            </>
          ) : esCompletado ? (
            <>
              <GoCheck /> Completado
            </>
          ) : esRecibido ? (
            <>
              <TbPackage /> Recibido
            </>
          ) : (
            <>
              <FiArrowRight /> {mapearEstado(siguienteEstado)}
            </>
          )}
        </button>
      </footer>
    </article>
  );
};

PedidoItem.propTypes = {
  pedido: PropTypes.object.isRequired,
  onCambiarEstado: PropTypes.func.isRequired,
  estaCargando: PropTypes.bool,
};

export default PedidoItem;
