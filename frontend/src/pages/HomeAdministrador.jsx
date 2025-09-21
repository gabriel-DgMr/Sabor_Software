import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';

const EmpleadosHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sabor: Empleados Home';
  }, []);

  return (
    <div className="layout">
      <MenuLateral />
      <main className="contenido-principal">
        <header>
          <h1 className="titulos__empleados">¡Bienvenido!</h1>
        </header>

        <section className="contenido-principal__opciones">
          <h2 className="contenido-principal__subtitulo">¿Qué deseas hacer el día de hoy?</h2>
          <nav aria-label="Acciones principales">
            <ul className="acciones-principales">
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/usuarios')}
                >
                  Gestión de Usuarios
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrar/reservaciones')}
                >
                  Administrar Reservaciones
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/productos')}
                >
                  Administrar Productos
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/pedidos')}
                >
                  Administrar Pedidos
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/domicilios')}
                >
                  Administrar Domicilios
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/usuarios')}
                >
                  Administrar Usuarios
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/administrador/panel')}
                >
                  Ver reportes
                </button>
              </li>
            </ul>
          </nav>
        </section>
      </main>
    </div>
  );
};

export default EmpleadosHome;
