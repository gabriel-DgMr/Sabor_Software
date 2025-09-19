import { useEffect, useState } from 'react';
import domicilioService from '../services/domicilioService';

const HistorialDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    domicilioService
      .getHistorialDomicilios()
      .then(res => setDomicilios(res.data))
      .catch(() => setDomicilios([]))
      .finally(() => setLoading(false));
  }, []);

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
        {domicilios.map(d => (
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
              Total:
              <span className="pedido-total-monto">${d.total || '0.00'}</span>
            </div>

            {d.recomendacion && (
              <div className="pedido-recomendaciones">
                <span>Nota:</span> {d.recomendacion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialDomicilios;
