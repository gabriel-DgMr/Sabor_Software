import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import { GoCheck, GoX } from 'react-icons/go';
import { formatearFecha, formatearHora } from '../../../shared/utils/format.js';
import '../styles/historialDomicilios.css';

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
      <div className="historial-domicilios">
        <Header />
        <div className="historial-domicilios__contenedor">
          <div className="historial-domicilios__titulo">
            <h2>Cargando historial...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="historial-domicilios">
      <Header />
      <div className="historial-domicilios__contenedor">
        <div className="historial-domicilios__titulo">
          <h2>Historial de Mis Domicilios</h2>
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

        {!domicilios || domicilios.length === 0 ? (
          <div className="domicilios-vacio">
            <div className="domicilios-vacio__icono">🛵</div>
            <p className="domicilios-vacio__texto">No tienes domicilios registrados todavía.</p>
          </div>
        ) : (
          domicilios.map(d => (
            <article key={d.id_pedido} className="domicilio-tarjeta">
              <header className="domicilio-tarjeta__cabecera">
                <div className="domicilio-tarjeta__fecha">
                  <span className="domicilio-tarjeta__fecha-texto">
                    {formatearFecha(d.fecha_pedido)}
                  </span>
                  <span className="domicilio-tarjeta__fecha-subtexto">
                    {formatearHora(d.fecha_pedido)}
                  </span>
                </div>
                <div
                  className={`domicilio-tarjeta__estado domicilio-tarjeta__estado--${d.nombre_estado?.toLowerCase() || 'pendiente'}`}
                >
                  {formatearEstado(d.nombre_estado) || 'Pendiente'}
                </div>
              </header>

              <div className="domicilio-tarjeta__cuerpo">
                <div className="domicilio-tarjeta__info">
                  <section className="domicilio-tarjeta__info-seccion">
                    <h4 className="domicilio-tarjeta__subtitulo">Productos</h4>
                    <p className="domicilio-tarjeta__texto">
                      {d.productos_str || 'No hay productos registrados'}
                    </p>
                  </section>

                  <section
                    className="domicilio-tarjeta__info-seccion"
                    style={{ marginTop: '1.5rem' }}
                  >
                    <h4 className="domicilio-tarjeta__subtitulo">Dirección de entrega</h4>
                    <p className="domicilio-tarjeta__texto">{d.direccion_entrega}</p>
                    {d.detalle_direccion && (
                      <p
                        className="domicilio-tarjeta__texto"
                        style={{ opacity: 0.7, fontSize: '1.3rem' }}
                      >
                        Nota: {d.detalle_direccion}
                      </p>
                    )}
                  </section>
                </div>

                <aside className="domicilio-tarjeta__resumen">
                  <span className="domicilio-tarjeta__total-label">Inversión total</span>
                  <span className="domicilio-tarjeta__total-valor">
                    ${(d.total_pedido || d.total || 0).toLocaleString('es-CO')}
                  </span>
                </aside>
              </div>

              <div className="domicilio-tarjeta__acciones">
                {puedeMarcarComoRecibido(d.nombre_estado) ? (
                  <button
                    className="btn-recibido-premium"
                    onClick={() => handleRecibido(d.id_pedido)}
                    disabled={marcandoRecibido[d.id_pedido]}
                  >
                    {marcandoRecibido[d.id_pedido] ? (
                      <>
                        <div className="spinner-sabor" />
                        Marcando...
                      </>
                    ) : (
                      <>
                        <GoCheck />
                        Marcar como Recibido
                      </>
                    )}
                  </button>
                ) : (
                  d.nombre_estado?.toLowerCase() === 'recibido' && (
                    <div className="domicilio-recibido-check">
                      <GoCheck />
                      <span>Domicilio recibido</span>
                    </div>
                  )
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <Footer />
    </div>
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
