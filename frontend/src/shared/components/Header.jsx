import { useEffect, useState, useRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  IoCartOutline,
  IoPersonOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoSettingsOutline,
  IoBagHandleOutline,
  IoCalendarOutline,
  IoLogOutOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../app/context/AuthContext.jsx';
import { useCarrito } from '../../modules/pedidos/hooks/useCarrito.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import '../styles/header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCarrito();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const { t, i18n } = useTranslation();
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const isActive = ruta => location.pathname === ruta;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) setShowMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleIdioma = lang => {
    i18n.changeLanguage(lang);
  };

  useGSAP(
    () => {
      // Estado inicial para evitar parpadeos y asegurar visibilidad si JS falla
      // (Aunqe aquí estamos ya en JS, usar set + to es más predecible en React)
      gsap.set('.encabezado__barra', { y: -100, opacity: 0 });
      gsap.set('.encabezado__nav-enlace', { y: 10, opacity: 0 });

      // Animación sutil de entrada para la barra flotante
      gsap.to('.encabezado__barra', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out',
        delay: 0.1,
      });

      // Escalonado para los links de navegación
      gsap.to('.encabezado__nav-enlace', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.5,
      });
    },
    { scope: headerRef }
  );

  // Animación del badge del carrito
  useGSAP(() => {
    if (cartItems.length > 0) {
      gsap.fromTo(
        '.encabezado__badge',
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
      );
    }
  }, [cartItems.length]);

  // Animación del menú dropdown del perfil
  useGSAP(() => {
    if (!dropdownRef.current) return;

    if (showMenu) {
      // Menú container animation
      gsap.fromTo(
        dropdownRef.current,
        { autoAlpha: 0, scale: 0.96, y: 10 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out', overwrite: true }
      );

      // Staggered childrens
      const elements = gsap.utils.toArray(
        dropdownRef.current.querySelectorAll(
          '.menu-perfil__usuario, .menu-perfil__divisor, .menu-perfil__opcion'
        )
      );
      gsap.fromTo(
        elements,
        { autoAlpha: 0, x: -10 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.2,
          stagger: 0.04,
          ease: 'power2.out',
          delay: 0.05,
          overwrite: true,
        }
      );
    } else {
      gsap.to(dropdownRef.current, {
        autoAlpha: 0,
        scale: 0.96,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        overwrite: true,
      });
    }
  }, [showMenu]);

  return (
    <>
      <header className="encabezado" ref={headerRef}>
        <div className="encabezado__barra">
          {/* SECCIÓN IZQUIERDA: LOGO */}
          <div className="encabezado__seccion encabezado__seccion--izquierda">
            <Link className="encabezado__logo-link" to="/">
              <div className="encabezado__logo-icono">
                <img alt="Sabor" className="encabezado__logo-imagen" src="/images/logo_sabor.png" />
              </div>
              <span className="encabezado__logo-texto">SABOR</span>
            </Link>
          </div>

          {/* SECCIÓN CENTRO: NAVEGACIÓN (Escritorio) */}
          <div className="encabezado__seccion encabezado__seccion--centro">
            <nav className="encabezado__nav">
              <Link
                className={`encabezado__nav-enlace ${isActive('/') ? 'encabezado__nav-enlace--activo' : ''}`}
                to="/"
              >
                {t('menu', 'Menú')}
              </Link>
              <Link
                className={`encabezado__nav-enlace ${isActive('/reservas') ? 'encabezado__nav-enlace--activo' : ''}`}
                to="/reservas"
              >
                {t('reservas.titulo_corto', 'Reservas')}
              </Link>
              <Link
                className={`encabezado__nav-enlace ${isActive('/productos') ? 'encabezado__nav-enlace--activo' : ''}`}
                to="/productos"
              >
                {t('carta', 'Carta')}
              </Link>
            </nav>
          </div>

          {/* SECCIÓN DERECHA: ACCIONES */}
          <div className="encabezado__seccion encabezado__seccion--derecha">
            <div
              className="encabezado__perfil-contenedor"
              onMouseEnter={() => !isMobile && setShowMenu(true)}
              onMouseLeave={() => !isMobile && setShowMenu(false)}
            >
              <button
                className="encabezado__accion"
                onClick={() =>
                  isMobile ? setShowMenu(!showMenu) : isAuthenticated ? null : navigate('/login')
                }
              >
                {isAuthenticated && user?.imagen_usuario ? (
                  <img
                    src={getImageUrl(user.imagen_usuario)}
                    alt="Perfil"
                    className="encabezado__icono-cliente--foto"
                    style={{ width: '24px', height: '24px' }}
                  />
                ) : (
                  <IoPersonOutline size={20} />
                )}
              </button>

              <div
                className="menu-perfil"
                ref={dropdownRef}
                style={{
                  visibility: 'hidden',
                  opacity: 0,
                  pointerEvents: showMenu ? 'auto' : 'none',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div className="menu-perfil__usuario">
                      {user?.imagen_usuario ? (
                        <img
                          src={getImageUrl(user.imagen_usuario)}
                          alt="Perfil"
                          className="menu-perfil__avatar"
                        />
                      ) : (
                        <div className="menu-perfil__avatar-fallback">
                          <IoPersonOutline size={20} />
                        </div>
                      )}
                      <div className="menu-perfil__info">
                        <span className="menu-perfil__nombre">{user?.nombre_usuario}</span>
                        <span className="menu-perfil__correo">{user?.correo_usuario}</span>
                      </div>
                    </div>

                    <div className="menu-perfil__divisor"></div>

                    <Link
                      className="menu-perfil__opcion"
                      to="/actualizar-datos"
                      onClick={() => isMobile && setShowMenu(false)}
                    >
                      <IoSettingsOutline size={18} />
                      {t('actualizar_datos')}
                    </Link>
                    <Link
                      className="menu-perfil__opcion"
                      to="/historial-pedidos"
                      onClick={() => isMobile && setShowMenu(false)}
                    >
                      <IoBagHandleOutline size={18} />
                      {t('ver_historial_pedidos')}
                    </Link>
                    <Link
                      className="menu-perfil__opcion"
                      to="/historial-reservas"
                      onClick={() => isMobile && setShowMenu(false)}
                    >
                      <IoCalendarOutline size={18} />
                      {t('ver_historial_reservas')}
                    </Link>

                    <div className="menu-perfil__divisor"></div>

                    <button
                      className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion"
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                    >
                      <IoLogOutOutline size={18} />
                      {t('cerrar_sesion')}
                    </button>
                  </>
                ) : (
                  <Link
                    className="menu-perfil__opcion"
                    to="/login"
                    onClick={() => setShowMenu(false)}
                  >
                    <IoPersonOutline size={18} />
                    {t('iniciar_sesion')}
                  </Link>
                )}

                {/* Selector de Idioma en el Menú */}
                <div className="menu-perfil__opcion menu-perfil__opcion--idioma">
                  <span>{t('idioma', 'Idioma')}</span>
                  <div className="menu-perfil__idiomas-grid">
                    <button
                      className={`menu-perfil__idioma-boton ${i18n.language === 'es' ? 'menu-perfil__idioma-boton--activo' : ''}`}
                      onClick={() => handleIdioma('es')}
                    >
                      <ReactCountryFlag svg countryCode="ES" />
                    </button>
                    <button
                      className={`menu-perfil__idioma-boton ${i18n.language === 'en' ? 'menu-perfil__idioma-boton--activo' : ''}`}
                      onClick={() => handleIdioma('en')}
                    >
                      <ReactCountryFlag svg countryCode="US" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Link className="encabezado__accion encabezado__accion--carrito" to="/carrito">
              <IoCartOutline size={22} />
              {cartItems.length > 0 && (
                <span className="encabezado__badge">{cartItems.length}</span>
              )}
            </Link>

            {isMobile && (
              <button className="encabezado__accion" onClick={() => setShowMenu(!showMenu)}>
                {showMenu ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
