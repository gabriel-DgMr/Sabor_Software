import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import MenuLateralEmpleados from '../components/MenuLateralEmpleado';
import '../styles/dashboard.css';

const HomeEmpleados = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sabor: Panel de Empleado';
  }, []);

  const opciones = [
    { titulo: 'Administrar Reservaciones', ruta: '/emplado/reservaciones' },
    { titulo: 'Administrar Productos', ruta: '/empleado/productos' },
    { titulo: 'Administrar Pedidos', ruta: '/empleado/pedidos' },
    { titulo: 'Administrar Domicilios', ruta: '/empleado/domicilios' },
  ];

  return (
    <div className="tablero">
      <MenuLateralEmpleados />
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

export default HomeEmpleados;
