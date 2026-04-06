import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Header from '../../../shared/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import '../styles/historialReservas.css';

const HistorialReservasUI = ({ reservas, loading, error }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-message">{t('reservas.historial.cargando')}</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="historial-reservas">
        <h2>{t('reservas.historial.titulo')}</h2>
        {reservas.length === 0 ? (
          <p>{t('reservas.historial.sin_reservas')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('reservas.historial.tabla.fecha')}</th>
                <th>{t('reservas.historial.tabla.hora')}</th>
                <th>{t('reservas.historial.tabla.personas')}</th>
                <th>{t('reservas.historial.tabla.notas')}</th>
                <th>{t('reservas.historial.tabla.mesa')}</th>
                <th>{t('reservas.historial.tabla.estado')}</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(reserva => (
                <tr key={reserva.id_reservacion}>
                  <td>{reserva.fecha_reservacion}</td>
                  <td>{reserva.hora_reservacion}</td>
                  <td>{reserva.numero_personas}</td>
                  <td>{reserva.notas || '-'}</td>
                  <td>{reserva.id_mesa || '-'}</td>
                  <td>
                    <span
                      className={`estado-reserva ${reserva.id_estado === 1 ? 'activa' : 'finalizada'}`}
                    >
                      {reserva.id_estado === 1
                        ? t('reservas.estados.activa')
                        : t('reservas.estados.finalizada')}
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

HistorialReservasUI.propTypes = {
  reservas: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default HistorialReservasUI;
