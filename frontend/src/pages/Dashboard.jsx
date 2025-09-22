import React from 'react';
import { useNavigate } from 'react-router-dom';

import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="layout">
      <MenuLateral />
      <main className="contenido-principal">
        <h1 className="titulos__empleados">Dashboard</h1>
        <article className="contenido-principal__opciones">
          <h2 className="contenido-principal__subtitulo">¿Qué deseas hacer el día de hoy?</h2>
          <nav aria-label="Acciones principales">
            <ul className="acciones-principales">
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton dashboard__acciones"
                  onClick={() => navigate('/administrar/panel/ventas')}
                >
                  Ventas
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton dashboard__acciones"
                  onClick={() => navigate('/administrar/panel/clientes')}
                >
                  Usuarios
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton dashboard__acciones"
                  onClick={() => navigate('/administrar/panel/inventario')}
                >
                  Inventario
                </button>
              </li>
            </ul>
          </nav>
        </article>
      </main>
    </div>
  );
};

export default Dashboard;
