import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import '../styles/modal-confirmacion.css';

/**
 * Componente de Modal de Confirmación Reusable
 * Siguiendo BEM en Español y Diseño Premium
 */
const ModalConfirmacion = ({
  abierto,
  alCerrar,
  alConfirmar,
  titulo = 'Confirmar acción',
  mensaje = '¿Estás seguro de que deseas realizar esta acción?',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'peligro', // 'peligro' | 'info'
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contenidoRef = useRef(null);

  useGSAP(() => {
    if (abierto) {
      // Animación de entrada
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

  const manejarConfirmar = () => {
    // Animación de salida antes de ejecutar la acción (opcional, pero mejora UX)
    gsap.to(contenidoRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      onComplete: alConfirmar,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

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

  return (
    <div
      className="modal-confirmacion"
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && manejarCerrar()}
    >
      <div
        className={`modal-confirmacion__contenido modal-confirmacion__contenido--${variante}`}
        ref={contenidoRef}
      >
        <button className="modal-confirmacion__cerrar" onClick={manejarCerrar}>
          <FaTimes />
        </button>

        <div className="modal-confirmacion__icono-contenedor">
          {variante === 'peligro' ? (
            <FaExclamationTriangle className="modal-confirmacion__icono" />
          ) : (
            <FaInfoCircle className="modal-confirmacion__icono" />
          )}
        </div>

        <h3 className="modal-confirmacion__titulo">{titulo}</h3>
        <p className="modal-confirmacion__mensaje">{mensaje}</p>

        <div className="modal-confirmacion__acciones">
          <button
            className="modal-confirmacion__boton modal-confirmacion__boton--cancelar"
            onClick={manejarCerrar}
          >
            {textoCancelar}
          </button>
          <button
            className={`modal-confirmacion__boton modal-confirmacion__boton--${variante}`}
            onClick={manejarConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

ModalConfirmacion.propTypes = {
  abierto: PropTypes.bool.isRequired,
  alCerrar: PropTypes.func.isRequired,
  alConfirmar: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  mensaje: PropTypes.string,
  textoConfirmar: PropTypes.string,
  textoCancelar: PropTypes.string,
  variante: PropTypes.oneOf(['peligro', 'info']),
};

export default ModalConfirmacion;
