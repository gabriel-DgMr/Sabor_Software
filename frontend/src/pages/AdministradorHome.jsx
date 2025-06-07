import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import MenuLateral from '../components/MenuLateral.jsx';
import '../styles/empleados.css';


const AdministradorHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Sabor: Empleados Home';
  }, []);
  return (
    <>
      <div className='layout'>
  <MenuLateral />

  <main className="contenido-principal">
    <header>
      <h1 className="contenido-principal__titulo">¡Bienvenido!</h1>
    </header>

    <section className="contenido-principal__opciones">
      <h2 className="contenido-principal__subtitulo">
        ¿Qué deseas hacer el día de hoy?
      </h2>

      <nav aria-label="Acciones principales">
  <ul className="acciones-principales">
    <li className="acciones-principales__item">
      <button className="acciones-principales__boton" onClick={() => navigate('/administrar/reservaciones')}>Administrar Reservaciones</button>
    </li>
    <li className="acciones-principales__item">
      <button className="acciones-principales__boton" onClick={() => navigate('/administrar/productos')}>Administrar Productos</button>
    </li>
    <li className="acciones-principales__item">
      <button className="acciones-principales__boton" onClick={() => navigate('/administrar/pedidos')}>Administrar Pedidos</button>
    </li>
    <li className="acciones-principales__item">
      <button className="acciones-principales__boton" onClick={() => navigate('/administrar/panel')}>Ver panel de control</button>
    </li>
  </ul>
</nav>

    </section>
  </main>
  </div>
</>
  );
};

export default AdministradorHome;
