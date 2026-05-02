import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import '../styles/modal-alerta.css';

const ModalAlerta = ({
  abierto,
  alCerrar,
  titulo = 'Alerta',
  mensaje = '',
  textoAceptar = 'Aceptar',
  variante = 'info', // 'info' | 'peligro' | 'exito'
}) => {
  const overlayRef = useRef(null);
  const contenidoRef = useRef(null);

  useGSAP(() => {
    if (abierto) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        contenidoRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' }
      );
    }
  }, [abierto]);

  if (!abierto) return null;

  const manejarCerrar = () => {
    gsap.to(contenidoRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 10,
      duration: 0.2,
      onComplete: alCerrar,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  const getIcono = () => {
    switch (variante) {
      case 'peligro':
        return (
          <FaExclamationTriangle
            className={`modal-alerta__icono modal-alerta__icono--${variante}`}
          />
        );
      case 'exito':
        return <FaCheckCircle className={`modal-alerta__icono modal-alerta__icono--${variante}`} />;
      case 'info':
      default:
        return <FaInfoCircle className={`modal-alerta__icono modal-alerta__icono--${variante}`} />;
    }
  };

  return (
    <div
      className="modal-alerta__overlay"
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && manejarCerrar()}
    >
      <div
        className={`modal-alerta__contenido modal-alerta__contenido--${variante}`}
        ref={contenidoRef}
      >
        <button className="modal-alerta__cerrar" onClick={manejarCerrar} aria-label="Cerrar alerta">
          <FaTimes />
        </button>

        <div className="modal-alerta__icono-contenedor">{getIcono()}</div>

        <h3 className="modal-alerta__titulo">{titulo}</h3>
        <p className="modal-alerta__mensaje">{mensaje}</p>

        <div className="modal-alerta__acciones">
          <button
            className={`modal-alerta__boton modal-alerta__boton--${variante}`}
            onClick={manejarCerrar}
          >
            {textoAceptar}
          </button>
        </div>
      </div>
    </div>
  );
};

ModalAlerta.propTypes = {
  abierto: PropTypes.bool.isRequired,
  alCerrar: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  mensaje: PropTypes.string,
  textoAceptar: PropTypes.string,
  variante: PropTypes.oneOf(['info', 'peligro', 'exito']),
};

export default ModalAlerta;
