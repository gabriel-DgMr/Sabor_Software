import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from '../pages/auth/index.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="encabezado">
        <div className="encabezado__contenedor">
          <Link to="/"><img alt="Logo Sabor" className="encabezado__logo" src="/images/logo_sabor.png" /></Link>

          <div className="encabezado__informacion">
            <span aria-label="Bandera de España" className="encabezado__idioma" role="img">
              🇪🇸
            </span>

            {user ? (
              <div className="encabezado__usuario" onClick={logout}>
                <p className="encabezado__nombre-usuario">{user.nombre_cliente}</p>
                <FaUserCircle className="encabezado__icono-usuario" size={32} />
              </div>
            ) : (
              <div className="encabezado__usuario" onClick={() => setShowLogin(true)}>
                <p className="encabezado__nombre-usuario">Iniciar sesión</p>
                <FaUserCircle className="encabezado__icono-usuario" size={32} />
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
