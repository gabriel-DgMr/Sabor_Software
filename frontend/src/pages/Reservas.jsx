import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
// import { useAuth } from '../context/AuthContext';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils.js';
import { validarEmail, validarTelefono, validarLongitud, validarCaracteresEspeciales, validarEspaciosInicioFinal } from '../utils/validaciones.js';
import '../index.css';

/**
 * Componente Reservas: Maneja el proceso de reservación de mesas
 * Implementa un formulario de múltiples pasos para recoger la información necesaria
 */
const Reservas = () => {
  // const { isAuthenticated } = useAuth();
  // const navigate = useNavigate();
  // const [showLogin, setShowLogin] = useState(false); // Comentado para el linter, restaurar si se necesita un modal de login aquí
  const [step, setStep] = useState(1);
  // Estado para la fecha seleccionada
  const [selectedDate, setSelectedDate] = useState(null);
  // Estado para la hora seleccionada
  const [selectedTime, setSelectedTime] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const [formData, setFormData] = useState({
    personas: '', // Cantidad de comensales
    fecha: '', // Fecha de la reserva
    hora: '', // Hora de la reserva
    nombre: '', // Nombre del cliente
    telefono: '', // Teléfono de contacto
    email: '', // Correo electrónico
    peticiones: '', // Nuevo campo para el paso 3
  });
  const [formErrors, setFormErrors] = useState({}); // Estado para errores de validación

  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Sabor: Reservas';
    // Cargar fechas disponibles al montar el componente
    cargarFechasDisponibles();

    // Configurar actualización periódica cada 30 segundos
    const intervalId = setInterval(() => {
      cargarFechasDisponibles();
      if (selectedDate) {
        cargarHorariosDisponibles(selectedDate);
      }
    }, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  // Efecto para cargar horarios cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      cargarHorariosDisponibles(selectedDate);
    }
  }, [selectedDate]);

  const cargarFechasDisponibles = async () => {
    try {
      const response = await fetch('/api/horarios/fechas-disponibles');
      const data = await response.json();
      setFechasDisponibles(data.fechasDisponibles);
    } catch (error) {
      console.error('Error al cargar fechas disponibles:', error);
    }
  };

  const cargarHorariosDisponibles = async (fecha) => {
    try {
      const response = await fetch(`/api/horarios/disponibles?fecha=${fecha}`);
      const data = await response.json();
      setHorariosDisponibles(data.horariosDisponibles);
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error);
    }
  };

  const manejarErroresDeCampo = (newErrors) => {
    setFormErrors(newErrors);
    setTimeout(() => animateElements('.reservas__input-error', 'fade-in'), 0);
    setTimeout(() => {
      document.querySelectorAll('.reservas__input-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setFormErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.personas || formData.personas <= 0)
      errors.personas = t('reservas_error_personas');
    if (!selectedDate) errors.fecha = t('reservas_error_fecha');
    if (!selectedTime) errors.hora = t('reservas_error_hora');
    manejarErroresDeCampo(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    // Validar nombre
    if (!formData.nombre) {
      errors.nombre = t('reservas_error_nombre');
    } else {
      const longitudError = validarLongitud(formData.nombre, 'nombre', 2, 50);
      if (longitudError) {
        errors.nombre = longitudError;
      } else {
        const caracteresError = validarCaracteresEspeciales(formData.nombre, 'nombre');
        if (caracteresError) {
          errors.nombre = caracteresError;
        } else {
          const espaciosError = validarEspaciosInicioFinal(formData.nombre, 'nombre');
          if (espaciosError) {
            errors.nombre = espaciosError;
          }
        }
      }
    }
    
    // Validar teléfono
    if (!formData.telefono) {
      errors.telefono = t('reservas_error_telefono');
    } else {
      const telefonoError = validarTelefono(formData.telefono);
      if (telefonoError) {
        errors.telefono = telefonoError;
      } else {
        const espaciosError = validarEspaciosInicioFinal(formData.telefono, 'teléfono');
        if (espaciosError) {
          errors.telefono = espaciosError;
        }
      }
    }
    
    // Validar email
    if (!formData.email) {
      errors.email = t('reservas_error_email');
    } else {
      const emailError = validarEmail(formData.email);
      if (emailError) {
        errors.email = emailError;
      } else {
        const espaciosError = validarEspaciosInicioFinal(formData.email, 'email');
        if (espaciosError) {
          errors.email = espaciosError;
        }
      }
    }
    
    manejarErroresDeCampo(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    
    // Validar peticiones (opcional pero si se llena debe ser válido)
    if (formData.peticiones && formData.peticiones.trim() !== '') {
      const longitudError = validarLongitud(formData.peticiones, 'peticiones', 5, 500);
      if (longitudError) {
        errors.peticiones = longitudError;
      } else {
        const caracteresError = validarCaracteresEspeciales(formData.peticiones, 'peticiones');
        if (caracteresError) {
          errors.peticiones = caracteresError;
        } else {
          const espaciosError = validarEspaciosInicioFinal(formData.peticiones, 'peticiones');
          if (espaciosError) {
            errors.peticiones = espaciosError;
          }
        }
      }
    }
    
    manejarErroresDeCampo(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'personas' ? parseInt(value, 10) : value, // Convertir 'personas' a número
    }));
    // Limpiar error para el campo que se está editando
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
      console.log('Payload que se enviará:', formData);
      ('Reserva Confirmada:', formData);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reservas/hacerReserva', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        console.log('Respuesta del backend:', result);

        if (response.ok) {
          alert('¡Reserva realizada con éxito!');

          // crear mensaje de confirmacion mas bonito
        } else {
          alert(`Error al realizar la reserva: ${result.message || response.statusText}`);
          console.error('Error en la reserva:', result);
        }
      } catch (error) {
        console.error('Error en la llamada API:', error);
        alert('Hubo un problema al conectar con el servidor de reservas.');
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setFormErrors({}); 
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleNextStep(); // La lógica de avanzar ya está en handleNextStep
  };

  // Componente que muestra el progreso actual en el proceso de reserva
  const renderStepIndicator = () => {
    return (
      <div className="steps_container">
        {/*colores para estados de disponibilidad */}
        <div className="disponible_color">
          <span className="disponible">{t('reservas_disponible')}</span>
          <span className="no_disponible">{t('reservas_no_disponible')}</span>
          <span className="seleccion">{t('reservas_seleccion')}</span>
        </div>

        <div className="steps">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
              <span className="step_number">{num}</span>
              <span className="step_text">
                {num === 1
                  ? 'Encontrar'
                  : num === 2
                    ? 'Información'
                    : num === 3
                      ? 'Adicional'
                      : 'Confirmación'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Actualiza la fecha seleccionada y el estado del formulario
  const handleDateSelect = selectedDay => {
    setSelectedDate(selectedDay);
    setFormData(prevState => ({
      ...prevState,
      fecha: selectedDay,
    }));
    if (formErrors.fecha) setFormErrors(prevErrors => ({ ...prevErrors, fecha: null }));
  };

  // Actualiza la hora seleccionada y el estado del formulario
  const handleTimeSelect = selectedTimeValue => {
    setSelectedTime(selectedTimeValue);
    setFormData(prevState => ({
      ...prevState,
      hora: selectedTimeValue,
    }));
    if (formErrors.hora) setFormErrors(prevErrors => ({ ...prevErrors, hora: null }));
  };

  // Componente que renderiza el selector de fechas disponibles
  const renderDateSelector = () => {
    return (
      <div className="date_selector">
        {/* Botones para cada fecha disponible */}
        {fechasDisponibles && fechasDisponibles.map((fecha, index) => (
          <button
            key={index}
            className={`date_button ${selectedDate === fecha.fecha ? 'selected' : ''} ${fecha.disponible ? 'available' : 'unavailable'}`}
            disabled={!fecha.disponible}
            type="button"
            onClick={() => fecha.disponible && handleDateSelect(fecha.fecha)}
          >
            {fecha.formato}
          </button>
        ))}
        {/* Botón para abrir el calendario completo (no funcional, solo mueustra) */}
        {/* <button
          className="calendar_button"
          type="button"
          onClick={() => alert('esto solo es un ejemplo')}
        >
          <i className="calendar_icon" />
        </button> */}
        {formErrors.fecha && <small className="reservas__input-error">{formErrors.fecha}</small>}
      </div>
    );
  };

  // selector de horarios
  const renderTimeSelector = () => {
    return (
      <div className="time_selector">
        <h3>{t('reservas_hora')}</h3>
        <div className="time_columns">
          <div className="time_column">
            {horariosDisponibles.map((horario, index) => (
              <button
                key={index}
                className={`time_button ${selectedTime === horario.hora ? 'selected' : ''} ${horario.disponible ? 'available' : 'unavailable'}`}
                disabled={!horario.disponible}
                type="button"
                onClick={() => horario.disponible && handleTimeSelect(horario.hora)}
              >
                {horario.hora}
              </button>
            ))}
          </div>
        </div>
        {formErrors.hora && <small className="reservas__input-error">{formErrors.hora}</small>}
      </div>
    );
  };

  const renderPaso1 = () => (
    <>
      <div className="inputCantidadPersonas">
        <input
          required
          className={`cantidad-personas__input ${formErrors.personas ? 'reservas__input-error' : ''}`}
          min="1"
          name="personas"
          placeholder={t('reservas_cantidad_personas')}
          type="number"
          value={formData.personas}
          onChange={handleInputChange}
        />
        {formErrors.personas && (
          <small className="reservas__input-error">{formErrors.personas}</small>
        )}
      </div>
      {renderDateSelector()}
      {renderTimeSelector()}
      <div className="info_contacto">
        <p>{t('reservas_info_contacto')}</p>
      </div>
    </>
  );

  const renderPaso2 = () => (
    <>
      <h2 className="reservas__subtitulo">{t('reservas_info_contacto_titulo')}</h2>
      <div className="campo">
        <label htmlFor="nombre">{t('nombre_completo')}:</label>
        <input
          className={`formulario__input ${formErrors.nombre ? 'reservas__input-error' : ''}`}
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleInputChange}
        /> 
        {formErrors.nombre && <small className="reservas__input-error">{formErrors.nombre}</small>}
      </div>
      <div className="campo">
        <label htmlFor="telefono">{t('telefono_con_formato')}:</label>
        <input
          className={`formulario__input ${formErrors.telefono ? 'reservas__input-error' : ''}`}
          id="telefono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleInputChange}
        />
        {formErrors.telefono && (
          <small className="reservas__input-error">{formErrors.telefono}</small>
        )}
      </div>
      <div className="campo">
        <label htmlFor="email">{t('correo_electronico')}:</label>
        <input
          className={`formulario__input ${formErrors.email ? 'reservas__input-error' : ''}`}
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {formErrors.email && <small className="reservas__input-error">{formErrors.email}</small>}
      </div>
    </>
  );

  const renderPaso3 = () => (
    <>
      <h2 className="reservas__subtitulo">{t('reservas_peticiones_titulo')}</h2>
      <div className="campo">
        <label htmlFor="peticiones">{t('reservas_peticiones_label')}</label>
        <br />
        <textarea
          className={`formulario__input ${formErrors.peticiones ? 'reservas__input-error' : ''}`}
          id="peticiones"
          name="peticiones"
          rows="4"
          value={formData.peticiones}
          onChange={handleInputChange}
        />
        {formErrors.peticiones && <small className="reservas__input-error">{formErrors.peticiones}</small>}
      </div>
    </>
  );

  const renderPaso4 = () => (
    <>
      <h2 className="reservas__subtitulo">{t('reservas_confirmar_titulo')}</h2>
      <div className="resumen-reserva">
        <p>
          <strong>{t('reservas_personas')}:</strong> {formData.personas}
        </p>
        <p>
          <strong>{t('reservas_fecha')}:</strong> {formData.fecha}
        </p>
        <p>
          <strong>{t('reservas_hora')}:</strong> {formData.hora}
        </p>
        <p>
          <strong>{t('nombre_completo')}:</strong> {formData.nombre}
        </p>
        <p>
          <strong>{t('telefono')}:</strong> {formData.telefono}
        </p>
        <p>
          <strong>{t('correo_electronico')}:</strong> {formData.email}
        </p>
        {formData.peticiones && (
          <p>
            <strong>{t('reservas_peticiones')}:</strong> {formData.peticiones}
          </p>
        )}
      </div>
      <p className="confirmacion-aviso">{t('reservas_confirmar_aviso')}</p>
    </>
  );

  // Estructura principal
  return (
    <div>
      <div>
        <Header /* setShowLogin={setShowLogin} */ /> {/* Comentado para que el linter no este fastidiando*/}
        <main className="pagina__contenido-reservas">
          <section className="reservas__imagen">
            <img alt="imagen-reservas" className='imagen-reservas' src="/images/imagen-reservas.jpg"/>
          </section>
          <section className="seccion_reservas">
            <h1 className="reservas__titulo">{t('reservas_titulo')}</h1>
            {renderStepIndicator()}

            <div className="reservas__contenido">
              <form onSubmit={handleSubmit}>
                {step === 1 && renderPaso1()}
                {step === 2 && renderPaso2()}
                {step === 3 && renderPaso3()}
                {step === 4 && renderPaso4()}

                <div className="reservas__acciones">
                  {step > 1 && (
                    <button className="boton_regresar" type="button" onClick={handlePreviousStep}>
                      {t('reservas_regresar')}
                    </button>
                  )}
                  <button className="boton_siguiente" type="submit">
                    {step === 4 ? t('reservas_confirmar_boton') : step === 3 ? t('reservas_ver_resumen') : t('reservas_siguiente')}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Reservas;
