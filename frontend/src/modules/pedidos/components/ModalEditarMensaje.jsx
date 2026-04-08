import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { FaTimes, FaSave } from 'react-icons/fa';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import '../styles/modal-mesa.css';

const ModalEditarMensaje = ({ isOpen, onClose, item, onSave, t }) => {
  const [mensaje, setMensaje] = useState('');
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (item) {
      setMensaje(item.mensaje || item.peticion || '');
    }
  }, [item, isOpen]);

  useGSAP(
    () => {
      if (isOpen) {
        gsap.set(overlayRef.current, { visibility: 'visible' });
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { y: 30, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
      } else {
        gsap.to(modalRef.current, {
          y: 20,
          scale: 0.95,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          delay: 0.1,
          onComplete: () => {
            gsap.set(overlayRef.current, { visibility: 'hidden' });
          },
        });
      }
    },
    { dependencies: [isOpen], scope: overlayRef }
  );

  const handleGuardar = () => {
    onSave(item.id_producto, mensaje);
    onClose();
  };

  if (!isOpen && !overlayRef.current) return null;

  return ReactDOM.createPortal(
    <div className="dialogo-modal__overlay" ref={overlayRef} style={{ visibility: 'hidden' }}>
      <div
        className="dialogo-modal"
        ref={modalRef}
        style={{ maxWidth: '450px', textAlign: 'left' }}
      >
        <button className="dialogo-modal__close" onClick={onClose}>
          <FaTimes />
        </button>

        <div
          className="modal-mesa__cabecera"
          style={{ alignItems: 'flex-start', textAlign: 'left' }}
        >
          <h3 className="modal-mesa__titulo">{t('editar_mensaje_titulo', 'Editar mensaje')}</h3>
          <p className="modal-mesa__descripcion">
            {t('editar_mensaje_desc', 'Personaliza tu pedido para este producto.')}
          </p>
        </div>

        <div className="modal-mesa__formulario">
          <div className="modal-mesa__campo">
            <textarea
              className="input-textarea"
              style={{ width: '100%', minHeight: '120px' }}
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              placeholder={t('dialog.specialRequestPlaceholder')}
              autoFocus
            ></textarea>
          </div>

          <div className="modal-mesa__acciones">
            <button className="modal-mesa__boton-confirmar" onClick={handleGuardar}>
              <FaSave style={{ marginRight: '8px' }} />
              {t('boton_guardar', 'Guardar')}
            </button>
            <button className="modal-mesa__boton-cancelar" onClick={onClose}>
              {t('boton_cancelar', 'Cancelar')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

ModalEditarMensaje.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ModalEditarMensaje;
