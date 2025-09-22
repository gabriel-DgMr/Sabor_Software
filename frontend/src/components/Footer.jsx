import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillInstagram } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';
import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GoCheck, GoX } from 'react-icons/go';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils';
import { validarCaracteresEspeciales, validarEspaciosInicioFinal } from '../utils/validaciones';

const FooterAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success' ? <GoCheck className="GoCheck" /> : <GoX className="GoX" />;
  return (
    <div className="alerta-con-tarjeta">
      {icon}
      <span>{message}</span>
    </div>
  );
};

const Footer = () => {
  const [experiencia, setExperiencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!experiencia) {
      setError(t('campo_vacio'));
      setTimeout(() => animateElements('#footer-error', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#footer-error');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
      return;
    }
    // Validar espacios al inicio/final
    const errorEspacios = validarEspaciosInicioFinal(experiencia, t('tu_experiencia'));
    if (errorEspacios) {
      setError(errorEspacios);
      setTimeout(() => animateElements('#footer-error', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#footer-error');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
      return;
    }
    // Validar caracteres especiales
    const errorCaracteres = validarCaracteresEspeciales(experiencia, t('tu_experiencia'));
    if (errorCaracteres) {
      setError(errorCaracteres);
      setTimeout(() => animateElements('#footer-error', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#footer-error');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
      return;
    }

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: experiencia }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar el mensaje');
      setMensaje(t('gracias_comentario'));
      setExperiencia('');
      setTimeout(() => animateElements('#footer-exito', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#footer-exito');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setMensaje(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    } catch (err) {
      setError(err.message);
      setTimeout(() => animateElements('#footer-error', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#footer-error');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    }
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
          <Link className="nosotros-opc" to="/quienes-somos">
            {t('quienes_somos')}
          </Link>
          <Link className="nosotros-opc" to="/sobre-nosotros">
            {t('descubrenos')}
          </Link>
        </h4>
      </div>
      <form noValidate className="cuentanos" onSubmit={handleSubmit}>
        <h3 className="pie-pagina__titulo">{t('cuentanos')}</h3>
        <textarea
          className="cuentanos__input"
          placeholder={t('tu_experiencia')}
          value={experiencia}
          onChange={e => setExperiencia(e.target.value)}
        />
        <button className="cuentanos__boton" type="submit">
          {t('enviar')}
        </button>
        <FooterAlert type={error ? 'error' : 'success'} message={error || mensaje} />
      </form>
    </footer>
  );
};

export default Footer;
