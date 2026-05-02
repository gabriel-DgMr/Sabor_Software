import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/dashboard.css';

const HomeAdministrador = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `Sabor: ${t('admin.menu.panel')}`;
  }, [t]);

  const opciones = [
    { titulo: t('admin.home.opc_usuarios'), ruta: '/administrador/usuarios' },
    { titulo: t('admin.home.opc_reservas'), ruta: '/administrador/reservaciones' },
    { titulo: t('admin.home.opc_productos'), ruta: '/administrador/productos' },
    { titulo: t('admin.home.opc_pedidos'), ruta: '/administrador/pedidos' },
    { titulo: t('admin.home.opc_domicilios'), ruta: '/administrador/domicilios' },
    { titulo: t('admin.home.opc_banners'), ruta: '/administrador/banners' },
    { titulo: t('admin.home.opc_panel'), ruta: '/administrador/panel' },
  ];

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <DashboardHeader titulo={t('admin.home.titulo')} subtitulo={t('admin.home.subtitulo')} />

        <section className="tablero__contenido">
          <nav aria-label={t('admin.home.titulo')}>
            <ul className="grilla-actions">
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
