import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import MenuLateralEmpleados from '../components/MenuLateralEmpleado';
import '../styles/empleados.css';

const EmpleadosHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sabor: Empleados Home';
  }, []);

  return (
    <div className="layout">
      <MenuLateralEmpleados />
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
                  onClick={() => navigate('/emplado/reservaciones')}
                >
                  Administrar Reservaciones
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/empleado/productos')}
                >
                  Administrar Productos
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/empleado/pedidos')}
                >
                  Administrar Pedidos
                </button>
              </li>
              <li className="acciones-principales__item">
                <button
                  className="acciones-principales__boton"
                  onClick={() => navigate('/empleado/domicilios')}
                >
                  Administrar Domicilios
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
