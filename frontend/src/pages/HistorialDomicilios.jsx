import { useEffect, useState } from 'react';
import domicilioService from '../services/domicilioService';

const HistorialDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // Para manejar estados de botones individuales

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
      await domicilioService.marcarRecibido(id_pedido);
      // Actualizar la UI localmente
      setDomicilios((prev) =>
        prev.map((d) =>
          d.id_pedido === id_pedido ? { ...d, recibido_cliente: true } : d
        )
      );
    } catch (error) {
      console.error("Error al marcar pedido como recibido:", error);
      alert("No se pudo marcar como recibido. Intenta de nuevo.");
    } finally {
      setUpdating((prev) => ({ ...prev, [id_pedido]: false }));
    }
  };

  if (loading) return <div>Cargando...</div>;

  if (!domicilios || domicilios.length === 0) {
    return (
      <div className="historial-pedidos-bg">
        <div className="historial-pedidos-titulo">
          <h2>Historial de domicilios</h2>
        </div>
        <p className="mensaje-ejemplo">No tienes domicilios registrados.</p>
      </div>
    );
  }

  return (
    <div className="historial-pedidos-bg">
      <div className="historial-pedidos-titulo">
        <h2>Historial de domicilios</h2>
      </div>

      <div className="historial-pedidos-lista">
        {domicilios.map((d) => (
          <div key={d.id_pedido} className="pedido-tarjeta">
            <div className="pedido-tarjeta-header">
              <span className="pedido-fecha">{new Date(d.fecha_pedido).toLocaleString()}</span>
              <span className={`pedido-estado ${d.estado?.toLowerCase() || 'pendiente'}`}>
                {d.estado || 'pendiente'}
              </span>
            </div>

            <div className="pedido-productos">
              <h4>Dirección de entrega:</h4>
              <p className="producto-nombre">{d.direccion_entrega}</p>
            </div>

            <div className="pedido-total">
              Total: <span className="pedido-total-monto">${d.total || '0.00'}</span>
            </div>

            {d.recomendacion && (
              <div className="pedido-recomendaciones">
                <span>Nota:</span> {d.recomendacion}
              </div>
            )}

            {/* Botón de recibido */}
            {!d.recibido_cliente && (
              <button
                className="btn-recibido"
                onClick={() => handleRecibido(d.id_pedido)}
                disabled={updating[d.id_pedido]}
              >
                {updating[d.id_pedido] ? "Marcando..." : "Marcar como recibido"}
              </button>
            )}

            {d.recibido_cliente && (
              <span className="pedido-recibido">Pedido recibido ✅</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialDomicilios;
