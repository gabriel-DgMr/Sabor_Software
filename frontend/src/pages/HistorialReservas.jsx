import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/historialReservas.css';

const HistorialReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/reservas/historial', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservas(res.data);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            setError('No autorizado: Debes iniciar sesión para ver tu historial.');
          } else if (err.response.status === 403) {
            localStorage.removeItem('token');
            setError('Acceso prohibido: Token inválido o expirado. Por favor, inicia sesión nuevamente.');
          } else if (err.response.status === 404) {
            setError('No se encontró el recurso de historial de reservas.');
          } else if (err.response.status === 500) {
            setError('Error interno del servidor al obtener el historial.');
          } else {
            setError(`Error inesperado: ${err.response.statusText}`);
          }
        } else if (err.request) {
          setError('No se pudo conectar con el servidor.');
        } else {
          setError('Error desconocido al cargar el historial de reservaciones.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  if (loading) return (
    <div>
      <Header />
      <div className="loading-message">Cargando historial de reservaciones...</div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div>
      <Header />
      <div className="error-message">{error}</div>
      <Footer />
    </div>
  );

  return (
    <div>
      <Header />
      <div className="historial-reservas">
        <h2>Historial de Reservaciones</h2>
        {reservas.length === 0 ? (
          <p>No tienes reservaciones registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Personas</th>
                <th>Notas</th>
                <th>Mesa</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id_reservacion}>
                  <td>{reserva.fecha_reservacion}</td>
                  <td>{reserva.hora_reservacion}</td>
                  <td>{reserva.numero_personas}</td>
                  <td>{reserva.notas || '-'}</td>
                  <td>{reserva.id_mesa || '-'}</td>
                  <td>
                    <span className={`estado-reserva ${reserva.id_estado === 1 ? 'activa' : 'finalizada'}`}>
                      {reserva.id_estado === 1 ? 'Activa' : 'Finalizada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HistorialReservas; 