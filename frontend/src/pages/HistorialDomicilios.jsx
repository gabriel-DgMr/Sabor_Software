import { useEffect, useState } from 'react';
import domicilioService from '../services/domicilioService';
import Header from '../components/Header';
import { GoCheck, GoX } from 'react-icons/go';

const HistorialDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marcandoRecibido, setMarcandoRecibido] = useState({});
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    domicilioService
      .getHistorialDomicilios()
      .then(res => setDomicilios(res.data))
      .catch(() => setDomicilios([]))
      .finally(() => setLoading(false));
  }, []);

  const marcarComoRecibido = async idPedido => {
    try {
      setMarcandoRecibido(prev => ({ ...prev, [idPedido]: true }));

      await domicilioService.marcarComoRecibido(idPedido);

      // Actualizar el estado local
      setDomicilios(prev =>
        prev.map(domicilio =>
          domicilio.id_pedido === idPedido
            ? { ...domicilio, id_estado: 6, nombre_estado: 'Recibido' }
            : domicilio
        )
      );

      setMensaje({
        texto: '¡Domicilio marcado como recibido exitosamente!',
        tipo: 'success',
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      console.error('Error al marcar como recibido:', error);
      setMensaje({
        texto: error.response?.data?.message || 'Error al marcar como recibido',
        tipo: 'error',
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    } finally {
      setMarcandoRecibido(prev => ({ ...prev, [idPedido]: false }));
    }
  };

  const formatearEstado = estado => {
    const estadosMap = {
      Pendiente: 'Pendiente',
      'En Preparación': 'En Preparación',
      Completado: 'Completado',
      Cancelado: 'Cancelado',
      Recibido: 'Recibido',
    };
    return estadosMap[estado] || estado;
  };

  const puedeMarcarComoRecibido = estado => {
    return estado === 'Completado' || estado === 'completado';
  };

  if (loading)
    return (
      <>
        <Header />
        <div>Cargando...</div>
      </>
    );

  if (!domicilios || domicilios.length === 0) {
    return (
      <>
        <Header />
        <div className="historial-pedidos-bg">
          <div className="historial-pedidos-titulo">
            <h2>Historial de domicilios</h2>
          </div>
          <p className="mensaje-ejemplo">No tienes domicilios registrados.</p>
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

        {/* Mensaje de estado */}
        {mensaje.texto && (
          <div
            className={`mensaje ${mensaje.tipo === 'success' ? 'mensaje-success' : 'mensaje-error'}`}
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
                <h4>Dirección de entrega:</h4>
                <p className="producto-nombre">{d.direccion_entrega}</p>
                {d.detalle_direccion && (
                  <p className="producto-nombre">Detalle: {d.detalle_direccion}</p>
                )}
              </div>

              <div className="pedido-total">
                <h4>Total:</h4>
                <p className="producto-precio">${d.total_pedido?.toLocaleString()}</p>
              </div>

              {/* Botón para marcar como recibido */}
              {puedeMarcarComoRecibido(d.nombre_estado) && (
                <div className="pedido-acciones">
                  <button
                    className={`btn-marcar-recibido ${marcandoRecibido[d.id_pedido] ? 'cargando' : ''}`}
                    onClick={() => marcarComoRecibido(d.id_pedido)}
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

              {/* Mensaje para pedidos ya recibidos */}
              {d.nombre_estado === 'Recibido' && (
                <div className="pedido-recibido">
                  <GoCheck className="icono-recibido" />
                  <span>Domicilio recibido</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HistorialDomicilios;
