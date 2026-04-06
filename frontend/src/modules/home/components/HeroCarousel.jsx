import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import bannersService from '../services/banners-service';
import '../styles/hero-carousel.css';

const HeroCarousel = () => {
  const { i18n } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [cargando, setCargando] = useState(true);
  const contenedorRef = useRef(null);
  const timerRef = useRef(null);

  const esIngles = i18n.language === 'en';

  // Cargar banners al iniciar
  useEffect(() => {
    const cargarBanners = async () => {
      try {
        const data = await bannersService.getAllBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error al cargar banners:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarBanners();
  }, [i18n.language]);

  // Función para cambiar de diapositiva
  const cambiarDiapositiva = useCallback(
    nuevoIndice => {
      if (nuevoIndice === indiceActivo) return;
      setIndiceActivo(nuevoIndice);
    },
    [indiceActivo]
  );

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndiceActivo(prev => (prev + 1) % banners.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  // Animaciones con GSAP
  useGSAP(
    () => {
      if (banners.length === 0) return;

      const diapositivas = contenedorRef.current.querySelectorAll('.hero-carrusel__diapositiva');
      const diapositivaActiva = diapositivas[indiceActivo];
      const contenido = diapositivaActiva.querySelector('.hero-carrusel__contenido');

      // Resetear todas las diapositivas
      gsap.set(diapositivas, { opacity: 0, visibility: 'hidden', zIndex: 1 });

      // Animar la activa
      gsap.to(diapositivaActiva, {
        opacity: 1,
        visibility: 'visible',
        zIndex: 2,
        duration: 1,
        ease: 'power2.inOut',
      });

      // Animar contenido de la activa
      gsap.fromTo(
        contenido,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
      );
    },
    { scope: contenedorRef, dependencies: [indiceActivo, banners] }
  );

  if (cargando) return <div className="hero-carrusel hero-carrusel--cargando"></div>;
  if (banners.length === 0) return null;

  return (
    <section className="hero-carrusel" ref={contenedorRef}>
      <div className="hero-carrusel__contenedor">
        {banners.map((banner, index) => {
          const titulo = esIngles && banner.titulo_en ? banner.titulo_en : banner.titulo;
          const descripcion =
            esIngles && banner.descripcion_en ? banner.descripcion_en : banner.descripcion;
          const botonTexto =
            esIngles && banner.boton_texto_en ? banner.boton_texto_en : banner.boton_texto;

          return (
            <div
              key={banner.id_banner}
              className={`hero-carrusel__diapositiva ${index === indiceActivo ? 'hero-carrusel__diapositiva--activa' : ''} hero-carrusel__diapositiva--${banner.posicion_contenido || 'centro-centro'}`}
            >
              <img
                src={getImageUrl(banner.imagen_url)}
                alt={titulo}
                className="hero-carrusel__imagen"
              />
              <div className="hero-carrusel__capa"></div>
              <div className="hero-carrusel__contenido">
                <h2 className="hero-carrusel__titulo">{titulo}</h2>
                {descripcion && <p className="hero-carrusel__descripcion">{descripcion}</p>}
                {botonTexto && banner.boton_enlace && (
                  <a href={banner.boton_enlace} className="hero-carrusel__boton">
                    {botonTexto}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="hero-carrusel__controles">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`hero-carrusel__indicador ${index === indiceActivo ? 'hero-carrusel__indicador--activo' : ''}`}
              onClick={() => cambiarDiapositiva(index)}
              aria-label={`Ir a diapositiva ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
