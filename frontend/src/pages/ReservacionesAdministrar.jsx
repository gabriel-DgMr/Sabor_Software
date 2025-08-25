import React, { useState, useEffect } from 'react';

import MenuLateral from '../components/MenuLateralAdministrador';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/empleados.css';

const ReservacionesAdministrar = () => {
  const [filtroHora, setFiltroHora] = useState('todos');
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: 'todos',
    nombre: '',
    telefono: '',
    email: '',
    personasMin: '',
    personasMax: '',
    horaInicio: '',
    horaFin: '',
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar reservas desde la base de datos
  useEffect(() => {
    cargarReservas();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [reservas, filtros, filtroHora]);

  const cargarReservas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservas/obtenerTodas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las reservas');
      }

      const data = await response.json();
      setReservas(data.reservas || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setError('Error al cargar las reservas. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para aplicar todos los filtros
  const aplicarFiltros = () => {
    let resultado = [...reservas];

    // Filtro por hora (bloque de tiempo)
    if (filtroHora !== 'todos') {
      const hora = parseInt(filtroHora);
      resultado = resultado.filter(r => {
        const horaReserva = parseInt(r.hora.split(':')[0]);
        return horaReserva === hora;
      });
    }

    // Filtro por fecha
    if (filtros.fecha) {
      resultado = resultado.filter(r => {
        const fechaReserva = new Date(r.fecha).toISOString().split('T')[0];
        return fechaReserva === filtros.fecha;
      });
    }

    // Filtro por estado
    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }

    // Filtro por nombre (búsqueda parcial)
    if (filtros.nombre) {
      resultado = resultado.filter(r =>
        r.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    // Filtro por teléfono
    if (filtros.telefono) {
      resultado = resultado.filter(r => r.telefono.includes(filtros.telefono));
    }

    // Filtro por email
    if (filtros.email) {
      resultado = resultado.filter(r =>
        r.email.toLowerCase().includes(filtros.email.toLowerCase())
      );
    }

    // Filtro por cantidad de personas (rango)
    if (filtros.personasMin) {
      resultado = resultado.filter(r => r.personas >= parseInt(filtros.personasMin));
    }
    if (filtros.personasMax) {
      resultado = resultado.filter(r => r.personas <= parseInt(filtros.personasMax));
    }

    // Filtro por rango de horas
    if (filtros.horaInicio) {
      resultado = resultado.filter(r => {
        const horaReserva = parseInt(r.hora.split(':')[0]);
        return horaReserva >= parseInt(filtros.horaInicio);
      });
    }
    if (filtros.horaFin) {
      resultado = resultado.filter(r => {
        const horaReserva = parseInt(r.hora.split(':')[0]);
        return horaReserva <= parseInt(filtros.horaFin);
      });
    }

    setReservasFiltradas(resultado);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      estado: 'todos',
      nombre: '',
      telefono: '',
      email: '',
      personasMin: '',
      personasMax: '',
      horaInicio: '',
      horaFin: '',
    });
    setFiltroHora('todos');
  };

  // Función para actualizar el estado de una reserva (confirmar, cancelar, etc.)
  const actualizarEstadoReserva = async (idReserva, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/actualizarEstado/${idReserva}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la reserva');
      }

      // Recargar las reservas para mostrar los cambios
      await cargarReservas();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      setError('Error al actualizar la reserva. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para eliminar una reserva
  const eliminarReserva = async idReserva => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/eliminar/${idReserva}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la reserva');
      }

      // Recargar las reservas para mostrar los cambios
      await cargarReservas();
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      setError('Error al eliminar la reserva. Por favor, inténtalo de nuevo.');
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = fechaString => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Agrupar reservas por bloques de hora
  const bloques = [
    { titulo: 'RESERVACIONES DE 6:00 PM - 7:00 PM', inicio: 18, fin: 19 },
    { titulo: 'RESERVACIONES DE 7:00 PM - 8:00 PM', inicio: 19, fin: 20 },
    { titulo: 'RESERVACIONES DE 8:00 PM - 9:00 PM', inicio: 20, fin: 21 },
    { titulo: 'RESERVACIONES DE 9:00 PM - 10:00 PM', inicio: 21, fin: 22 },
  ];

  const reservasPorBloque = (inicio, fin) => {
    return reservasFiltradas.filter(r => {
      const hora = parseInt(r.hora.split(':')[0]);
      return hora >= inicio && hora < fin;
    });
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = estado => {
    switch (estado) {
      case 'confirmada':
        return '#4CAF50';
      case 'pendiente':
        return '#FF9800';
      case 'cancelada':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // Obtener estadísticas de las reservas filtradas
  const obtenerEstadisticas = () => {
    const total = reservasFiltradas.length;
    const confirmadas = reservasFiltradas.filter(r => r.estado === 'confirmada').length;
    const pendientes = reservasFiltradas.filter(r => r.estado === 'pendiente').length;
    const canceladas = reservasFiltradas.filter(r => r.estado === 'cancelada').length;
    const totalPersonas = reservasFiltradas.reduce((sum, r) => sum + r.personas, 0);

    return { total, confirmadas, pendientes, canceladas, totalPersonas };
  };

  const estadisticas = obtenerEstadisticas();

  if (isLoading) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="reservaciones">
          <LoadingScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <MenuLateral />
      <main className="reservaciones">
        <h1 className="titulos__empleados">RESERVACIONES</h1>

        {error && (
          <div className="reservaciones__error">
            {error}
            <button className="reservaciones__error-close" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {/* Panel de Filtros */}
        <div className="reservaciones__filtros-panel">
          <div className="reservaciones__filtros-header">
            <h3 className="reservaciones__filtros-titulo">Filtros de Búsqueda</h3>
            <div className="reservaciones__filtros-botones">
              <button
                className="reservaciones__boton-filtros"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button className="reservaciones__boton-limpiar" onClick={limpiarFiltros}>
                Limpiar Filtros
              </button>
            </div>
          </div>

          {mostrarFiltros && (
            <div className="reservaciones__filtros-grid">
              {/* Filtro por fecha */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Fecha:</label>
                <input
                  type="date"
                  value={filtros.fecha}
                  onChange={e => setFiltros({ ...filtros, fecha: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por estado */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Estado:</label>
                <select
                  value={filtros.estado}
                  onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
                  className="reservaciones__filtro-select"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Filtro por nombre */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Nombre:</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={filtros.nombre}
                  onChange={e => setFiltros({ ...filtros, nombre: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por teléfono */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Teléfono:</label>
                <input
                  type="text"
                  placeholder="Buscar por teléfono..."
                  value={filtros.telefono}
                  onChange={e => setFiltros({ ...filtros, telefono: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por email */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Email:</label>
                <input
                  type="email"
                  placeholder="Buscar por email..."
                  value={filtros.email}
                  onChange={e => setFiltros({ ...filtros, email: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por cantidad de personas (mínimo) */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Personas (mín):</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Mínimo de personas..."
                  value={filtros.personasMin}
                  onChange={e => setFiltros({ ...filtros, personasMin: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por cantidad de personas (máximo) */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Personas (máx):</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Máximo de personas..."
                  value={filtros.personasMax}
                  onChange={e => setFiltros({ ...filtros, personasMax: e.target.value })}
                  className="reservaciones__filtro-input"
                />
              </div>

              {/* Filtro por hora inicio */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Hora desde:</label>
                <select
                  value={filtros.horaInicio}
                  onChange={e => setFiltros({ ...filtros, horaInicio: e.target.value })}
                  className="reservaciones__filtro-select"
                >
                  <option value="">Cualquier hora</option>
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20">8:00 PM</option>
                  <option value="21">9:00 PM</option>
                </select>
              </div>

              {/* Filtro por hora fin */}
              <div className="reservaciones__filtro-grupo">
                <label className="reservaciones__filtro-label">Hora hasta:</label>
                <select
                  value={filtros.horaFin}
                  onChange={e => setFiltros({ ...filtros, horaFin: e.target.value })}
                  className="reservaciones__filtro-select"
                >
                  <option value="">Cualquier hora</option>
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20">8:00 PM</option>
                  <option value="21">9:00 PM</option>
                </select>
              </div>
            </div>
          )}

          {/* Filtro rápido por bloque de hora */}
          <div className="reservaciones__filtro-rapido">
            <label className="reservaciones__filtro-rapido-label">Filtro rápido por hora:</label>
            <select
              value={filtroHora}
              onChange={e => setFiltroHora(e.target.value)}
              className="reservaciones__filtro-select"
            >
              <option value="todos">Todas las horas</option>
              <option value="18">6:00 PM</option>
              <option value="19">7:00 PM</option>
              <option value="20">8:00 PM</option>
              <option value="21">9:00 PM</option>
            </select>
            <button className="reservaciones__boton-filtrar" onClick={cargarReservas}>
              ACTUALIZAR
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="reservaciones__estadisticas">
          <div className="reservaciones__estadistica-item">
            <h4 className="reservaciones__estadistica-titulo reservaciones__estadistica-titulo--total">
              Total Reservas
            </h4>
            <p className="reservaciones__estadistica-valor reservaciones__estadistica-valor--total">
              {estadisticas.total}
            </p>
          </div>
          <div className="reservaciones__estadistica-item">
            <h4 className="reservaciones__estadistica-titulo reservaciones__estadistica-titulo--confirmadas">
              Confirmadas
            </h4>
            <p className="reservaciones__estadistica-valor reservaciones__estadistica-valor--confirmadas">
              {estadisticas.confirmadas}
            </p>
          </div>
          <div className="reservaciones__estadistica-item">
            <h4 className="reservaciones__estadistica-titulo reservaciones__estadistica-titulo--pendientes">
              Pendientes
            </h4>
            <p className="reservaciones__estadistica-valor reservaciones__estadistica-valor--pendientes">
              {estadisticas.pendientes}
            </p>
          </div>
          <div className="reservaciones__estadistica-item">
            <h4 className="reservaciones__estadistica-titulo reservaciones__estadistica-titulo--canceladas">
              Canceladas
            </h4>
            <p className="reservaciones__estadistica-valor reservaciones__estadistica-valor--canceladas">
              {estadisticas.canceladas}
            </p>
          </div>
          <div className="reservaciones__estadistica-item">
            <h4 className="reservaciones__estadistica-titulo reservaciones__estadistica-titulo--personas">
              Total Personas
            </h4>
            <p className="reservaciones__estadistica-valor reservaciones__estadistica-valor--personas">
              {estadisticas.totalPersonas}
            </p>
          </div>
        </div>

        {reservasFiltradas.length === 0 ? (
          <div className="reservaciones__vacio">
            {reservas.length === 0
              ? 'No hay reservas registradas en este momento.'
              : 'No se encontraron reservas con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'}
          </div>
        ) : (
          <section className="reservaciones__bloques">
            {bloques.map((bloque, i) => {
              const reservasDelBloque = reservasPorBloque(bloque.inicio, bloque.fin);

              if (reservasDelBloque.length === 0) return null;

              return (
                <div key={i} className="reservaciones__bloque">
                  <h2 className="reservaciones__bloque-titulo">
                    {bloque.titulo}
                    <span className="reservaciones__bloque-contador">
                      {reservasDelBloque.length} reserva{reservasDelBloque.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <div className="reservaciones__lista">
                    {reservasDelBloque.map(reserva => (
                      <div
                        key={reserva.id}
                        className="reservacion reservacion--estado"
                        style={{
                          borderColor: obtenerColorEstado(reserva.estado),
                        }}
                      >
                        <div className="reservacion__contenido">
                          <div className="reservacion__info">
                            <p className="reservacion__nombre">
                              <strong>Nombre:</strong> {reserva.nombre}
                            </p>
                            <p className="reservacion__mesa">
                              <strong>Personas:</strong> {reserva.personas}
                            </p>
                            <p className="reservacion__fecha">
                              <strong>Fecha:</strong> {formatearFecha(reserva.fecha)}
                            </p>
                            <p className="reservacion__hora">
                              <strong>Hora:</strong> {reserva.hora}
                            </p>
                            <p className="reservacion__telefono">
                              <strong>Teléfono:</strong> {reserva.telefono}
                            </p>
                            <p className="reservacion__email">
                              <strong>Email:</strong> {reserva.email}
                            </p>
                            {reserva.peticiones && (
                              <p className="reservacion__peticiones">
                                <strong>Peticiones:</strong> {reserva.peticiones}
                              </p>
                            )}
                            <p
                              className="reservacion__estado"
                              style={{
                                color: obtenerColorEstado(reserva.estado),
                              }}
                            >
                              Estado: {reserva.estado}
                            </p>
                          </div>
                          <div className="reservacion__acciones">
                            {reserva.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => actualizarEstadoReserva(reserva.id, 'confirmada')}
                                  className="reservacion__boton reservacion__boton--confirmar"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => actualizarEstadoReserva(reserva.id, 'cancelada')}
                                  className="reservacion__boton reservacion__boton--cancelar"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => eliminarReserva(reserva.id)}
                              className="reservacion__boton reservacion__boton--eliminar"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default ReservacionesAdministrar;
