import React, { useState } from 'react';
import { AiFillInstagram } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';
import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils';
import { validarCaracteresEspeciales } from '../utils/validaciones';

const Footer = () => {
  const [experiencia, setExperiencia] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setMensaje('');

    let errorMessage = '';
    if (!experiencia.trim()) {
      errorMessage = 'El campo no puede estar vacío.';
    } else {
      const errorValidacion = validarCaracteresEspeciales(experiencia, 'experiencia');
      if (errorValidacion) {
        errorMessage = errorValidacion;
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
          <h3 className="pie-pagina__titulo">Contáctanos</h3>
          <h4 className="pie-pagina__subtitulo">Nuestras redes sociales</h4>
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
          <h3 className="pie-pagina__titulo">Sobre Nosotros</h3>
          <h4 className="pie-pagina__subtitulo">
            <a href="#" className='nosotros-opc'>¿Quiénes somos?</a>
            <a href="#" className='nosotros-opc'>Descubrenos </a>
          </h4>
        </div>
        <form className="cuentanos" onSubmit={handleSubmit} noValidate>
          <h3 className="pie-pagina__titulo">¡Cuentanos!</h3>
          <textarea
            className="cuentanos__input"
            placeholder="¡Tu experiencia!"
            value={experiencia}
            onChange={e => setExperiencia(e.target.value)}
          />
          <button type="submit" className="cuentanos__boton">
            Enviar
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