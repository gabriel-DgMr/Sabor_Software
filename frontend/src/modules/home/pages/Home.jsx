import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQrcode, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { FaUtensils } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { BiSolidDish } from 'react-icons/bi';
import { GoX } from 'react-icons/go';

// Componentes Compartidos
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import LoadingScreen from '../../../shared/components/LoadingScreen.jsx';

// Contextos y Hooks
import { useProductos } from '../../../shared/context/ProductoContext';
import { useRoleRedirect } from '../../../shared/hooks/useRoleRedirect.js';

// Sub-componentes del Módulo Home
import GrillaProductos from '../components/GrillaProductos.jsx';
import IndicadorScroll from '../components/IndicadorScroll.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';

// Estilos
import '../styles/home.css';
import '../styles/home-secciones.css';
import '../../../index.css';

const HomeError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { redirectIfAuthenticated } = useRoleRedirect();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Redirección por roles centralizada en hook
  useEffect(() => {
    redirectIfAuthenticated();
  }, [redirectIfAuthenticated]);

  // Estados de Productos
  const { state, getProductosFiltrados } = useProductos();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cargar solo los 5 más vendidos para el Home
  useEffect(() => {
    const cargarDestacados = async () => {
      await getProductosFiltrados({
        orden: 'ventas',
        limit: 5,
      });
    };
    cargarDestacados();
  }, [getProductosFiltrados]);

  useEffect(() => {
    document.title = 'Sabor: Restaurante Premium';
  }, []);

  if (state.loading && state.productosFiltrados.length === 0) return <LoadingScreen />;
  if (state.error)
    return <HomeError message={t('error_cargar_productos', { error: state.error })} />;

  return (
    <div className="home">
      <Header />

      {/* Burbujas Flotantes */}

      {isMobile && (
        <Link className="burbuja-qr" to="/escanear-qr">
          <div className="carrito-icono">
            <FaQrcode className="qr" size={30} />
          </div>
        </Link>
      )}

      <main className="main">
        <HeroCarousel />
        <IndicadorScroll visible={!isScrolled} oscuro={true} />

        {/* Sección 1: Productos Destacados */}
        <section className="seccion-destacados">
          <h2 className="seccion-destacados__titulo">
            {t('productos_destacados', 'Nuestros Favoritos')}
          </h2>
          <p className="seccion-destacados__subtitulo">
            {t(
              'destacados_descripcion',
              'Descubre los platos más aclamados por nuestros clientes.'
            )}
          </p>

          <GrillaProductos
            loading={state.loading}
            productos={state.productosFiltrados} // Mostramos solo los filtrados (que son el top 5)
            productosFiltrados={state.productosFiltrados}
            t={t}
          />

          <div className="seccion-destacados__ver-mas">
            <Link to="/productos" className="boton-ver-mas">
              {t('ver_todos_los_productos', 'Ver Menú Completo')}
            </Link>
          </div>
        </section>

        {/* Sección 2: Reserva */}
        <section className="seccion-reservas">
          <div className="seccion-reservas__contenido">
            <h2 className="seccion-reservas__titulo">
              {t('reserva_tu_mesa', 'Una Experiencia Exclusiva')}
            </h2>
            <p className="seccion-reservas__texto">
              {t(
                'reserva_texto',
                'Asegura tu lugar en nuestra mesa y déjanos sorprenderte con sabores inigualables y un servicio de primera clase.'
              )}
            </p>
            <Link to="/reservas" className="seccion-reservas__boton">
              <FaUtensils className="seccion-reservas__icono" />
              {t('reservar_ahora', 'Reservar Ahora')}
            </Link>
          </div>
        </section>

        {/* Sección 3: Ubicación Interactiva */}
        <section className="seccion-ubicacion">
          <div
            className="tarjeta-ubicacion"
            onClick={() =>
              window.open(
                'https://www.google.com/maps/search/?api=1&query=Restaurante+Sabor+Premium',
                '_blank'
              )
            }
          >
            <img
              src="/images/ubicacion-premium.png"
              alt="Ubicación Sabor"
              className="tarjeta-ubicacion__imagen"
            />
            <div className="tarjeta-ubicacion__capa">
              <div className="tarjeta-ubicacion__info">
                <h3 className="tarjeta-ubicacion__titulo">{t('visitanos', 'Visítanos')}</h3>
                <p className="tarjeta-ubicacion__direccion">
                  <FaMapMarkerAlt />
                  Carrera 43 # 12 - 34, Medellín, Colombia
                </p>
                <span className="tarjeta-ubicacion__link">
                  {t('ver_en_maps', 'Ver en Google Maps')}
                  <FaExternalLinkAlt size={14} />
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
