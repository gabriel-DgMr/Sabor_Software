import React from 'react';
import PropTypes from 'prop-types';
import MenuLateral from '../../dashboard/components/MenuLateralEmpleado';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import TarjetaReservacion from './TarjetaReservacion';
import EstadisticasReservas from './EstadisticasReservas';
import FiltrosReservas from './FiltrosReservas';
import '../styles/reservas.css';

const BLOQUES = [
  { titulo: 'RESERVACIONES DE 6:00 PM - 7:00 PM', inicio: 18, fin: 19 },
  { titulo: 'RESERVACIONES DE 7:00 PM - 8:00 PM', inicio: 19, fin: 20 },
  { titulo: 'RESERVACIONES DE 8:00 PM - 9:00 PM', inicio: 20, fin: 21 },
  { titulo: 'RESERVACIONES DE 9:00 PM - 10:00 PM', inicio: 21, fin: 22 },
];

/**
 * ReservacionesEmpleadosUI - Vista de gestión de reservas para empleados.
 * Reutiliza componentes del dominio reservas y sigue BEM en español.
 */
const ReservacionesEmpleadosUI = ({
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
  handleSubmit,
  estadisticas,
  cargarReservas,
  t,
}) => {
  const BLOQUES_LOCALIZADOS = [
    { titulo: `${t('reservas.bloques.manana')} (6:00 PM - 7:00 PM)`, inicio: 18, fin: 19 },
    { titulo: `${t('reservas.bloques.almuerzo')} (7:00 PM - 8:00 PM)`, inicio: 19, fin: 20 },
    { titulo: `${t('reservas.bloques.tarde')} (8:00 PM - 9:00 PM)`, inicio: 20, fin: 21 },
    { titulo: `${t('reservas.bloques.noche')} (9:00 PM - 10:00 PM)`, inicio: 21, fin: 22 },
  ];

  const formatearFechaString = fechaString => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString(t('locale_code', 'es-ES'), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const obtenerColorEstado = estado => {
    switch (estado) {
      case 'COMPLETADO':
        return 'var(--success-500)';
      case 'PENDIENTE':
        return 'var(--warning-500)';
      case 'CANCELADO':
        return 'var(--error-500)';
      default:
        return 'var(--neutral-500)';
    }
  };

  if (isLoading) {
    return (
      <div className="reservas-layout">
        <MenuLateral />
        <div className="reservas-contenido">
          <LoadingScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="reservas-layout">
      <MenuLateral />
      <main className="reservas-contenido">
        <header className="reservas-encabezado">
          <h1 className="reservas-titulo">
            {t('reservas.gestion.titulo')} ({t('empleado')})
          </h1>
          <p className="reservas-subtitulo">{t('reservas.gestion.subtitulo_empleado')}</p>
        </header>

        {successMessage && (
          <div className="alerta-autenticacion alerta-autenticacion--exito">{successMessage}</div>
        )}
        {error && (
          <div className="alerta-autenticacion alerta-autenticacion--error">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="boton-cerrar-alerta">
              ×
            </button>
          </div>
        )}

        <EstadisticasReservas estadisticas={estadisticas} />

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

        <section className="reservas-lista">
          {BLOQUES_LOCALIZADOS.map(bloque => {
            const rBloque = reservasFiltradas.filter(r => {
              const h = parseInt(r.hora_reservacion.split(':')[0]);
              return h >= bloque.inicio && h < bloque.fin;
            });
            if (rBloque.length === 0) return null;
            return (
              <div key={bloque.titulo} className="bloque-horario">
                <h2 className="bloque-horario__titulo">{bloque.titulo}</h2>
                <div className="bloque-horario__grid">
                  {rBloque.map(reserva => (
                    <TarjetaReservacion
                      key={reserva.id_reservacion}
                      reserva={reserva}
                      onActualizarEstado={actualizarEstadoReserva}
                      onEditar={handleEditReserva}
                      // Los empleados usualmente no eliminan, pero se mantiene si el hook lo soporta
                      onEliminar={null}
                      loadingStates={loadingStates}
                      formatearFecha={formatearFechaString}
                      obtenerColorEstado={obtenerColorEstado}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {isEditing && (
          <section className="filtros-reservas" style={{ marginTop: '2rem' }}>
            <h2 className="tarjeta-reservacion__nombre">{t('reservas.gestion.editar_titulo')}</h2>
            <form
              onSubmit={handleSubmit}
              className="formulario-autenticacion"
              style={{ marginTop: '1.5rem' }}
            >
              <div className="filtros-grid">
                <div className="filtro-grupo">
                  <label className="filtro-label">{t('reservas.filtros.nombre_cliente')}</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`filtro-input ${errors.nombre ? 'filtro-input--error' : ''}`}
                  />
                  {errors.nombre && <span className="reserva-grupo__error">{errors.nombre}</span>}
                </div>
                <div className="filtro-grupo">
                  <label className="filtro-label">{t('telefono')}</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`filtro-input ${errors.telefono ? 'filtro-input--error' : ''}`}
                  />
                  {errors.telefono && (
                    <span className="reserva-grupo__error">{errors.telefono}</span>
                  )}
                </div>
                <div className="filtro-grupo">
                  <label className="filtro-label">{t('reservas.personas')}</label>
                  <input
                    type="number"
                    name="numero_personas"
                    value={formData.numero_personas}
                    onChange={handleInputChange}
                    className={`filtro-input ${errors.numero_personas ? 'filtro-input--error' : ''}`}
                  />
                  {errors.numero_personas && (
                    <span className="reserva-grupo__error">{errors.numero_personas}</span>
                  )}
                </div>
                <div className="filtro-grupo">
                  <label className="filtro-label">{t('reservas.fecha')}</label>
                  <input
                    type="date"
                    name="fecha_reservacion"
                    value={formData.fecha_reservacion}
                    onChange={handleInputChange}
                    className={`filtro-input ${errors.fecha_reservacion ? 'filtro-input--error' : ''}`}
                  />
                  {errors.fecha_reservacion && (
                    <span className="reserva-grupo__error">{errors.fecha_reservacion}</span>
                  )}
                </div>
                <div className="filtro-grupo">
                  <label className="filtro-label">{t('reservas.hora')}</label>
                  <input
                    type="time"
                    name="hora_reservacion"
                    value={formData.hora_reservacion}
                    onChange={handleInputChange}
                    className={`filtro-input ${errors.hora_reservacion ? 'filtro-input--error' : ''}`}
                  />
                  {errors.hora_reservacion && (
                    <span className="reserva-grupo__error">{errors.hora_reservacion}</span>
                  )}
                </div>
              </div>

              <div
                className="reservacion-acciones"
                style={{ marginTop: '2rem', justifyContent: 'flex-end' }}
              >
                <button
                  type="submit"
                  className="boton boton--primario"
                  disabled={loadingStates.submit}
                >
                  {loadingStates.submit ? `${t('guardando')}...` : t('reservas.gestion.actualizar')}
                </button>
                <button
                  type="button"
                  className="boton boton--secundario"
                  onClick={limpiarFormulario}
                >
                  {t('cancelar')}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

ReservacionesEmpleadosUI.propTypes = {
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
  handleSubmit: PropTypes.func.isRequired,
  estadisticas: PropTypes.object.isRequired,
  cargarReservas: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ReservacionesEmpleadosUI;
