import { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
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

  const toggleMobileMenu = () => setShowMenu(prev => !prev);
  const closeMobileMenu = () => setShowMenu(false);

  const handleIdioma = lang => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <header className="encabezado">
        <div className="encabezado__contenedor">
          <Link to="/">
            <img alt="Logo Sabor" className="encabezado__logo" src="/images/logo_sabor.png" />
          </Link>
          <div className="encabezado__informacion">
            <nav className="encabezado__links">
              {/* Estas opciones solo deben mostrarse en escritorio */}
              {!isMobileMenu && (
                <>
                  <Link className="encabezado__link" to="/quienes-somos">
                    {t('quienes_somos')}
                  </Link>
                  <Link className="encabezado__link" to="/sobre-nosotros">
                    {t('sobre_nosotros')}
                  </Link>
                </>
              )}
            </nav>
            <nav aria-label="Selector de idioma" className="encabezado__idioma">
              <button
                aria-label="Cambiar a español"
                aria-pressed={i18n.language === 'es'}
                className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                title="Español"
                type="button"
                onClick={() => handleIdioma('es')}
              >
                <ReactCountryFlag svg countryCode="ES" />
              </button>
              <button
                aria-label="Cambiar a inglés"
                aria-pressed={i18n.language === 'en'}
                className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                title="English"
                type="button"
                onClick={() => handleIdioma('en')}
              >
                <ReactCountryFlag svg countryCode="US" />
              </button>
            </nav>

            {isMobileMenu ? (
              isAuthenticated ? (
                <div className="encabezado__cliente encabezado__cliente--mobile">
                  <button
                    aria-label="Abrir menú de cliente"
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
                          aria-label="Cambiar a español"
                          className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('es')}
                        >
                          <ReactCountryFlag svg countryCode="ES" />
                        </button>
                        <button
                          aria-label="Cambiar a inglés"
                          className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('en')}
                        >
                          <ReactCountryFlag svg countryCode="US" />
                        </button>
                      </div>
                      <Link
                        className="menu-perfil__opcion"
                        to="/quienes-somos"
                        onClick={closeMobileMenu}
                      >
                        {t('quienes_somos')}
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/sobre-nosotros"
                        onClick={closeMobileMenu}
                      >
                        {t('sobre_nosotros')}
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/historial-pedidos"
                        onClick={closeMobileMenu}
                      >
                        {t('ver_historial_pedidos')}
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/historial-reservas"
                        onClick={closeMobileMenu}
                      >
                        {t('ver_historial_reservas')}
                      </Link>
                      {/* NUEVO: Botón historial de domicilios (móvil) */}
                      <Link
                        className="menu-perfil__opcion"
                        to="/historial-domicilios"
                        onClick={closeMobileMenu}
                      >
                        {t('ver_historial_domicilios', 'Ver historial de domicilios')}
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/mis-calificaciones"
                        onClick={closeMobileMenu}
                      >
                        Mis Calificaciones
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/actualizar-datos"
                        onClick={closeMobileMenu}
                      >
                        {t('actualizar_datos')}
                      </Link>
                      <button
                        className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion"
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                      >
                        {t('cerrar_sesion')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="encabezado__cliente encabezado__cliente--mobile">
                  <button
                    aria-label="Abrir menú"
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
                          aria-label="Cambiar a español"
                          className={`menu-perfil__idioma-boton${i18n.language === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('es')}
                        >
                          <ReactCountryFlag svg countryCode="ES" />
                        </button>
                        <button
                          aria-label="Cambiar a inglés"
                          className={`menu-perfil__idioma-boton${i18n.language === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                          onClick={() => handleIdioma('en')}
                        >
                          <ReactCountryFlag svg countryCode="US" />
                        </button>
                      </div>
                      <Link
                        className="menu-perfil__opcion"
                        to="/quienes-somos"
                        onClick={closeMobileMenu}
                      >
                        {t('quienes_somos')}
                      </Link>
                      <Link
                        className="menu-perfil__opcion"
                        to="/sobre-nosotros"
                        onClick={closeMobileMenu}
                      >
                        {t('sobre_nosotros')}
                      </Link>
                      <button
                        className="menu-perfil__opcion"
                        onClick={() => {
                          setShowLogin(true);
                          closeMobileMenu();
                        }}
                      >
                        {t('iniciar_sesion')}
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : isAuthenticated ? (
              <div
                className="encabezado__cliente"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <p className="encabezado__nombre-cliente">
                  {user?.nombre_usuario || user?.correo_usuario}
                </p>
                {user?.imagen_usuario ? (
                  <img
                    src={`http://localhost:3000/uploads/${user.imagen_usuario}`}
                    alt="Foto de perfil"
                    className="encabezado__icono-cliente encabezado__icono-cliente--foto"
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle className="encabezado__icono-cliente" size={32} />
                )}
                {showMenu && (
                  <div className="menu-perfil">
                    <Link className="menu-perfil__opcion" to="/historial-pedidos">
                      {t('ver_historial_pedidos')}
                    </Link>
                    <Link className="menu-perfil__opcion" to="/historial-reservas">
                      {t('ver_historial_reservas')}
                    </Link>
                    <Link className="menu-perfil__opcion" to="/mis-calificaciones">
                      Mis Calificaciones
                    </Link>
                    {/* NUEVO: Botón historial de domicilios (escritorio) */}
                    <Link className="menu-perfil__opcion" to="/historial-domicilios">
                      {t('ver_historial_domicilios', 'Ver historial de domicilios')}
                    </Link>
                    <Link className="menu-perfil__opcion" to="/actualizar-datos">
                      {t('actualizar_datos')}
                    </Link>
                    <button
                      className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion"
                      onClick={logout}
                    >
                      {t('cerrar_sesion')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="encabezado__cliente" onClick={() => setShowLogin(true)}>
                <p className="encabezado__nombre-cliente">{t('iniciar_sesion')}</p>
                {user?.imagen_usuario ? (
                  <img
                    src={`http://localhost:3000/uploads/${user.imagen_usuario}`}
                    alt="Foto de perfil"
                    className="encabezado__icono-cliente encabezado__icono-cliente--foto"
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle className="encabezado__icono-cliente" size={32} />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthPage isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Header;
