import { useState } from 'react';
import ReactCountryFlag from "react-country-flag";
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from '../pages/auth/index.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [idioma, setIdioma] = useState('es');

  // Detectar si es móvil
  const handleResize = () => {
    if (window.innerWidth <= 769) {
      setIsMobileMenu(true);
    } else {
      setIsMobileMenu(false);
      setShowMenu(false);
    }
  };

  // Efecto para escuchar el resize
  useState(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para alternar menú en móvil
  const toggleMobileMenu = () => setShowMenu((prev) => !prev);
  const closeMobileMenu = () => setShowMenu(false);

  const handleIdioma = (lang) => {
    setIdioma(lang);
    // Aquí puedes agregar lógica para cambiar el idioma global (i18n)
  };

  return (
    <>
      <header className="encabezado">
        <div className="encabezado__contenedor">
          <Link to="/"><img alt="Logo Sabor" className="encabezado__logo" src="/images/logo_sabor.png" /></Link>

          <div className="encabezado__informacion">
              <nav className="encabezado__idioma" aria-label="Selector de idioma">
                <button
                  type="button"
                  className={`menu-perfil__idioma-boton${idioma === 'es' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                  aria-label="Cambiar a español"
                  title="Español"
                  aria-pressed={idioma === 'es'}
                  onClick={() => handleIdioma('es')}
                >
                  <ReactCountryFlag countryCode="ES" svg />
                </button>
                <button
                  type="button"
                  className={`menu-perfil__idioma-boton${idioma === 'en' ? ' menu-perfil__idioma-boton--activo' : ''}`}
                  aria-label="Cambiar a inglés"
                  title="English"
                  aria-pressed={idioma === 'en'}
                  onClick={() => handleIdioma('en')}
                >
                  <ReactCountryFlag countryCode="US" svg />
                </button>
              </nav>

            {isMobileMenu ? (
              user ? (
                <div className="encabezado__usuario encabezado__usuario--mobile">
                  <button
                    className="menu-hamburguesa"
                    onClick={toggleMobileMenu}
                    aria-label="Abrir menú de usuario"
                  >
                    {!showMenu && <FaBars size={32} />}
                  </button>
                  {showMenu && (
                    <div className="menu-perfil menu-perfil--mobile">
                      <button
                        className="menu-perfil__cerrar"
                        aria-label="Cerrar menú"
                        onClick={closeMobileMenu}
                      >
                        <FaTimes />
                      </button>
                      <div className="menu-perfil__opcion menu-perfil__opcion--idioma">
                        <button
                          className="menu-perfil__idioma-boton"
                          aria-label="Cambiar a español"
                        >
                          <ReactCountryFlag countryCode="ES" svg />
                        </button>
                        <button
                          className="menu-perfil__idioma-boton"
                          aria-label="Cambiar a inglés"
                        >
                          <ReactCountryFlag countryCode="US" svg />
                        </button>
                      </div>
                      <Link className="menu-perfil__opcion" to="/historial-pedidos" onClick={closeMobileMenu}>Ver historial de pedidos</Link>
                      <Link className="menu-perfil__opcion" to="/historial-reservas" onClick={closeMobileMenu}>Ver historial de reservaciones</Link>
                      <Link className="menu-perfil__opcion" to="/actualizar-datos" onClick={closeMobileMenu}>Actulizar datos</Link>
                      <button className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion" onClick={() => { logout(); closeMobileMenu(); }}>Cerrar sesión</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="encabezado__usuario" onClick={() => setShowLogin(true)}>
                  <p className="encabezado__nombre-usuario">Iniciar sesión</p>
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
                  <p className="encabezado__nombre-usuario">{user.nombre_cliente}</p>
                  <FaUserCircle className="encabezado__icono-usuario" size={32} />
                  {showMenu && (
                    <div className="menu-perfil">
                      <Link className="menu-perfil__opcion" to="/historial-pedidos">Ver historial de pedidos</Link>
                      <Link className="menu-perfil__opcion" to="/historial-reservas">Ver historial de reservaciones</Link>
                      <Link className="menu-perfil__opcion" to="/actualizar-datos">Actulizar datos</Link>
                      <button className="menu-perfil__opcion menu-perfil__opcion--cerrar-sesion" onClick={logout}>Cerrar sesión</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="encabezado__usuario" onClick={() => setShowLogin(true)}>
                  <p className="encabezado__nombre-usuario">Iniciar sesión</p>
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
