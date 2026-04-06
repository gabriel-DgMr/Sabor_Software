import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { GoCalendar, GoCheck, GoClock, GoPeople } from 'react-icons/go';

/**
 * EstadisticasReservas - Muestra métricas clave de las reservaciones con diseño Premium.
 * BEM: .tarjeta-metrica
 */
const EstadisticasReservas = ({ estadisticas }) => {
  const { t } = useTranslation();
  const { total, confirmadas, pendientes, totalPersonas } = estadisticas;

  const metricas = [
    {
      titulo: t('reservas.estadisticas.total'),
      valor: total,
      icono: <GoCalendar />,
      color: 'var(--naranja-sabor)',
      bg: '#fff5eb',
    },
    {
      titulo: t('reservas.estados.completado'),
      valor: confirmadas,
      icono: <GoCheck />,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      titulo: t('reservas.estados.pendiente'),
      valor: pendientes,
      icono: <GoClock />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      titulo: t('reservas.estadisticas.personas'),
      valor: totalPersonas,
      icono: <GoPeople />,
      color: '#6366f1',
      bg: '#eef2ff',
    },
  ];

  return (
    <>
      {metricas.map((metrica, index) => (
        <div
          key={index}
          className="tarjeta-metrica"
          style={{ '--color-metrica': metrica.color, '--bg-metrica': metrica.bg }}
        >
          <div className="tarjeta-metrica__cabecera">
            <div className="tarjeta-metrica__icono">{metrica.icono}</div>
            <span className="tarjeta-metrica__titulo">{metrica.titulo}</span>
          </div>
          <h2 className="tarjeta-metrica__valor">{metrica.valor}</h2>
        </div>
      ))}
    </>
  );
};

EstadisticasReservas.propTypes = {
  estadisticas: PropTypes.shape({
    total: PropTypes.number,
    confirmadas: PropTypes.number,
    pendientes: PropTypes.number,
    totalPersonas: PropTypes.number,
  }).isRequired,
};

export default EstadisticasReservas;
