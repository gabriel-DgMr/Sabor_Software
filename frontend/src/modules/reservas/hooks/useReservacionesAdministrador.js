import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import reservasService from '../services/reservas-service';
import { toast } from 'react-toastify';

export const useReservacionesAdministrador = () => {
  const [filtroHora, setFiltroHora] = useState('todos');
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    delete: {},
    edit: {},
    submit: false,
    confirm: {},
    cancel: {},
  });

  const cargarReservas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reservasService.getTodas();
      setReservas(data || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setError(`Error al cargar las reservas: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const aplicarFiltros = useCallback(() => {
    let resultado = [...reservas];

    if (filtroHora !== 'todos') {
      const hora = parseInt(filtroHora);
      resultado = resultado.filter(r => {
        const horaReserva = parseInt(r.hora_reservacion.split(':')[0]);
        return horaReserva === hora;
      });
    }

    if (filtros.fecha) {
      resultado = resultado.filter(r => {
        const fechaReserva = new Date(r.fecha_reservacion).toISOString().split('T')[0];
        return fechaReserva === filtros.fecha;
      });
    }

    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }

    if (filtros.nombre && filtros.nombre.trim() !== '') {
      resultado = resultado.filter(r =>
        r.nombre.toLowerCase().includes(filtros.nombre.toLowerCase().trim())
      );
    }

    if (filtros.telefono && filtros.telefono.trim() !== '') {
      resultado = resultado.filter(r => r.telefono.includes(filtros.telefono.trim()));
    }

    if (filtros.email && filtros.email.trim() !== '') {
      resultado = resultado.filter(r =>
        r.email.toLowerCase().includes(filtros.email.toLowerCase().trim())
      );
    }

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

    setReservasFiltradas(resultado);
  }, [reservas, filtros, filtroHora]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  useEffect(() => {
    setAplicandoFiltros(true);
    aplicarFiltros();
    setAplicandoFiltros(false);
  }, [aplicarFiltros]);

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

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prevErrors => {
        const nuevosErrores = { ...prevErrors };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }
  };

  const validarFormulario = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = t('reservas.errores.nombre');
    if (!formData.telefono.trim()) {
      newErrors.telefono = t('reservas.errores.telefono');
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = t('registro_telefono_invalido');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('reservas.errores.email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('registro_email_invalido');
    }
    if (!formData.fecha_reservacion) {
      newErrors.fecha_reservacion = t('reservas.errores.fecha');
    } else {
      const fechaReserva = new Date(formData.fecha_reservacion);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaReserva < hoy)
        newErrors.fecha_reservacion = t('security_invalid_date').replace(
          '{{field}}',
          t('reservas.fecha')
        );
    }
    if (!formData.hora_reservacion) newErrors.hora_reservacion = t('reservas.errores.hora');
    if (!formData.numero_personas) {
      newErrors.numero_personas = t('reservas.errores.personas');
    } else if (parseInt(formData.numero_personas) < 1 || parseInt(formData.numero_personas) > 20) {
      newErrors.numero_personas = t('reservas.errores.personas');
    }
    return newErrors;
  };

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.

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
  };

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

  const actualizarEstadoReserva = async (idReserva, nuevoEstado) => {
    try {
      const actionType = nuevoEstado === 'COMPLETADO' ? 'confirm' : 'cancel';
      setLoadingStates(prev => ({
        ...prev,
        [actionType]: { ...prev[actionType], [idReserva]: true },
      }));

      await reservasService.actualizarEstado(idReserva, nuevoEstado);

      await cargarReservas();
      toast.success(
        nuevoEstado === 'COMPLETADO'
          ? t('reservas.tarjeta.confirmar')
          : t('reservas.tarjeta.cancelar')
      );
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      const mensajeError = error.response?.data?.message || error.message || t('error_generico');
      toast.error(mensajeError);
    } finally {
      const actionType = nuevoEstado === 'COMPLETADO' ? 'confirm' : 'cancel';
      setLoadingStates(prev => ({
        ...prev,
        [actionType]: { ...prev[actionType], [idReserva]: false },
      }));
    }
  };

  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState(null);

  const eliminarReserva = idReserva => {
    setReservaAEliminar(idReserva);
    setConfirmEliminar(true);
  };

  const confirmarEliminacion = async () => {
    const idReserva = reservaAEliminar;
    setConfirmEliminar(false);
    setReservaAEliminar(null);
    if (!idReserva) return;

    try {
      setLoadingStates(prev => ({ ...prev, delete: { ...prev.delete, [idReserva]: true } }));

      await reservasService.eliminar(idReserva);

      await cargarReservas();
      toast.success(t('reservas.tarjeta.eliminar'));
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: { ...prev.delete, [idReserva]: false } }));
    }
  };

  const cancelarEliminacion = () => {
    setConfirmEliminar(false);
    setReservaAEliminar(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, submit: true }));
    const validationErrors = validarFormulario();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoadingStates(prev => ({ ...prev, submit: false }));
      return;
    }
    try {
      const datosParaEnviar = { ...formData, numero_personas: parseInt(formData.numero_personas) };

      if (isEditing) {
        await reservasService.actualizar(editingReservaId, datosParaEnviar);
      } else {
        await reservasService.crear(datosParaEnviar);
      }

      await cargarReservas();
      toast.success(isEditing ? t('reservas.gestion.actualizar') : t('reservas.gestion.guardar'));
      limpiarFormulario();
    } catch (error) {
      console.error('Error al procesar reserva:', error);
      const mensajeError = error.response?.data?.message || error.message || t('error_generico');
      toast.error(mensajeError);
    } finally {
      setLoadingStates(prev => ({ ...prev, submit: false }));
    }
  };

  const estadisticas = (() => {
    const total = reservasFiltradas.length;
    const confirmadas = reservasFiltradas.filter(r => r.estado === 'COMPLETADO').length;
    const pendientes = reservasFiltradas.filter(r => r.estado === 'PENDIENTE').length;
    const canceladas = reservasFiltradas.filter(r => r.estado === 'CANCELADO').length;
    const totalPersonas = reservasFiltradas.reduce((sum, r) => sum + r.numero_personas, 0);
    return { total, confirmadas, pendientes, canceladas, totalPersonas };
  })();

  return {
    filtroHora,
    setFiltroHora,
    filtros,
    setFiltros,
    mostrarFiltros,
    setMostrarFiltros,
    aplicandoFiltros,
    reservasFiltradas,
    isLoading,
    formData,
    setFormData,
    errors,
    setErrors,
    isEditing,
    loadingStates,
    limpiarFiltros,
    handleInputChange,
    handleEditReserva,
    limpiarFormulario,
    actualizarEstadoReserva,
    eliminarReserva,
    confirmarEliminacion,
    cancelarEliminacion,
    confirmEliminar,
    handleSubmit,
    estadisticas,
    cargarReservas,
    t,
  };
};

export default useReservacionesAdministrador;
