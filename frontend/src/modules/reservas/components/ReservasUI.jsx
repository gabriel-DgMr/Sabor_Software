import React from 'react';
import PropTypes from 'prop-types';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import LoadingScreen from '../../../shared/components/LoadingScreen.jsx';
import AlertaSesion from '../../auth/components/AlertaSesion';
import Calendario from './Calendario.jsx';
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
import { formatearFecha } from '../../../shared/utils/format.js';

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

      <div className="reservas-pagina__cuerpo">
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
              {step === 1 && (
                <>
                  <div className="reserva-control-fila">
                    <div className="reserva-grupo">
                      <label className="reserva-grupo__label">{t('reservas.fecha')}</label>
                      <div
                        className={`reserva-calendario-container ${formErrors.fecha ? 'reserva-calendario-container--error' : ''}`}
                      >
                        <Calendario
                          selectedDate={formData.fecha}
                          onDateSelect={handleDateSelect}
                          t={t}
                        />
                      </div>
                      {formErrors.fecha && (
                        <span className="reserva-grupo__error">{formErrors.fecha}</span>
                      )}
                    </div>

                    <div className="reserva-grupo">
                      <label className="reserva-grupo__label">{t('reservas.personas')}</label>
                      <div className="reserva-input-wrapper">
                        <input
                          type="number"
                          className={`reserva-input-numero ${formErrors.personas ? 'reserva-input-numero--error' : ''}`}
                          name="personas"
                          min="1"
                          value={formData.personas || ''}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setFormData(p => ({
                              ...p,
                              personas: isNaN(val) ? '' : Math.max(1, val),
                            }));
                          }}
                          onBlur={e => {
                            if (!e.target.value || parseInt(e.target.value) < 1) {
                              setFormData(p => ({ ...p, personas: 1 }));
                            }
                          }}
                        />
                      </div>
                      {formErrors.personas && (
                        <span className="reserva-grupo__error">{formErrors.personas}</span>
                      )}
                    </div>
                  </div>

                  <div className="reserva-grupo" style={{ marginBottom: '4rem' }}>
                    <label className="reserva-grupo__label">
                      {t('reservas.horarios_disponibles')}
                    </label>
                    <div
                      className={`reserva-horarios ${formErrors.hora ? 'reserva-horarios--error' : ''}`}
                    >
                      {horariosDisponibles.map((h, i) => {
                        const esActivo = selectedTime === h.hora;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`reserva-chip ${esActivo ? 'reserva-chip--activo' : ''} ${formErrors.hora ? 'reserva-chip--error' : ''}`}
                            disabled={!h.disponible}
                            onClick={e => {
                              handleTimeSelect(h.hora);
                              gsap.from(e.currentTarget, {
                                scale: 0.85,
                                duration: 0.4,
                                ease: 'back.out(2)',
                              });
                            }}
                          >
                            {h.hora}
                          </button>
                        );
                      })}
                    </div>

                    {/* Leyenda de Estados */}
                    <div className="reserva-leyenda">
                      <div className="reserva-leyenda__item">
                        <div className="reserva-leyenda__punto reserva-leyenda__punto--disponible"></div>
                        <span>{t('reservas_disponible')}</span>
                      </div>
                      <div className="reserva-leyenda__item">
                        <div className="reserva-leyenda__punto reserva-leyenda__punto--seleccionado"></div>
                        <span>{t('reservas_seleccion')}</span>
                      </div>
                      <div className="reserva-leyenda__item">
                        <div className="reserva-leyenda__punto reserva-leyenda__punto--no-disponible"></div>
                        <span>{t('reservas_no_disponible')}</span>
                      </div>
                    </div>
                    {formErrors.hora && (
                      <span className="reserva-grupo__error">{formErrors.hora}</span>
                    )}
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
                </>
              )}

              {/* Paso 2: Información de Contacto y Peticiones */}
              {step === 2 && (
                <div
                  className="reserva-paso-2"
                  style={{
                    marginTop: '3rem',
                    padding: '3rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '2.5rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: 'fadeIn 0.5s ease',
                  }}
                >
                  <h3 style={{ fontSize: '2.2rem', marginBottom: '2.5rem', fontWeight: '600' }}>
                    {t('reservas.info_contacto_titulo')}
                  </h3>

                  <div className="reserva-control-fila" style={{ marginBottom: '2rem' }}>
                    <div className="reserva-grupo">
                      <label className="reserva-grupo__label">{t('nombre_completo')}</label>
                      <input
                        className={`reserva-textarea ${formErrors.nombre ? 'reserva-textarea--error' : ''}`}
                        style={{ minHeight: 'auto', padding: '1.5rem', borderRadius: '1.2rem' }}
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder={t('ej_nombre')}
                      />
                      {formErrors.nombre && (
                        <span className="reserva-grupo__error">{formErrors.nombre}</span>
                      )}
                    </div>
                    <div className="reserva-grupo">
                      <label className="reserva-grupo__label">{t('telefono')}</label>
                      <input
                        className={`reserva-textarea ${formErrors.telefono ? 'reserva-textarea--error' : ''}`}
                        style={{ minHeight: 'auto', padding: '1.5rem', borderRadius: '1.2rem' }}
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder={t('ej_telefono')}
                      />
                      {formErrors.telefono && (
                        <span className="reserva-grupo__error">{formErrors.telefono}</span>
                      )}
                    </div>
                  </div>

                  <div className="reserva-grupo" style={{ marginBottom: '3rem' }}>
                    <label className="reserva-grupo__label">{t('correo_electronico')}</label>
                    <input
                      className={`reserva-textarea ${formErrors.email ? 'reserva-textarea--error' : ''}`}
                      style={{ minHeight: 'auto', padding: '1.5rem', borderRadius: '1.2rem' }}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('ej_email')}
                    />
                    {formErrors.email && (
                      <span className="reserva-grupo__error">{formErrors.email}</span>
                    )}
                  </div>

                  <div className="reserva-grupo">
                    <label className="reserva-grupo__label">
                      {t('reservas.peticiones_especiales')}
                    </label>
                    <textarea
                      className={`reserva-textarea ${formErrors.peticiones ? 'reserva-textarea--error' : ''}`}
                      style={{ borderRadius: '1.2rem', minHeight: '120px' }}
                      name="peticiones"
                      placeholder={t('reservas.peticiones_placeholder')}
                      value={formData.peticiones}
                      onChange={handleInputChange}
                    />
                    {formErrors.peticiones && (
                      <span className="reserva-grupo__error">{formErrors.peticiones}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Resumen Final */}
              {step === 3 && (
                <div
                  className="reserva-resumen"
                  style={{
                    marginTop: '2rem',
                    padding: '2.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '2rem',
                      marginBottom: '2rem',
                      color: 'var(--naranja-sabor)',
                    }}
                  >
                    {t('reservas.confirmar_titulo')}
                  </h3>
                  <div style={{ display: 'grid', gap: '1.5rem', fontSize: '1.6rem' }}>
                    <p>
                      <strong>{t('reservas.fecha')}:</strong> {formatearFecha(formData.fecha)} a las{' '}
                      {formData.hora}
                    </p>
                    <p>
                      <strong>{t('reservas.personas')}:</strong> {formData.personas}
                    </p>
                    <p>
                      <strong>{t('nombre_completo')}:</strong> {formData.nombre}
                    </p>
                    <p>
                      <strong>{t('correo_electronico')}:</strong> {formData.email}
                    </p>
                    {formData.peticiones && (
                      <p>
                        <strong>{t('reservas.peticiones_especiales')}:</strong>{' '}
                        {formData.peticiones}
                      </p>
                    )}
                  </div>
                  <p
                    style={{
                      marginTop: '2rem',
                      fontSize: '1.4rem',
                      opacity: 0.7,
                      fontStyle: 'italic',
                    }}
                  >
                    {t('reservas.confirmar_aviso')}
                  </p>
                </div>
              )}

              <div
                className="reserva-acciones"
                style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}
              >
                {step > 1 && (
                  <button
                    className="reserva-btn-secundario"
                    type="button"
                    onClick={handlePreviousStep}
                    style={{ flex: 1 }}
                  >
                    {t('reservas.regresar')}
                  </button>
                )}
                <button className="reserva-btn-confirmar" type="submit" style={{ flex: 2 }}>
                  {step === 3 ? t('reservas.confirmar') : t('reservas.confirmar_detalles')}
                </button>
              </div>
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
      </div>

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
