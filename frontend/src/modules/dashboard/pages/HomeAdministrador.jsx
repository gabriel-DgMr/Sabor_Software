import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/dashboard.css';

const HomeAdministrador = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sabor: Administración';
  }, []);

  const opciones = [
    { titulo: 'Administrar Usuarios', ruta: '/administrador/usuarios' },
    { titulo: 'Gestión de Reservaciones', ruta: '/administrador/reservaciones' },
    { titulo: 'Gestión de Productos', ruta: '/administrador/productos' },
    { titulo: 'Gestión de Pedidos', ruta: '/administrador/pedidos' },
    { titulo: 'Gestión de Domicilios', ruta: '/administrador/domicilios' },
    { titulo: 'Gestión de Banners', ruta: '/administrador/banners' },
    { titulo: 'Panel de Control', ruta: '/administrador/panel' },
  ];

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <DashboardHeader titulo="¡Bienvenido!" subtitulo="¿Qué deseas hacer el día de hoy?" />

        <section className="tablero__contenido">
          <nav aria-label="Acciones principales">
            <ul className="grilla-acciones">
              {opciones.map((opcion, index) => (
                <DashboardCard
                  key={index}
                  titulo={opcion.titulo}
                  onClick={() => navigate(opcion.ruta)}
                />
              ))}
            </ul>
          </nav>
        </section>
      </main>
    </div>
  );
};

export default HomeAdministrador;
