import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import MenuLateral from '../../dashboard/components/MenuLateralAdministrador';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import TarjetaReservacion from './TarjetaReservacion';
import EstadisticasReservas from './EstadisticasReservas';
import FiltrosReservas from './FiltrosReservas';
import { formatearFecha } from '../../../shared/utils/format.js';
import '../styles/gestion-reservas.css';

const BLOQUES = [
  { titulo: 'MAÑANA (7:00 AM - 11:00 AM)', inicio: 7, fin: 11 },
  { titulo: 'ALMUERZO (11:00 AM - 3:00 PM)', inicio: 11, fin: 15 },
  { titulo: 'TARDE (3:00 PM - 7:00 PM)', inicio: 15, fin: 19 },
  { titulo: 'NOCHE (7:00 PM - 11:00 PM)', inicio: 19, fin: 23 },
];

/**
 * ReservacionesAdministradorUI - Vista de gestión de reservas rediseñada (Premium).
 * BEM: .gestion-reservas, .tarjeta-reserva, .bloque-tiempo
 */
const ReservacionesAdministradorUI = ({
  filtroHora,
  setFiltroHora,
  filtros,
  setFiltros,
  mostrarFiltros,
  setMostrarFiltros,
  reservasFiltradas,
  isLoading,
  error,
  setError,
  formData,
  errors,
  successMessage,
  isEditing,
  loadingStates,
  limpiarFiltros,
  handleInputChange,
  handleEditReserva,
  limpiarFormulario,
  actualizarEstadoReserva,
  eliminarReserva,
  handleSubmit,
  estadisticas,
  cargarReservas,
  t,
}) => {
  const mainRef = useRef(null);

  const BLOQUES_LOCALIZADOS = [
    { titulo: `${t('reservas.bloques.manana')} (7:00 AM - 11:00 AM)`, inicio: 7, fin: 11 },
    { titulo: `${t('reservas.bloques.almuerzo')} (11:00 AM - 3:00 PM)`, inicio: 11, fin: 15 },
    { titulo: `${t('reservas.bloques.tarde')} (3:00 PM - 7:00 PM)`, inicio: 15, fin: 19 },
    { titulo: `${t('reservas.bloques.noche')} (7:00 PM - 11:00 PM)`, inicio: 19, fin: 23 },
  ];

  useEffect(() => {
    if (!isLoading && mainRef.current) {
      gsap.fromTo(
        '.gestion-reservas > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [isLoading]);

  const formatearFechaString = fechaString => {
    return formatearFecha(fechaString, {
      weekday: 'short',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <LoadingScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal" ref={mainRef}>
        <div className="gestion-reservas">
          {/* Cabecera Premium */}
          <header className="gestion-reservas__cabecera">
            <div className="gestion-reservas__info">
              <h1 className="gestion-reservas__titulo">{t('reservas.gestion.titulo')}</h1>
              <p className="gestion-reservas__subtitulo">{t('reservas.gestion.subtitulo')}</p>
            </div>
            {successMessage && (
              <div className="notificacion notificacion--exito">{successMessage}</div>
            )}
            {error && (
              <div className="notificacion notificacion--error">
                {error} <button onClick={() => setError(null)}>✕</button>
              </div>
            )}
          </header>

          {/* Estadísticas */}
          <section className="gestion-reservas__estadisticas">
            <EstadisticasReservas estadisticas={estadisticas} />
          </section>

          {/* Filtros */}
          <section className="gestion-reservas__filtros">
            <FiltrosReservas
              filtros={filtros}
              setFiltros={setFiltros}
              mostrarFiltros={mostrarFiltros}
              setMostrarFiltros={setMostrarFiltros}
              limpiarFiltros={limpiarFiltros}
              filtroHora={filtroHora}
              setFiltroHora={setFiltroHora}
              bloquesHorario={BLOQUES_LOCALIZADOS}
              onRecargar={cargarReservas}
            />
          </section>

          {/* Lista de Reservas por Bloques */}
          <section className="gestion-reservas__lista">
            {BLOQUES_LOCALIZADOS.map(bloque => {
              const rBloque = reservasFiltradas.filter(r => {
                const h = parseInt(r.hora_reservacion.split(':')[0]);
                return h >= bloque.inicio && h < bloque.fin;
              });

              if (rBloque.length === 0) return null;

              return (
                <div key={bloque.titulo} className="bloque-tiempo">
                  <h2 className="bloque-tiempo__titulo">{bloque.titulo}</h2>
                  <div className="bloque-tiempo__cuadricula">
                    {rBloque.map(reserva => (
                      <TarjetaReservacion
                        key={reserva.id_reservacion}
                        reserva={reserva}
                        onActualizarEstado={actualizarEstadoReserva}
                        onEditar={handleEditReserva}
                        onEliminar={eliminarReserva}
                        loadingStates={loadingStates}
                        formatearFecha={formatearFechaString}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {reservasFiltradas.length === 0 && (
              <div className="estado-vacio">
                <p>{t('reservas.gestion.sin_reservas')}</p>
              </div>
            )}
          </section>

          {/* Formulario de Edición/Creación */}
          <section className="gestion-reservas__formulario">
            <div className="formulario-reserva-card">
              <h2 className="formulario-reserva-card__titulo">
                {isEditing
                  ? t('reservas.gestion.editar_titulo')
                  : t('reservas.gestion.nuevo_titulo')}
              </h2>
              <form onSubmit={handleSubmit} className="formulario-cuadricula">
                <div className="filtros-cuadricula">
                  <div className="filtro-campo">
                    <label className="filtro-campo__label">
                      {t('reservas.filtros.nombre_cliente')}
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`filtro-campo__input ${errors.nombre ? 'filtro-campo__input--error' : ''}`}
                      placeholder={t('reservas.filtros.nombre_placeholder')}
                    />
                    {errors.nombre && <span className="filtro-campo__error">{errors.nombre}</span>}
                  </div>
                  <div className="filtro-campo">
                    <label className="filtro-campo__label">{t('telefono')}</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`filtro-campo__input ${errors.telefono ? 'filtro-campo__input--error' : ''}`}
                      placeholder="300 000 0000"
                    />
                    {errors.telefono && (
                      <span className="filtro-campo__error">{errors.telefono}</span>
                    )}
                  </div>
                  <div className="filtro-campo">
                    <label className="filtro-campo__label">{t('reservas.personas')}</label>
                    <input
                      type="number"
                      name="numero_personas"
                      value={formData.numero_personas}
                      onChange={handleInputChange}
                      className={`filtro-campo__input ${errors.numero_personas ? 'filtro-campo__input--error' : ''}`}
                      min="1"
                    />
                    {errors.numero_personas && (
                      <span className="filtro-campo__error">{errors.numero_personas}</span>
                    )}
                  </div>
                  <div className="filtro-campo">
                    <label className="filtro-campo__label">{t('reservas.fecha')}</label>
                    <input
                      type="date"
                      name="fecha_reservacion"
                      value={formData.fecha_reservacion}
                      onChange={handleInputChange}
                      className={`filtro-campo__input ${errors.fecha_reservacion ? 'filtro-campo__input--error' : ''}`}
                    />
                    {errors.fecha_reservacion && (
                      <span className="filtro-campo__error">{errors.fecha_reservacion}</span>
                    )}
                  </div>
                  <div className="filtro-campo">
                    <label className="filtro-campo__label">{t('reservas.hora')}</label>
                    <input
                      type="time"
                      name="hora_reservacion"
                      value={formData.hora_reservacion}
                      onChange={handleInputChange}
                      className={`filtro-campo__input ${errors.hora_reservacion ? 'filtro-campo__input--error' : ''}`}
                    />
                    {errors.hora_reservacion && (
                      <span className="filtro-campo__error">{errors.hora_reservacion}</span>
                    )}
                  </div>
                </div>

                <div
                  className="gestion-reservas__acciones"
                  style={{ marginTop: '3rem', justifyContent: 'center' }}
                >
                  <button
                    type="submit"
                    className="boton boton--primario"
                    disabled={loadingStates.submit}
                    style={{ padding: '1.5rem 4rem' }}
                  >
                    {loadingStates.submit ? `${t('guardando')}...` : t('reservas.gestion.guardar')}
                  </button>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={limpiarFormulario}
                    style={{ padding: '1.5rem 4rem' }}
                  >
                    {t('cancelar')}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

ReservacionesAdministradorUI.propTypes = {
  filtroHora: PropTypes.string.isRequired,
  setFiltroHora: PropTypes.func.isRequired,
  filtros: PropTypes.object.isRequired,
  setFiltros: PropTypes.func.isRequired,
  mostrarFiltros: PropTypes.bool.isRequired,
  setMostrarFiltros: PropTypes.func.isRequired,
  reservasFiltradas: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  successMessage: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  loadingStates: PropTypes.object.isRequired,
  limpiarFiltros: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleEditReserva: PropTypes.func.isRequired,
  limpiarFormulario: PropTypes.func.isRequired,
  actualizarEstadoReserva: PropTypes.func.isRequired,
  eliminarReserva: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  estadisticas: PropTypes.object.isRequired,
  cargarReservas: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ReservacionesAdministradorUI;
