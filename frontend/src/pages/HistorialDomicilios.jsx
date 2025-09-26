import { useEffect, useState } from 'react';
import domicilioService from '../services/domicilioService';
import Header from '../components/Header';
import { GoCheck, GoX } from 'react-icons/go';

const HistorialDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // Para manejar estados de botones individuales
  const [marcandoRecibido, setMarcandoRecibido] = useState({});
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Cargar historial
  const fetchDomicilios = async () => {
    try {
      setLoading(true);
      const res = await domicilioService.getHistorialDomicilios();
      setDomicilios(res.data);
    } catch (error) {
      setDomicilios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomicilios();
  }, []);

  // Marcar como recibido
  const handleRecibido = async (id_pedido) => {
    try {
      setUpdating((prev) => ({ ...prev, [id_pedido]: true }));
      setMarcandoRecibido(prev => ({ ...prev, [id_pedido]: true }));

      await domicilioService.marcarComoRecibido(id_pedido);

      // Actualizar el estado local
      setDomicilios((prev) =>
        prev.map((d) =>
          d.id_pedido === id_pedido 
            ? { ...d, recibido_cliente: true, id_estado: 6, nombre_estado: 'Recibido' } 
            : d
        )
      );

      setMensaje({
        texto: '¡Domicilio marcado como recibido exitosamente!',
        tipo: 'success',
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      console.error("Error al marcar pedido como recibido:", error);
      setMensaje({
        texto: error.response?.data?.message || 'Error al marcar como recibido',
        tipo: 'error',
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    } finally {
      setUpdating((prev) => ({ ...prev, [id_pedido]: false }));
      setMarcandoRecibido(prev => ({ ...prev, [id_pedido]: false }));
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
    return estado && estado.toLowerCase() === 'completado';
  };

  if (loading)
    return (
      <>
        <Header />
        <div>Cargando...</div>
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
          {domicilios.map((d) => (
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
                <p className="producto-precio">${(d.total_pedido || d.total || 0).toLocaleString()}</p>
              </div>

              {/* Botón para marcar como recibido */}
              {puedeMarcarComoRecibido(d.nombre_estado) && (
                <div className="pedido-acciones">
                  <button
                    className={`btn-marcar-recibido ${marcandoRecibido[d.id_pedido] ? 'cargando' : ''}`}
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

              {/* Mensaje para pedidos ya recibidos */}
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
                  {updating[d.id_pedido] ? "Marcando..." : "Marcar como recibido"}
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

export default HistorialDomicilios;
