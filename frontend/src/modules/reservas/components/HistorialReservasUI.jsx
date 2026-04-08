import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Header from '../../../shared/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import { formatearFecha, formatearHora } from '../../../shared/utils/format.js';
import '../styles/historialReservas.css';

const HistorialReservasUI = ({ reservas, loading, error }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="historial-reservas">
        <Header />
        <div className="historial-reservas__contenedor">
          <div className="historial-reservas__titulo">
            <h2>{t('reservas.historial.cargando')}</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-reservas">
        <Header />
        <div className="historial-reservas__contenedor">
          <div className="historial-reservas__titulo">
            <h2>Error al cargar</h2>
          </div>
          <div className="reservas-vacias">
            <div className="reservas-vacias__icono">⚠️</div>
            <p className="reservas-vacias__texto">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="historial-reservas">
      <Header />
      <div className="historial-reservas__contenedor">
        <div className="historial-reservas__titulo">
          <h2>{t('reservas.historial.titulo')}</h2>
        </div>

        {reservas.length === 0 ? (
          <div className="reservas-vacias">
            <div className="reservas-vacias__icono">📅</div>
            <p className="reservas-vacias__texto">{t('reservas.historial.sin_reservas')}</p>
          </div>
        ) : (
          <div className="historial-reservas__tabla-wrapper">
            <table className="tabla-reservas">
              <thead className="tabla-reservas__cabecera">
                <tr>
                  <th>{t('reservas.historial.tabla.fecha')}</th>
                  <th>{t('reservas.historial.tabla.personas')}</th>
                  <th>{t('reservas.historial.tabla.notas')}</th>
                  <th>{t('reservas.historial.tabla.mesa')}</th>
                  <th>{t('reservas.historial.tabla.estado')}</th>
                </tr>
              </thead>
              <tbody className="tabla-reservas__cuerpo">
                {reservas.map(reserva => (
                  <tr key={reserva.id_reservacion} className="tabla-reservas__fila">
                    <td className="tabla-reservas__celda">
                      <div className="tabla-reservas__fecha">
                        <span className="tabla-reservas__fecha-dia">
                          {formatearFecha(reserva.fecha_reservacion)}
                        </span>
                        <span className="tabla-reservas__fecha-hora">
                          {formatearHora(`2000-01-01T${reserva.hora_reservacion}`)}
                        </span>
                      </div>
                    </td>
                    <td className="tabla-reservas__celda">
                      <div className="tabla-reservas__personas">👤 {reserva.numero_personas}</div>
                    </td>
                    <td className="tabla-reservas__celda">{reserva.notas || '-'}</td>
                    <td className="tabla-reservas__celda">{reserva.id_mesa || '-'}</td>
                    <td className="tabla-reservas__celda">
                      <span
                        className={`badge-estado badge-estado--${reserva.id_estado === 1 ? 'activa' : 'finalizada'}`}
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
          </div>
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
