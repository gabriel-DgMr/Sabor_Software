import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillInstagram } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';
import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils';
import { validarCaracteresEspeciales, validarLongitud, validarEspaciosInicioFinal } from '../utils/validaciones';

const Footer = () => {
  const [experiencia, setExperiencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setMensaje('');

    let errorMessage = '';
    
    // Validar que el campo no esté vacío
    if (!experiencia) {
      errorMessage = 'El campo no puede estar vacío.';
    } else {
      // Validar longitud
      const longitudError = validarLongitud(experiencia, 'experiencia', 5, 500);
      if (longitudError) {
        errorMessage = longitudError;
      } else {
        // Validar caracteres especiales
        const caracteresError = validarCaracteresEspeciales(experiencia, 'experiencia');
        if (caracteresError) {
          errorMessage = caracteresError;
        } else {
          // Validar espacios al inicio y final
          const espaciosError = validarEspaciosInicioFinal(experiencia, 'experiencia');
          if (espaciosError) {
            errorMessage = espaciosError;
          }
        }
      }
    }

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => animateElements('#error-footer', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#error-footer');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
      return;
    }

    // Simulación de envío exitoso
    setMensaje('¡Gracias por tu comentario!');
    setExperiencia('');
    setTimeout(() => animateElements('#exito-footer', 'fade-in'), 0);
    setTimeout(() => {
      const el = document.querySelector('#exito-footer');
      if (el) {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      }
      setTimeout(() => setMensaje(''), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  return (
      <footer className="pie-pagina">
        <div className="pie-pagina__contacto">
          <h3 className="pie-pagina__titulo">{t('contactanos')}</h3>
          <h4 className="pie-pagina__subtitulo">{t('nuestras_redes')}</h4>
          <div className="pie-pagina__redes">
            <div className="pie-pagina__icono-red">
              <FaFacebook size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <FaTiktok size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <AiFillInstagram size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <BsTwitterX size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <FaYoutube size={32} />
            </div>
          </div>
        </div>

        <div className="pie-pagina__nosotros">
          <h3 className="pie-pagina__titulo">{t('sobre_nosotros')}</h3>
          <h4 className="pie-pagina__subtitulo">
            <Link to="/quienes-somos" className='nosotros-opc'>{t('quienes_somos')}</Link>
            <Link to="/sobre-nosotros" className='nosotros-opc'>{t('descubrenos')}</Link>
          </h4>
        </div>
        <form className="cuentanos" onSubmit={handleSubmit} noValidate>
          <h3 className="pie-pagina__titulo">{t('cuentanos')}</h3>
          <textarea
            className="cuentanos__input"
            placeholder={t('tu_experiencia')}
            value={experiencia}
            onChange={e => setExperiencia(e.target.value)}
          />
          <button type="submit" className="cuentanos__boton">
            {t('enviar')}
          </button>
          {error && (
            <p id="error-footer" className="cuentanos__mensaje-error">
              {error}
            </p>
          )}
          {mensaje && (
            <p id="exito-footer" className="cuentanos__mensaje-exito">
              {mensaje}
            </p>
          )}
        </form>
      </footer>
  );
};

export default Footer;