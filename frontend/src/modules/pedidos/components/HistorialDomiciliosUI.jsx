import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../shared/components/Header';
import { GoCheck, GoX } from 'react-icons/go';

const HistorialDomiciliosUI = ({
  domicilios,
  loading,
  updating,
  marcandoRecibido,
  mensaje,
  handleRecibido,
  formatearEstado,
  puedeMarcarComoRecibido,
}) => {
  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
      </>
    );
  }

  if (!domicilios || domicilios.length === 0) {
    return (
      <>
        <Header />
        <div className="historial-pedidos-bg">
          <div className="historial-pedidos-titulo">
            <h2>Historial de domicilios</h2>
          </div>
          <p className="mensaje-ejemplo" style={{ textAlign: 'center', padding: '20px' }}>
            No tienes domicilios registrados.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="historial-pedidos-bg">
        <div className="historial-pedidos-titulo">
          <h2>Historial de domicilios</h2>
        </div>

        {mensaje.texto && (
          <div
            className={`mensaje ${
              mensaje.tipo === 'success' ? 'mensaje-success' : 'mensaje-error'
            }`}
          >
            {mensaje.tipo === 'success' ? <GoCheck /> : <GoX />}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <div className="historial-pedidos-lista">
          {domicilios.map(d => (
            <div key={d.id_pedido} className="pedido-tarjeta">
              <div className="pedido-tarjeta-header">
                <span className="pedido-fecha">{new Date(d.fecha_pedido).toLocaleString()}</span>
                <span className={`pedido-estado ${d.nombre_estado?.toLowerCase() || 'pendiente'}`}>
                  {formatearEstado(d.nombre_estado) || 'Pendiente'}
                </span>
              </div>

              <div className="pedido-productos">
                <h4>Productos:</h4>
                <p className="producto-nombre">
                  {d.productos_str || 'No hay productos registrados'}
                </p>
              </div>

              <div className="pedido-direccion">
                <h4>Dirección de entrega:</h4>
                <p className="producto-nombre">{d.direccion_entrega}</p>
                {d.detalle_direccion && (
                  <p className="producto-nombre">Detalle: {d.detalle_direccion}</p>
                )}
              </div>

              <div className="pedido-total">
                <h4>Total:</h4>
                <p className="producto-precio">
                  ${(d.total_pedido || d.total || 0).toLocaleString()}
                </p>
              </div>

              {puedeMarcarComoRecibido(d.nombre_estado) && (
                <div className="pedido-acciones">
                  <button
                    className={`btn-marcar-recibido ${
                      marcandoRecibido[d.id_pedido] ? 'cargando' : ''
                    }`}
                    onClick={() => handleRecibido(d.id_pedido)}
                    disabled={marcandoRecibido[d.id_pedido]}
                  >
                    {marcandoRecibido[d.id_pedido] ? (
                      <>
                        <span className="spinner"></span>
                        Marcando...
                      </>
                    ) : (
                      <>
                        <GoCheck />
                        Marcar como Recibido
                      </>
                    )}
                  </button>
                </div>
              )}

              {d.nombre_estado && d.nombre_estado.toLowerCase() === 'recibido' && (
                <div className="pedido-recibido">
                  <GoCheck className="icono-recibido" />
                  <span>Domicilio recibido</span>
                </div>
              )}

              {!d.recibido_cliente ? (
                <button
                  className="btn-recibido"
                  onClick={() => handleRecibido(d.id_pedido)}
                  disabled={updating[d.id_pedido]}
                >
                  {updating[d.id_pedido] ? 'Marcando...' : 'Marcar como recibido'}
                </button>
              ) : (
                <span className="pedido-recibido">Pedido recibido ✅</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

HistorialDomiciliosUI.propTypes = {
  domicilios: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  updating: PropTypes.object.isRequired,
  marcandoRecibido: PropTypes.object.isRequired,
  mensaje: PropTypes.object.isRequired,
  handleRecibido: PropTypes.func.isRequired,
  formatearEstado: PropTypes.func.isRequired,
  puedeMarcarComoRecibido: PropTypes.func.isRequired,
};

export default HistorialDomiciliosUI;
