import React from 'react';
import PropTypes from 'prop-types';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import LoadingScreen from '../../../shared/components/LoadingScreen.jsx';
import AlertaSesion from '../../auth/components/AlertaSesion';
import '../styles/reservas.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoRestaurantOutline,
  IoLeafOutline,
  IoBeerOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';

/**
 * ReservasUI - Vista premium para realizar reservaciones.
 * BEM: .reservas-pagina, .reservas-hero, .reserva-formulario, .reserva-info
 */
const ReservasUI = ({
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
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    handleNextStep();
  };

  // Animaciones de entrada
  useGSAP(() => {
    gsap.from('.reservas-hero__titulo', { y: 50, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.reservas-hero__eslogan', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      delay: 0.2,
    });
    gsap.from('.reserva-formulario', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.4,
    });
    gsap.from('.reserva-info', { x: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.4 });
  }, []);

  return (
    <div className="reservas-pagina">
      {isLoading && <LoadingScreen />}
      <Header />

      {/* Hero Principal */}
      <section
        className="reservas-hero"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('/images/reservas/hero.png') center/cover no-repeat`,
        }}
      >
        <h1 className="reservas-hero__titulo">SABOR</h1>
        <p className="reservas-hero__eslogan">{t('reservas.hero_eslogan')}</p>
      </section>

      <main className="reservas-contenido">
        {/* Columna Izquierda: Formulario */}
        <section className="reserva-formulario">
          <h2 className="reserva-formulario__titulo">{t('reservas.hacer_reserva')}</h2>
          <p className="reserva-formulario__descripcion">{t('reservas.descripcion')}</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="reserva-control-fila">
              <div className="reserva-grupo">
                <label className="reserva-grupo__label">{t('reservas.fecha')}</label>
                <div
                  className={`reserva-input-wrapper ${formErrors.fecha ? 'reserva-input-wrapper--error' : ''}`}
                >
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={e => handleDateSelect(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <i>
                    <IoCalendarOutline />
                  </i>
                </div>
                {formErrors.fecha && (
                  <span className="reserva-grupo__error">{formErrors.fecha}</span>
                )}
              </div>

              <div className="reserva-grupo">
                <label className="reserva-grupo__label">{t('reservas.personas')}</label>
                <div
                  className={`reserva-contador ${formErrors.personas ? 'reserva-contador--error' : ''}`}
                >
                  <button
                    type="button"
                    className="reserva-contador__btn"
                    onClick={() =>
                      setFormData(p => ({ ...p, personas: Math.max(1, (p.personas || 1) - 1) }))
                    }
                  >
                    –
                  </button>
                  <span className="reserva-contador__valor">{formData.personas}</span>
                  <button
                    type="button"
                    className="reserva-contador__btn"
                    onClick={() => setFormData(p => ({ ...p, personas: (p.personas || 1) + 1 }))}
                  >
                    +
                  </button>
                </div>
                {formErrors.personas && (
                  <span className="reserva-grupo__error">{formErrors.personas}</span>
                )}
              </div>
            </div>

            <div className="reserva-grupo" style={{ marginBottom: '4rem' }}>
              <label className="reserva-grupo__label">{t('reservas.horarios_disponibles')}</label>
              <div
                className={`reserva-horarios ${formErrors.hora ? 'reserva-horarios--error' : ''}`}
              >
                {horariosDisponibles.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`reserva-chip ${selectedTime === h.hora ? 'reserva-chip--activo' : ''} ${formErrors.hora ? 'reserva-chip--error' : ''}`}
                    disabled={!h.disponible}
                    onClick={() => handleTimeSelect(h.hora)}
                  >
                    {h.hora}
                  </button>
                ))}
              </div>
              {formErrors.hora && <span className="reserva-grupo__error">{formErrors.hora}</span>}
            </div>

            <div className="reserva-grupo">
              <label className="reserva-grupo__label">{t('reservas.preferencia_mesa')}</label>
              <div className="reserva-preferencias">
                <div
                  className={`reserva-opcion ${formData.preferencia === 'Indoor' ? 'reserva-opcion--activa' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, preferencia: 'Indoor' }))}
                >
                  <IoRestaurantOutline className="reserva-opcion__icono" />
                  <span className="reserva-opcion__texto">{t('reservas.interior')}</span>
                </div>
                <div
                  className={`reserva-opcion ${formData.preferencia === 'Outdoor' ? 'reserva-opcion--activa' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, preferencia: 'Outdoor' }))}
                >
                  <IoLeafOutline className="reserva-opcion__icono" />
                  <span className="reserva-opcion__texto">{t('reservas.exterior')}</span>
                </div>
                <div
                  className={`reserva-opcion ${formData.preferencia === 'Bar' ? 'reserva-opcion--activa' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, preferencia: 'Bar' }))}
                >
                  <IoBeerOutline className="reserva-opcion__icono" />
                  <span className="reserva-opcion__texto">{t('reservas.barra')}</span>
                </div>
              </div>
            </div>

            <div className="reserva-grupo">
              <label className="reserva-grupo__label">{t('reservas.peticiones_especiales')}</label>
              <textarea
                className={`reserva-textarea ${formErrors.peticiones ? 'reserva-textarea--error' : ''}`}
                name="peticiones"
                placeholder={t('reservas.peticiones_placeholder')}
                value={formData.peticiones}
                onChange={handleInputChange}
              />
              {formErrors.peticiones && (
                <span className="reserva-grupo__error">{formErrors.peticiones}</span>
              )}
            </div>

            {/* Campos adicionales de contacto si son necesarios (para cumplir con la lógica actual) */}
            {step === 2 && (
              <div
                className="reserva-step-info"
                style={{
                  marginTop: '3rem',
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '2rem',
                }}
              >
                <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
                  {t('reservas.info_contacto_titulo')}
                </h3>
                <div className="reserva-control-fila">
                  <div className="reserva-grupo">
                    <label className="reserva-grupo__label">{t('nombre_completo')}</label>
                    <input
                      className={`reserva-textarea ${formErrors.nombre ? 'reserva-textarea--error' : ''}`}
                      style={{ minHeight: 'auto', padding: '1.5rem' }}
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                    {formErrors.nombre && (
                      <span className="reserva-grupo__error">{formErrors.nombre}</span>
                    )}
                  </div>
                  <div className="reserva-grupo">
                    <label className="reserva-grupo__label">{t('telefono')}</label>
                    <input
                      className={`reserva-textarea ${formErrors.telefono ? 'reserva-textarea--error' : ''}`}
                      style={{ minHeight: 'auto', padding: '1.5rem' }}
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                    {formErrors.telefono && (
                      <span className="reserva-grupo__error">{formErrors.telefono}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button className="reserva-btn-confirmar" type="submit">
              {step === 4 ? t('reservas.confirmar') : t('reservas.confirmar_detalles')}
            </button>
          </form>
        </section>

        {/* Columna Derecha: Información */}
        <aside className="reserva-info">
          <div className="guia-box">
            <h3 className="guia-box__titulo">{t('reservas.guias_comensal')}</h3>

            <div className="guia-item">
              <div className="guia-item__icono">
                <IoTimeOutline />
              </div>
              <div className="guia-item__texto">
                <span className="guia-item__titulo">{t('reservas.hora_llegada')}</span>
                <span className="guia-item__desc">{t('reservas.hora_llegada_desc')}</span>
              </div>
            </div>

            <div className="guia-item">
              <div className="guia-item__icono">
                <IoInformationCircleOutline />
              </div>
              <div className="guia-item__texto">
                <span className="guia-item__titulo">{t('reservas.periodo_gracia')}</span>
                <span className="guia-item__desc">{t('reservas.periodo_gracia_desc')}</span>
              </div>
            </div>

            <div className="guia-item">
              <div className="guia-item__icono">
                <IoShieldCheckmarkOutline />
              </div>
              <div className="guia-item__texto">
                <span className="guia-item__titulo">{t('reservas.politica_cancelacion')}</span>
                <span className="guia-item__desc">{t('reservas.politica_cancelacion_desc')}</span>
              </div>
            </div>
          </div>

          <div className="reserva-galeria">
            <img
              src="/images/reservas/platillo.png"
              alt="Platillo"
              className="reserva-galeria__img reserva-galeria__img--cuadrada"
            />
            <img
              src="/images/reservas/copas.png"
              alt="Copas"
              className="reserva-galeria__img reserva-galeria__img--cuadrada"
            />
            <img
              src="/images/reservas/chef.png"
              alt="Chef"
              className="reserva-galeria__img reserva-galeria__img--ancha"
            />
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

ReservasUI.propTypes = {
  step: PropTypes.number.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  formErrors: PropTypes.object.isRequired,
  fechasDisponibles: PropTypes.array.isRequired,
  horariosDisponibles: PropTypes.array.isRequired,
  selectedDate: PropTypes.string,
  selectedTime: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
  handleDateSelect: PropTypes.func.isRequired,
  handleTimeSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ReservasUI;
