import React, { useState, useEffect } from 'react';

import MenuLateral from '../components/MenuLateralAdministrador';
import LoadingScreen from '../components/LoadingScreen';
import { GoCheck, GoX } from 'react-icons/go';
import '../styles/empleados.css';

// Componente de alerta visualmente consistente para reservaciones
const ReservacionesAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success' ? <GoCheck className="GoCheck" /> : <GoX className="GoX" />;
  return (
    <div className="alerta-con-tarjeta">
      {icon}
      <span>{message}</span>
    </div>
  );
};

// Componente de error visualmente consistente para administración de reservaciones
const ReservacionesError = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Reintentar</button>}
    </div>
  );
};

const ReservacionesAdministrador = () => {
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
  const [aplicandoFiltros, setAplicandoFiltros] = useState(false);

  // Estados para el formulario de reservaciones
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_reservacion: '',
    hora_reservacion: '',
    numero_personas: '',
    notas: '',
    estado: 'PENDIENTE',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    delete: {},
    edit: {},
    submit: false,
    confirm: {},
    cancel: {},
  });

  // Cargar reservas desde la base de datos
  useEffect(() => {
    cargarReservas();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    console.log('🔄 Aplicando filtros...');
    console.log('📊 Reservas totales:', reservas.length);
    setAplicandoFiltros(true);
    aplicarFiltros();
    setAplicandoFiltros(false);
  }, [reservas, filtros, filtroHora]);

  const cargarReservas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 Token obtenido:', token ? 'Sí' : 'No');
      console.log('🔍 Usuario actual:', user);
      console.log('🔍 Rol del usuario:', user.nombre_rol);

      const url = (import.meta.env.VITE_API_URL || '/api') + '/reservas';
      console.log('🔍 Haciendo petición a:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📊 Status de respuesta:', response.status);
      console.log('📊 Headers de respuesta:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);

        // Si es error de permisos, mostrar mensaje más específico
        if (response.status === 403) {
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: errorText };
          }

          if (errorData.code === 'INSUFFICIENT_PERMISSIONS') {
            throw new Error(
              `Acceso denegado: Tu rol actual (${user.nombre_rol || 'Usuario'}) no tiene permisos para gestionar reservas. Se requiere rol de Administrador o Empleado.`
            );
          }
        }

        throw new Error(`Error al cargar las reservas: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Número de reservaciones:', data ? data.length : 0);

      setReservas(data || []);
    } catch (error) {
      console.error('❌ Error al cargar reservas:', error);
      setError(`Error al cargar las reservas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para aplicar todos los filtros
  const aplicarFiltros = () => {
    console.log('🔍 Aplicando filtros a', reservas.length, 'reservaciones');
    let resultado = [...reservas];

    // Filtro por hora (bloque de tiempo)
    if (filtroHora !== 'todos') {
      const hora = parseInt(filtroHora);
      resultado = resultado.filter(r => {
        const horaReserva = parseInt(r.hora_reservacion.split(':')[0]);
        return horaReserva === hora;
      });
    }

    // Filtro por fecha
    if (filtros.fecha) {
      resultado = resultado.filter(r => {
        const fechaReserva = new Date(r.fecha_reservacion).toISOString().split('T')[0];
        return fechaReserva === filtros.fecha;
      });
    }

    // Filtro por estado
    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }

    // Filtro por nombre (búsqueda parcial)
    if (filtros.nombre && filtros.nombre.trim() !== '') {
      resultado = resultado.filter(r =>
        r.nombre.toLowerCase().includes(filtros.nombre.toLowerCase().trim())
      );
    }

    // Filtro por teléfono
    if (filtros.telefono && filtros.telefono.trim() !== '') {
      resultado = resultado.filter(r => r.telefono.includes(filtros.telefono.trim()));
    }

    // Filtro por email
    if (filtros.email && filtros.email.trim() !== '') {
      resultado = resultado.filter(r =>
        r.email.toLowerCase().includes(filtros.email.toLowerCase().trim())
      );
    }

    // Filtro por cantidad de personas (rango)
    if (filtros.personasMin && filtros.personasMin !== '') {
      const minPersonas = parseInt(filtros.personasMin);
      if (!isNaN(minPersonas)) {
        resultado = resultado.filter(r => r.numero_personas >= minPersonas);
      }
    }
    if (filtros.personasMax && filtros.personasMax !== '') {
      const maxPersonas = parseInt(filtros.personasMax);
      if (!isNaN(maxPersonas)) {
        resultado = resultado.filter(r => r.numero_personas <= maxPersonas);
      }
    }

    // Filtro por rango de horas
    if (filtros.horaInicio && filtros.horaInicio !== '') {
      const horaInicio = parseInt(filtros.horaInicio);
      if (!isNaN(horaInicio)) {
        resultado = resultado.filter(r => {
          const horaReserva = parseInt(r.hora_reservacion.split(':')[0]);
          return horaReserva >= horaInicio;
        });
      }
    }
    if (filtros.horaFin && filtros.horaFin !== '') {
      const horaFin = parseInt(filtros.horaFin);
      if (!isNaN(horaFin)) {
        resultado = resultado.filter(r => {
          const horaReserva = parseInt(r.hora_reservacion.split(':')[0]);
          return horaReserva <= horaFin;
        });
      }
    }

    console.log('✅ Filtros aplicados. Resultado:', resultado.length, 'reservaciones');
    setReservasFiltradas(resultado);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    console.log('🧹 Limpiando filtros...');
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
    // Los filtros se aplicarán automáticamente por el useEffect
  };

  // Función para manejar errores de campo
  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.add('fade-in');
      });
    }, 0);
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setErrors({}), 500);
    }, 3000);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para validar el formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.fecha_reservacion) {
      newErrors.fecha_reservacion = 'La fecha es obligatoria';
    } else {
      const fechaReserva = new Date(formData.fecha_reservacion);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaReserva < hoy) {
        newErrors.fecha_reservacion = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.hora_reservacion) {
      newErrors.hora_reservacion = 'La hora es obligatoria';
    }

    if (!formData.numero_personas) {
      newErrors.numero_personas = 'El número de personas es obligatorio';
    } else if (parseInt(formData.numero_personas) < 1 || parseInt(formData.numero_personas) > 20) {
      newErrors.numero_personas = 'El número de personas debe estar entre 1 y 20';
    }

    return newErrors;
  };

  // Función para editar una reserva
  const handleEditReserva = reserva => {
    setIsEditing(true);
    setEditingReservaId(reserva.id_reservacion);
    setFormData({
      nombre: reserva.nombre,
      telefono: reserva.telefono,
      email: reserva.email,
      fecha_reservacion: new Date(reserva.fecha_reservacion).toISOString().split('T')[0],
      hora_reservacion: reserva.hora_reservacion,
      numero_personas: reserva.numero_personas.toString(),
      notas: reserva.notas || '',
      estado: reserva.estado,
    });
    document.querySelector('.reservaciones__editor').scrollIntoView({ behavior: 'smooth' });
  };

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      fecha_reservacion: '',
      hora_reservacion: '',
      numero_personas: '',
      notas: '',
      estado: 'PENDIENTE',
    });
    setErrors({});
    setIsEditing(false);
    setEditingReservaId(null);
  };

  // Función para actualizar el estado de una reserva (confirmar, cancelar, etc.)
  const actualizarEstadoReserva = async (idReserva, nuevoEstado) => {
    try {
      // Determinar el tipo de acción para el estado de carga
      const actionType = nuevoEstado === 'COMPLETADO' ? 'confirm' : 'cancel';

      setLoadingStates(prev => ({
        ...prev,
        [actionType]: { ...prev[actionType], [idReserva]: true },
      }));

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${idReserva}/estado`, {
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

      // Mostrar mensaje de éxito
      const mensaje =
        nuevoEstado === 'COMPLETADO'
          ? 'Reserva confirmada exitosamente'
          : 'Reserva cancelada exitosamente';
      setSuccessMessage(mensaje);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      setError('Error al actualizar la reserva. Por favor, inténtalo de nuevo.');
    } finally {
      const actionType = nuevoEstado === 'COMPLETADO' ? 'confirm' : 'cancel';
      setLoadingStates(prev => ({
        ...prev,
        [actionType]: { ...prev[actionType], [idReserva]: false },
      }));
    }
  };

  // Función para eliminar una reserva
  const eliminarReserva = async idReserva => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      return;
    }

    try {
      setLoadingStates(prev => ({
        ...prev,
        delete: { ...prev.delete, [idReserva]: true },
      }));

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${idReserva}`, {
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
      setSuccessMessage('Reserva eliminada exitosamente');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      setError('Error al eliminar la reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        delete: { ...prev.delete, [idReserva]: false },
      }));
    }
  };

  // Función para enviar el formulario (crear o editar)
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, submit: true }));

    // Validar formulario
    const validationErrors = validarFormulario();
    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      setLoadingStates(prev => ({ ...prev, submit: false }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const datosParaEnviar = {
        ...formData,
        numero_personas: parseInt(formData.numero_personas),
      };

      let response;
      if (isEditing) {
        // Actualizar reserva existente
        response = await fetch(`/api/reservas/${editingReservaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosParaEnviar),
        });
      } else {
        // Crear nueva reserva
        response = await fetch('/api/reservas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosParaEnviar),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la reserva');
      }

      // Recargar las reservas
      await cargarReservas();

      // Mostrar mensaje de éxito
      setSuccessMessage(
        isEditing ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente'
      );

      // Limpiar formulario
      limpiarFormulario();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al procesar reserva:', error);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la reserva: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, submit: false }));
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
    { titulo: 'RESERVACIONES DE 7:00 AM - 8:00 AM', inicio: 7, fin: 8 },
    { titulo: 'RESERVACIONES DE 8:00 AM - 9:00 AM', inicio: 8, fin: 9 },
    { titulo: 'RESERVACIONES DE 9:00 AM - 10:00 AM', inicio: 9, fin: 10 },
    { titulo: 'RESERVACIONES DE 10:00 AM - 11:00 AM', inicio: 10, fin: 11 },
    { titulo: 'RESERVACIONES DE 11:00 AM - 12:00 PM', inicio: 11, fin: 12 },
    { titulo: 'RESERVACIONES DE 12:00 PM - 1:00 PM', inicio: 12, fin: 13 },
    { titulo: 'RESERVACIONES DE 1:00 PM - 2:00 PM', inicio: 13, fin: 14 },
    { titulo: 'RESERVACIONES DE 2:00 PM - 3:00 PM', inicio: 14, fin: 15 },
    { titulo: 'RESERVACIONES DE 3:00 PM - 4:00 PM', inicio: 15, fin: 16 },
    { titulo: 'RESERVACIONES DE 4:00 PM - 5:00 PM', inicio: 16, fin: 17 },
    { titulo: 'RESERVACIONES DE 5:00 PM - 6:00 PM', inicio: 17, fin: 18 },
    { titulo: 'RESERVACIONES DE 6:00 PM - 7:00 PM', inicio: 18, fin: 19 },
    { titulo: 'RESERVACIONES DE 7:00 PM - 8:00 PM', inicio: 19, fin: 20 },
    { titulo: 'RESERVACIONES DE 8:00 PM - 9:00 PM', inicio: 20, fin: 21 },
    { titulo: 'RESERVACIONES DE 9:00 PM - 10:00 PM', inicio: 21, fin: 22 },
    { titulo: 'RESERVACIONES DE 10:00 PM - 11:00 PM', inicio: 22, fin: 23 },
  ];

  const reservasPorBloque = (inicio, fin) => {
    return reservasFiltradas.filter(r => {
      const hora = parseInt(r.hora_reservacion.split(':')[0]);
      return hora >= inicio && hora < fin;
    });
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = estado => {
    switch (estado) {
      case 'COMPLETADO':
        return '#4CAF50';
      case 'PENDIENTE':
        return '#FF9800';
      case 'CANCELADO':
        return '#F44336';
      case 'EN PREPARACION':
        return '#2196F3';
      case 'CARRITO':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  // Obtener estadísticas de las reservas filtradas
  const obtenerEstadisticas = () => {
    const total = reservasFiltradas.length;
    const confirmadas = reservasFiltradas.filter(r => r.estado === 'COMPLETADO').length;
    const pendientes = reservasFiltradas.filter(r => r.estado === 'PENDIENTE').length;
    const canceladas = reservasFiltradas.filter(r => r.estado === 'CANCELADO').length;
    const totalPersonas = reservasFiltradas.reduce((sum, r) => sum + r.numero_personas, 0);

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
            <div className="reservaciones__error-content">
              <strong>Error:</strong> {error}
              {error.includes('Acceso denegado') && (
                <div className="reservaciones__error-help">
                  <h4>💡 ¿Cómo solucionar este problema?</h4>
                  <ul>
                    <li>
                      Contacta al administrador del sistema para que cambie tu rol a "Administrador"
                      o "Empleado"
                    </li>
                    <li>Solo los usuarios con estos roles pueden gestionar reservaciones</li>
                    <li>Tu rol actual no tiene los permisos necesarios para esta funcionalidad</li>
                  </ul>
                </div>
              )}
            </div>
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
                disabled={aplicandoFiltros}
              >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button
                className="reservaciones__boton-limpiar"
                onClick={limpiarFiltros}
                disabled={aplicandoFiltros}
              >
                {aplicandoFiltros ? 'Limpiando...' : 'Limpiar Filtros'}
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
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
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
                  <option value="7">7:00 AM</option>
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                  <option value="11">11:00 AM</option>
                  <option value="12">12:00 PM</option>
                  <option value="13">1:00 PM</option>
                  <option value="14">2:00 PM</option>
                  <option value="15">3:00 PM</option>
                  <option value="16">4:00 PM</option>
                  <option value="17">5:00 PM</option>
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20">8:00 PM</option>
                  <option value="21">9:00 PM</option>
                  <option value="22">10:00 PM</option>
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
                  <option value="7">7:00 AM</option>
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                  <option value="11">11:00 AM</option>
                  <option value="12">12:00 PM</option>
                  <option value="13">1:00 PM</option>
                  <option value="14">2:00 PM</option>
                  <option value="15">3:00 PM</option>
                  <option value="16">4:00 PM</option>
                  <option value="17">5:00 PM</option>
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20">8:00 PM</option>
                  <option value="21">9:00 PM</option>
                  <option value="22">10:00 PM</option>
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
              <option value="7">7:00 AM</option>
              <option value="8">8:00 AM</option>
              <option value="9">9:00 AM</option>
              <option value="10">10:00 AM</option>
              <option value="11">11:00 AM</option>
              <option value="12">12:00 PM</option>
              <option value="13">1:00 PM</option>
              <option value="14">2:00 PM</option>
              <option value="15">3:00 PM</option>
              <option value="16">4:00 PM</option>
              <option value="17">5:00 PM</option>
              <option value="18">6:00 PM</option>
              <option value="19">7:00 PM</option>
              <option value="20">8:00 PM</option>
              <option value="21">9:00 PM</option>
              <option value="22">10:00 PM</option>
            </select>
            <button
              className="reservaciones__boton-filtrar"
              onClick={cargarReservas}
              disabled={isLoading}
            >
              {isLoading ? 'CARGANDO...' : 'RECARGAR'}
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="reservaciones__estadisticas">
          {aplicandoFiltros && (
            <div className="reservaciones__filtros-aplicando">Aplicando filtros...</div>
          )}
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

        {/* Grid de Reservaciones */}
        <section className="reservaciones__grid">
          {/* Lista de Reservaciones */}
          <div className="reservaciones__lista-contenedor">
            {reservasFiltradas.length === 0 ? (
              <div className="reservaciones__vacio">
                {reservas.length === 0
                  ? 'No hay reservaciones registradas en este momento.'
                  : 'No se encontraron reservaciones con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'}
              </div>
            ) : (
              <section className="reservaciones__bloques">
                {bloques.map((bloque, i) => {
                  const reservasDelBloque = reservasPorBloque(bloque.inicio, bloque.fin);

                  if (reservasDelBloque.length === 0) {
                    return (
                      <div key={i} className="reservaciones__bloque">
                        <h2 className="reservaciones__bloque-titulo">{bloque.titulo}</h2>
                        <div className="reservaciones__vacio">
                          No hay reservaciones para este horario.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="reservaciones__bloque">
                      <h2 className="reservaciones__bloque-titulo">
                        {bloque.titulo}
                        <span className="reservaciones__bloque-contador">
                          {reservasDelBloque.length} reserva
                          {reservasDelBloque.length !== 1 ? 's' : ''}
                        </span>
                      </h2>
                      <div className="reservaciones__lista">
                        {reservasDelBloque.map(reserva => (
                          <div key={reserva.id_reservacion} className="reservacion--estado">
                            <div className="reservacion__contenido">
                              <div className="reservacion__info">
                                <div className="reservacion__nombre">
                                  <strong>Cliente:</strong> {reserva.nombre}
                                </div>
                                <div className="reservacion__mesa">
                                  <strong>Mesa:</strong> {reserva.numero_mesa || 'Por asignar'}
                                </div>
                                <div className="reservacion__fecha">
                                  <strong>Fecha:</strong>{' '}
                                  {formatearFecha(reserva.fecha_reservacion)}
                                </div>
                                <div className="reservacion__hora">
                                  <strong>Hora:</strong> {reserva.hora_reservacion}
                                </div>
                                <div className="reservacion__telefono">
                                  <strong>Teléfono:</strong> {reserva.telefono}
                                </div>
                                <div className="reservacion__email">
                                  <strong>Email:</strong> {reserva.email}
                                </div>
                                <div className="reservacion__peticiones">
                                  <strong>Personas:</strong> {reserva.numero_personas}
                                </div>
                                {reserva.notas && (
                                  <div className="reservacion__peticiones">
                                    <strong>Notas:</strong> {reserva.notas}
                                  </div>
                                )}
                                <div
                                  className="reservacion__estado"
                                  style={{ color: obtenerColorEstado(reserva.estado) }}
                                >
                                  <strong>Estado:</strong> {reserva.estado}
                                </div>
                              </div>
                              <div className="reservacion__acciones">
                                <button
                                  className="reservacion__boton reservacion__boton--editar"
                                  onClick={() => handleEditReserva(reserva)}
                                  disabled={
                                    loadingStates.confirm[reserva.id_reservacion] ||
                                    loadingStates.cancel[reserva.id_reservacion] ||
                                    loadingStates.edit[reserva.id_reservacion] ||
                                    loadingStates.delete[reserva.id_reservacion]
                                  }
                                >
                                  {loadingStates.edit[reserva.id_reservacion] ? (
                                    <span className="loading-indicator" />
                                  ) : (
                                    'Editar'
                                  )}
                                </button>
                                <button
                                  className="reservacion__boton reservacion__boton--confirmar"
                                  onClick={() =>
                                    actualizarEstadoReserva(reserva.id_reservacion, 'COMPLETADO')
                                  }
                                  disabled={
                                    loadingStates.confirm[reserva.id_reservacion] ||
                                    loadingStates.cancel[reserva.id_reservacion] ||
                                    loadingStates.edit[reserva.id_reservacion] ||
                                    loadingStates.delete[reserva.id_reservacion]
                                  }
                                >
                                  {loadingStates.confirm[reserva.id_reservacion] ? (
                                    <span className="loading-indicator" />
                                  ) : (
                                    'Confirmar'
                                  )}
                                </button>
                                <button
                                  className="reservacion__boton reservacion__boton--cancelar"
                                  onClick={() =>
                                    actualizarEstadoReserva(reserva.id_reservacion, 'CANCELADO')
                                  }
                                  disabled={
                                    loadingStates.confirm[reserva.id_reservacion] ||
                                    loadingStates.cancel[reserva.id_reservacion] ||
                                    loadingStates.edit[reserva.id_reservacion] ||
                                    loadingStates.delete[reserva.id_reservacion]
                                  }
                                >
                                  {loadingStates.cancel[reserva.id_reservacion] ? (
                                    <span className="loading-indicator" />
                                  ) : (
                                    'Cancelar'
                                  )}
                                </button>
                                <button
                                  className="reservacion__boton reservacion__boton--eliminar"
                                  onClick={() => eliminarReserva(reserva.id_reservacion)}
                                  disabled={
                                    loadingStates.confirm[reserva.id_reservacion] ||
                                    loadingStates.cancel[reserva.id_reservacion] ||
                                    loadingStates.edit[reserva.id_reservacion] ||
                                    loadingStates.delete[reserva.id_reservacion]
                                  }
                                >
                                  {loadingStates.delete[reserva.id_reservacion] ? (
                                    <span className="loading-indicator" />
                                  ) : (
                                    'Eliminar'
                                  )}
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
          </div>

          {/* Formulario de Reservaciones */}
          <article className="reservaciones__editor">
            <h2 className="editor__titulo">
              {isEditing ? 'Editar Reservación' : 'Agregar Nueva Reservación'}
            </h2>
            {successMessage && <ReservacionesAlert type="success" message={successMessage} />}
            <form className="editor__descripcion" onSubmit={handleSubmit}>
              <div className="descripcion__campo">
                <label className="campo_p">Nombre: </label>
                <input
                  className={`campo__input ${errors.nombre ? 'input--error' : ''}`}
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre completo del cliente"
                />
                {errors.nombre && (
                  <small className="formulario__mensaje-error">{errors.nombre}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Teléfono: </label>
                <input
                  className={`campo__input ${errors.telefono ? 'input--error' : ''}`}
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono (10 dígitos)"
                />
                {errors.telefono && (
                  <small className="formulario__mensaje-error">{errors.telefono}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Email: </label>
                <input
                  className={`campo__input ${errors.email ? 'input--error' : ''}`}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Correo electrónico"
                />
                {errors.email && (
                  <small className="formulario__mensaje-error">{errors.email}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Fecha: </label>
                <input
                  className={`campo__input ${errors.fecha_reservacion ? 'input--error' : ''}`}
                  name="fecha_reservacion"
                  type="date"
                  value={formData.fecha_reservacion}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.fecha_reservacion && (
                  <small className="formulario__mensaje-error">{errors.fecha_reservacion}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Hora: </label>
                <select
                  className={`campo__input campo__input--categoria ${errors.hora_reservacion ? 'input--error' : ''}`}
                  name="hora_reservacion"
                  value={formData.hora_reservacion}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona una hora</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
                {errors.hora_reservacion && (
                  <small className="formulario__mensaje-error">{errors.hora_reservacion}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Número de Personas: </label>
                <input
                  className={`campo__input ${errors.numero_personas ? 'input--error' : ''}`}
                  name="numero_personas"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numero_personas}
                  onChange={handleInputChange}
                  placeholder="Cantidad de personas"
                />
                {errors.numero_personas && (
                  <small className="formulario__mensaje-error">{errors.numero_personas}</small>
                )}
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Estado: </label>
                <select
                  className="campo__input campo__input--categoria"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="descripcion__campo">
                <label className="campo_p">Notas: </label>
                <textarea
                  className="campo__input campo__input--textaera"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales o peticiones especiales"
                  rows="3"
                />
              </div>

              <div className="editor__botones">
                <button
                  className={`descripcion__boton ${loadingStates.submit ? 'descripcion__boton--loading' : ''}`}
                  disabled={loadingStates.submit}
                  type="submit"
                >
                  {loadingStates.submit ? (
                    <span className="loading-indicator" />
                  ) : isEditing ? (
                    'Actualizar'
                  ) : (
                    'Confirmar'
                  )}
                </button>
                {isEditing && (
                  <button
                    className="descripcion__boton descripcion__boton--cancelar"
                    disabled={loadingStates.submit}
                    type="button"
                    onClick={limpiarFormulario}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
};

export default ReservacionesAdministrador;
