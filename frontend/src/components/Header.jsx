import { useEffect, useState } from 'react';
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from '../pages/auth/index.jsx';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
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
<<<<<<< HEAD
          <Link className="encabezado__logo" to="/">
            <img alt="Logo Sabor" src="/images/logo_sabor.png" />
          </Link>
=======
          <Link to="/"><img className="encabezado__logo" alt="Logo Sabor" src="/images/logo_sabor.png" /></Link>
>>>>>>> 66cfb2625080fe09d6184a0e66e612dad10bf129

          <div className="encabezado__informacion">

            <nav className="encabezado__links">
<<<<<<< HEAD
              {/* Estas opciones solo deben mostrarse en escritorio */}
              {!isMobileMenu && (
                <>
                  <Link className="encabezado__link" to="/quienes-somos">{t('quienes_somos')}</Link>
                  <Link className="encabezado__link" to="/sobre-nosotros">{t('sobre_nosotros')}</Link>
                </>
              )}
            </nav>
=======
              <Link className="encabezado__link" to="/quienes-somos">{t('quienes_somos')}</Link>
              <Link className="encabezado__link" to="/sobre-nosotros">{t('sobre_nosotros')}</Link>
            </nav>

>>>>>>> 66cfb2625080fe09d6184a0e66e612dad10bf129
            <nav aria-label="Selector de idioma" className="encabezado__idioma">
              <button
                aria-label="Cambiar a español"
                aria-pressed={i18n.language === 'es'}
                className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
<<<<<<< HEAD
=======
                title="Español"
                type="button"
>>>>>>> 66cfb2625080fe09d6184a0e66e612dad10bf129
                onClick={() => handleIdioma('es')}
                title="Español"
                type="button"
              >
                <ReactCountryFlag countryCode="ES" svg />
              </button>
              <button
                aria-label="Cambiar a inglés"
                aria-pressed={i18n.language === 'en'}
                className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
<<<<<<< HEAD
=======
                title="English"
                type="button"
>>>>>>> 66cfb2625080fe09d6184a0e66e612dad10bf129
                onClick={() => handleIdioma('en')}
                title="English"
                type="button"
              >
                <ReactCountryFlag countryCode="US" svg />
              </button>
            </nav>

            {isMobileMenu ? (
              isAuthenticated ? (
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
                      <Link className="menu-perfil__opcion" onClick={closeMobileMenu} to="/quienes-somos">{t('quienes_somos')}</Link>
                      <Link className="menu-perfil__opcion" onClick={closeMobileMenu} to="/sobre-nosotros">{t('sobre_nosotros')}</Link>
                      <div className="menu-perfil__opcion menu-perfil__opcion--idioma">
                        <button
                          aria-label="Cambiar a español"
                          className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('es')}
                        >
                          <ReactCountryFlag countryCode="ES" svg />
                        </button>
                        <button
                          aria-label="Cambiar a inglés"
                          className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('en')}
                        >
                          <ReactCountryFlag countryCode="US" svg />
                        </button>
                      </div>
<<<<<<< HEAD
=======
                      <div className="menu-perfil__opcion menu-perfil__opcion--usuario">
                        <span>{user?.nombre_cliente || user?.email_cliente}</span>
                      </div>
>>>>>>> 66cfb2625080fe09d6184a0e66e612dad10bf129
                      <Link className="menu-perfil__opcion" onClick={closeMobileMenu} to="/historial-pedidos">{t('ver_historial_pedidos')}</Link>
                      <Link className="menu-perfil__opcion" onClick={closeMobileMenu} to="/historial-reservas">{t('ver_historial_reservas')}</Link>
                      <Link className="menu-perfil__opcion" onClick={closeMobileMenu} to="/actualizar-datos">{t('actualizar_datos')}</Link>
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
              isAuthenticated ? (
                <div
                  className="encabezado__usuario"
                  onMouseEnter={() => setShowMenu(true)}
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <p className="encabezado__nombre-usuario">{user?.nombre_cliente || user?.email_cliente}</p>
                  <FaUserCircle className="encabezado__icono-usuario" size={32} />
                  {showMenu && (
                    <div className="menu-perfil">
                      <div className="menu-perfil__opcion menu-perfil__opcion--usuario">
                        <span>{user?.nombre_cliente || user?.email_cliente}</span>
                      </div>
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
