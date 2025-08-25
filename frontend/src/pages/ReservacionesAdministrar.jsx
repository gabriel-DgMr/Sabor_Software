import React from 'react';
import { useTranslation } from 'react-i18next';

import MenuLateral from '../components/MenuLateralAdministrador.jsx';
import { useReservacionesAdmin } from '../hooks/useReservacionesAdmin.js';
import '../styles/empleados.css';

const ReservacionesAdministrar = () => {
  const { t } = useTranslation();
  const {
    reservacionesFiltradas,
    loading,
    error,
    fechaSeleccionada,
    setFechaSeleccionada,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    actualizarEstadoReservacion,
    eliminarReservacion,
    obtenerReservacionesPorHora,
    estadisticas,
  } = useReservacionesAdmin();

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoReservacion(id, nuevoEstado);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleEliminarReservacion = async id => {
    if (window.confirm('¿Está seguro de que desea eliminar esta reservación?')) {
      try {
        await eliminarReservacion(id);
      } catch (error) {
        console.error('Error al eliminar reservación:', error);
      }
    }
  };

  const formatearFecha = fecha => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="reservaciones">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando reservaciones...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="reservaciones">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </main>
      </div>
    );
  }

  const reservacionesPorHora = obtenerReservacionesPorHora();

  return (
    <div className="layout">
      <MenuLateral />
      <main className="reservaciones">
        <h1 className="titulos__empleados">RESERVACIONES</h1>

        {/* Filtros */}
        <div className="reservaciones__filtros">
          <div className="reservaciones__filtro-grupo">
            <label htmlFor="fecha">Fecha:</label>
            <input
              type="date"
              id="fecha"
              value={fechaSeleccionada}
              onChange={e => setFechaSeleccionada(e.target.value)}
              className="reservaciones__input-fecha"
            />
          </div>

          <div className="reservaciones__filtro-grupo">
            <label htmlFor="hora">Hora:</label>
            <select
              id="hora"
              value={filtros.hora}
              onChange={e => actualizarFiltros({ hora: e.target.value })}
              className="reservaciones__select"
            >
              <option value="todos">Todas las horas</option>
              {Array.from({ length: 11 }, (_, i) => i + 12).map(hora => (
                <option key={hora} value={hora}>
                  {hora.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div className="reservaciones__filtro-grupo">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              value={filtros.estado}
              onChange={e => actualizarFiltros({ estado: e.target.value })}
              className="reservaciones__select"
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <button onClick={limpiarFiltros} className="reservaciones__btn-limpiar">
            Limpiar Filtros
          </button>
        </div>

        {/* Información de la fecha */}
        <div className="reservaciones__info-fecha">
          <h2>Reservaciones para: {formatearFecha(fechaSeleccionada)}</h2>
          <div className="reservaciones__estadisticas">
            <p>
              <strong>Total:</strong> {estadisticas.total} reservaciones
            </p>
            <p>
              <strong>Promedio personas:</strong> {estadisticas.promedioPersonas.toFixed(1)}
            </p>
            <p>
              <strong>Confirmadas:</strong> {estadisticas.porEstado.confirmada || 0}
            </p>
            <p>
              <strong>Pendientes:</strong> {estadisticas.porEstado.pendiente || 0}
            </p>
          </div>
        </div>

        {/* Bloques de reservaciones */}
        <section className="reservaciones__bloques">
          {Object.entries(reservacionesPorHora).map(([hora, reservaciones]) => (
            <div key={hora} className="reservaciones__bloque">
              <h2 className="reservaciones__bloque-titulo">
                RESERVACIONES DE {hora}:00 - {(parseInt(hora) + 1).toString().padStart(2, '0')}:00
              </h2>
              <div className="reservaciones__lista">
                {reservaciones.map(reservacion => (
                  <div key={reservacion.id_reservacion} className="reservacion">
                    <div className="reservacion__info">
                      <p className="reservacion__nombre">
                        <strong>Cliente:</strong> {reservacion.nombre_cliente}
                      </p>
                      <p className="reservacion__mesa">
                        <strong>Mesa:</strong> {reservacion.numero_mesa}
                      </p>
                      <p className="reservacion__hora">
                        <strong>Hora:</strong> {reservacion.hora_reservacion}
                      </p>
                      <p className="reservacion__personas">
                        <strong>Personas:</strong> {reservacion.numero_personas}
                      </p>
                      <p className="reservacion__estado">
                        <strong>Estado:</strong>
                        <span className={`estado-${reservacion.estado}`}>{reservacion.estado}</span>
                      </p>
                      {reservacion.notas && (
                        <p className="reservacion__notas">
                          <strong>Notas:</strong> {reservacion.notas}
                        </p>
                      )}
                    </div>

                    <div className="reservacion__acciones">
                      <select
                        value={reservacion.estado}
                        onChange={e =>
                          handleCambiarEstado(reservacion.id_reservacion, e.target.value)
                        }
                        className="reservacion__select-estado"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>

                      <button
                        onClick={() => handleEliminarReservacion(reservacion.id_reservacion)}
                        className="reservacion__btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {reservacionesFiltradas.length === 0 && (
          <div className="reservaciones__vacio">
            <p>No hay reservaciones para la fecha seleccionada.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReservacionesAdministrar;
