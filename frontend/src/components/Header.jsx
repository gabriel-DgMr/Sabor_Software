import { useEffect, useState } from 'react';
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from '../pages/auth/index.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const { t, i18n } = useTranslation();

  const handleResize = () => {
    setIsMobileMenu(window.innerWidth <= 769);
    if (window.innerWidth > 769) setShowMenu(false);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => setShowMenu((prev) => !prev);
  const closeMobileMenu = () => setShowMenu(false);

  const handleIdioma = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <header className="encabezado">
        <div className="encabezado__contenedor">
          <Link to="/"><img alt="Logo Sabor" className="encabezado__logo" src="/images/logo_sabor.png" /></Link>

          <div className="encabezado__informacion">

            <nav className="encabezado__links">
              <Link to="/quienes-somos" className="encabezado__link">{t('quienes_somos')}</Link>
              <Link to="/sobre-nosotros" className="encabezado__link">{t('sobre_nosotros')}</Link>
            </nav>

            <nav className="encabezado__idioma" aria-label="Selector de idioma">
              <button
                type="button"
                className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                aria-label="Cambiar a español"
                title="Español"
                aria-pressed={i18n.language === 'es'}
                onClick={() => handleIdioma('es')}
              >
                <ReactCountryFlag countryCode="ES" svg />
              </button>
              <button
                type="button"
                className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                aria-label="Cambiar a inglés"
                title="English"
                aria-pressed={i18n.language === 'en'}
                onClick={() => handleIdioma('en')}
              >
                <ReactCountryFlag countryCode="US" svg />
              </button>
            </nav>

            {isMobileMenu ? (
              user ? (
                <div className="encabezado__usuario encabezado__usuario--mobile">
                  <button
                    aria-label="Abrir menú de usuario"
                    className="menu-hamburguesa"
                    onClick={toggleMobileMenu}
                  >
                    {!showMenu && <FaBars size={32} />}
                  </button>
                  {showMenu && (
                    <div className="menu-perfil menu-perfil--mobile">
                      <button
                        aria-label="Cerrar menú"
                        className="menu-perfil__cerrar"
                        onClick={closeMobileMenu}
                      >
                        <FaTimes />
                      </button>
                      <div className="menu-perfil__opcion menu-perfil__opcion--idioma">
                        <button
                          className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          aria-label="Cambiar a español"
                          onClick={() => handleIdioma('es')}
                        >
                          <ReactCountryFlag svg countryCode="ES" />
                        </button>
                        <button
                          className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          aria-label="Cambiar a inglés"
                          onClick={() => handleIdioma('en')}
                        >
                          <ReactCountryFlag svg countryCode="US" />
                        </button>
                      </div>
                      <Link className="menu-perfil__opcion" to="/historial-pedidos" onClick={closeMobileMenu}>{t('ver_historial_pedidos')}</Link>
                      <Link className="menu-perfil__opcion" to="/historial-reservas" onClick={closeMobileMenu}>{t('ver_historial_reservas')}</Link>
                      <Link className="menu-perfil__opcion" to="/actualizar-datos" onClick={closeMobileMenu}>{t('actualizar_datos')}</Link>
                      <button className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion" onClick={() => { logout(); closeMobileMenu(); }}>{t('cerrar_sesion')}</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="encabezado__usuario" onClick={() => setShowLogin(true)}>
                  <p className="encabezado__nombre-usuario">{t('iniciar_sesion')}</p>
                  <FaUserCircle className="encabezado__icono-usuario" size={32} />
                </div>
              )
            ) : (
              user ? (
                <div
                  className="encabezado__usuario"
                  onMouseEnter={() => setShowMenu(true)}
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <p className="encabezado__nombre-usuario">{t('iniciar_sesion')}</p>
                  <FaUserCircle className="encabezado__icono-usuario" size={32} />
                  {showMenu && (
                    <div className="menu-perfil">
                      <Link className="menu-perfil__opcion" to="/historial-pedidos">{t('ver_historial_pedidos')}</Link>
                      <Link className="menu-perfil__opcion" to="/historial-reservas">{t('ver_historial_reservas')}</Link>
                      <Link className="menu-perfil__opcion" to="/actualizar-datos">{t('actualizar_datos')}</Link>
                      <button className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion" onClick={logout}>{t('cerrar_sesion')}</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="encabezado__usuario" onClick={() => setShowLogin(true)}>
                  <p className="encabezado__nombre-usuario">{t('iniciar_sesion')}</p>
                  <FaUserCircle className="encabezado__icono-usuario" size={32} />
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <AuthPage isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Header;
