import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { GoFilter, GoSync, GoTrash } from 'react-icons/go';

/**
 * FiltrosReservas - Panel de filtrado para la gestión de reservaciones con diseño Premium.
 * BEM: .gestion-reservas__filtros
 */
const FiltrosReservas = ({
  filtros,
  setFiltros,
  mostrarFiltros,
  setMostrarFiltros,
  limpiarFiltros,
  filtroHora,
  setFiltroHora,
  bloquesHorario,
  onRecargar,
}) => {
  const { t } = useTranslation();
  return (
    <div className="filtros-contenedor">
      <div className="filtros-cabecera">
        <h3 className="filtros-cabecera__titulo">{t('reservas.filtros.titulo')}</h3>
        <div className="gestion-reservas__acciones">
          <button
            className="boton boton--secundario"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <GoFilter />{' '}
            {mostrarFiltros ? t('reservas.filtros.ocultar') : t('reservas.filtros.mostrar')}
          </button>
          <button className="boton boton--peligro" onClick={limpiarFiltros}>
            <GoTrash /> {t('reservas.filtros.limpiar')}
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="filtros-cuadricula">
          <div className="filtro-campo">
            <label className="filtro-campo__label">{t('reservas.fecha')}</label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={e => setFiltros({ ...filtros, fecha: e.target.value })}
              className="filtro-campo__input"
            />
          </div>
          <div className="filtro-campo">
            <label className="filtro-campo__label">{t('reservas.estado')}</label>
            <select
              value={filtros.estado}
              onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
              className="filtro-campo__select"
            >
              <option value="todos">{t('reservas.filtros.todos_estados')}</option>
              <option value="PENDIENTE">⏳ {t('reservas.estados.pendiente')}</option>
              <option value="COMPLETADO">✅ {t('reservas.estados.completado')}</option>
              <option value="CANCELADO">❌ {t('reservas.estados.cancelado')}</option>
            </select>
          </div>
          <div className="filtro-campo">
            <label className="filtro-campo__label">{t('reservas.filtros.nombre_cliente')}</label>
            <input
              type="text"
              placeholder={t('reservas.filtros.nombre_placeholder')}
              value={filtros.nombre}
              onChange={e => setFiltros({ ...filtros, nombre: e.target.value })}
              className="filtro-campo__input"
            />
          </div>
          <div className="filtro-campo">
            <label className="filtro-campo__label">{t('telefono')}</label>
            <input
              type="text"
              placeholder={t('reservas.filtros.telefono_placeholder')}
              value={filtros.telefono}
              onChange={e => setFiltros({ ...filtros, telefono: e.target.value })}
              className="filtro-campo__input"
            />
          </div>
        </div>
      )}

      <div
        className="filtros-cuadricula"
        style={{
          marginTop: '2.5rem',
          borderTop: '1px solid var(--neutral-100)',
          paddingTop: '2.5rem',
          alignItems: 'flex-end',
        }}
      >
        <div className="filtro-campo">
          <label className="filtro-campo__label">{t('reservas.filtros.filtro_rapido')}</label>
          <select
            value={filtroHora}
            onChange={e => setFiltroHora(e.target.value)}
            className="filtro-campo__select"
          >
            <option value="todos">{t('reservas.filtros.todos_horarios')}</option>
            {bloquesHorario?.map(b => (
              <option key={b.inicio} value={b.inicio}>
                {b.titulo}
              </option>
            ))}
          </select>
        </div>
        <button
          className="boton boton--primario"
          onClick={onRecargar}
          style={{ height: 'fit-content', padding: '1.4rem 2.5rem' }}
        >
          <GoSync /> {t('reservas.filtros.recargar')}
        </button>
      </div>
    </div>
  );
};

FiltrosReservas.propTypes = {
  filtros: PropTypes.object.isRequired,
  setFiltros: PropTypes.func.isRequired,
  mostrarFiltros: PropTypes.bool.isRequired,
  setMostrarFiltros: PropTypes.func.isRequired,
  limpiarFiltros: PropTypes.func.isRequired,
  filtroHora: PropTypes.string.isRequired,
  setFiltroHora: PropTypes.func.isRequired,
  bloquesHorario: PropTypes.array,
  onRecargar: PropTypes.func.isRequired,
};

export default FiltrosReservas;
