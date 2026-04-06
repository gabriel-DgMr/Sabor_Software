import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import reservasService from '../services/reservas-service';
import {
  validarEmail,
  validarTelefono,
  validarLongitud,
  validarCaracteresEspeciales,
  validarEspaciosInicioFinal,
} from '../../../shared/utils/validaciones.js';
import {
  VISIBLE_DURATION,
  ANIM_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils.js';

export const useReservas = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    personas: '',
    fecha: '',
    hora: '',
    nombre: '',
    telefono: '',
    email: '',
    peticiones: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const cargarFechasDisponibles = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/horarios/fechas-disponibles?lang=${i18n.language}`
      );
      const data = await response.json();
      setFechasDisponibles(data.fechasDisponibles);
    } catch (error) {
      console.error('Error al cargar fechas disponibles:', error);
    }
  }, [i18n.language]);

  const cargarHorariosDisponibles = useCallback(
    async fecha => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || '/api'}/horarios/disponibles?fecha=${fecha}`
        );
        const data = await response.json();
        const ahora = new Date();

        const horariosFiltrados = data.horariosDisponibles.map(horario => {
          const horarioDate = new Date(`${fecha}T${horario.hora}`);
          let disponible = horario.disponible;
          if (!Number.isNaN(horarioDate.getTime())) {
            disponible = disponible && horarioDate.getTime() > ahora.getTime();
          }
          return { ...horario, disponible };
        });

        setHorariosDisponibles(horariosFiltrados);

        if (selectedTime) {
          const horarioSeleccionadoEsValido = horariosFiltrados.some(
            h => h.hora === selectedTime && h.disponible
          );
          if (!horarioSeleccionadoEsValido) {
            setSelectedTime(null);
            setFormData(prev => ({ ...prev, hora: '' }));
          }
        }
      } catch (error) {
        console.error('Error al cargar horarios disponibles:', error);
      }
    },
    [selectedTime]
  );

  useEffect(() => {
    document.title = 'Sabor: Reservas';
    cargarFechasDisponibles();
    const intervalId = setInterval(() => {
      cargarFechasDisponibles();
      if (selectedDate) {
        cargarHorariosDisponibles(selectedDate);
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [selectedDate, cargarFechasDisponibles, cargarHorariosDisponibles]);

  useEffect(() => {
    if (selectedDate) {
      cargarHorariosDisponibles(selectedDate);
    }
  }, [selectedDate, cargarHorariosDisponibles]);

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.

  const validateStep1 = () => {
    const errors = {};
    if (!formData.personas || formData.personas <= 0)
      errors.personas = t('reservas.errores.personas');
    if (!selectedDate) errors.fecha = t('reservas.errores.fecha');
    if (!selectedTime) errors.hora = t('reservas.errores.hora');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.nombre) {
      errors.nombre = t('reservas.errores.nombre');
    } else {
      const resp =
        validarLongitud(formData.nombre, 'nombre', 2, 50) ||
        validarCaracteresEspeciales(formData.nombre, 'nombre') ||
        validarEspaciosInicioFinal(formData.nombre, 'nombre');
      if (resp) errors.nombre = resp;
    }

    if (!formData.telefono) {
      errors.telefono = t('reservas.errores.telefono');
    } else {
      const resp =
        validarTelefono(formData.telefono) ||
        validarEspaciosInicioFinal(formData.telefono, 'teléfono');
      if (resp) errors.telefono = resp;
    }

    if (!formData.email) {
      errors.email = t('reservas.errores.email');
    } else {
      const resp =
        validarEmail(formData.email) || validarEspaciosInicioFinal(formData.email, 'email');
      if (resp) errors.email = resp;
    }

    manejarErroresDeCampo(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    if (formData.peticiones && formData.peticiones.trim() !== '') {
      const resp =
        validarLongitud(formData.peticiones, 'peticiones', 5, 500) ||
        validarCaracteresEspeciales(formData.peticiones, 'peticiones') ||
        validarEspaciosInicioFinal(formData.peticiones, 'peticiones');
      if (resp) errors.peticiones = resp;
    }
    manejarErroresDeCampo(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'personas' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleNextStep = async () => {
    setFormErrors({});
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    } else if (step === 4) {
      try {
        setIsLoading(true);
        const requestData = {
          ...formData,
          personas: parseInt(formData.personas),
          lang: i18n.language,
        };

        await reservasService.crear(requestData);
        setIsLoading(false);
        toast.success(t('reservas.exito'));
        setTimeout(() => {
          setFormData({
            personas: '',
            fecha: '',
            hora: '',
            nombre: '',
            telefono: '',
            email: '',
            peticiones: '',
          });
          setSelectedDate(null);
          setSelectedTime(null);
          setStep(1);
        }, 2000);
      } catch (error) {
        setIsLoading(false);
        toast.error(error.response?.data?.message || 'Error al realizar la reserva.');
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setFormErrors({});
    }
  };

  const handleDateSelect = selectedDay => {
    setSelectedDate(selectedDay);
    setFormData(prevState => ({ ...prevState, fecha: selectedDay }));
    if (formErrors.fecha)
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.fecha;
        return newErrors;
      });
  };

  const handleTimeSelect = selectedTimeValue => {
    setSelectedTime(selectedTimeValue);
    setFormData(prevState => ({ ...prevState, hora: selectedTimeValue }));
    if (formErrors.hora)
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.hora;
        return newErrors;
      });
  };

  return {
    step,
    formData,
    setFormData,
    formErrors,
    fechasDisponibles,
    horariosDisponibles,
    selectedDate,
    selectedTime,
    isLoading,
    handleInputChange,
    handleNextStep,
    handlePreviousStep,
    handleDateSelect,
    handleTimeSelect,
    t,
  };
};
