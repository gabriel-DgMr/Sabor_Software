import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import '../styles/indicador-scroll.css';

/**
 * Componente IndicadorScroll
 * Muestra una flecha blanca pequeña dentro de un círculo con blur.
 * Animación: Rebote y rotación.
 */
const IndicadorScroll = ({ visible }) => {
  const { t } = useTranslation();
  const indicadorRef = useRef(null);
  const flechaRef = useRef(null);

  useGSAP(
    () => {
      if (visible) {
        // Timeline para combinar rebote y rotación
        const tl = gsap.timeline({ repeat: -1 });

        tl.to(flechaRef.current, {
          y: 8,
          duration: 0.8,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        }).to(
          flechaRef.current,
          {
            rotationY: 360,
            duration: 1.2,
            ease: 'slow(0.7, 0.7, false)',
          },
          0
        ); // Empiezan al mismo tiempo o solapados

        // Animación sutil de entrada para el contenedor
        gsap.fromTo(
          indicadorRef.current,
          { opacity: 0, y: 20, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.5 }
        );
      }
    },
    { scope: indicadorRef, dependencies: [visible] }
  );

  return (
    <div
      className={`indicador-scroll ${!visible ? 'indicador-scroll--oculto' : ''}`}
      ref={indicadorRef}
    >
      <div className="indicador-scroll__circulo">
        <div ref={flechaRef}>
          <IoChevronDownOutline className="indicador-scroll__flecha" />
        </div>
      </div>
      <span className="indicador-scroll__texto">{t('inicio.hero.desliza', 'Desliza')}</span>
    </div>
  );
};

export default IndicadorScroll;
