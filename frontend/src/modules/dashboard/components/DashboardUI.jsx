import React from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiUsers, FiBox, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';
import MenuLateral from './MenuLateralAdministrador';
import '../styles/dashboard.css';

const DashboardUI = ({ handleNavigate }) => {
  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <DashboardHeader
          titulo="Panel de Control"
          subtitulo="Resumen general de la operación de hoy."
        />

        <div className="bento-grid">
          {/* Card Principal - Ventas Totales */}
          <DashboardCard
            titulo="Ventas de Hoy"
            valor="$2.4M"
            icon={<FiTrendingUp />}
            type="primario"
            gridClass="bento-card--grande"
            onClick={handleNavigate('/administrar/panel/ventas')}
          />

          {/* Pedidos Activos */}
          <DashboardCard
            titulo="Pedidos Activos"
            valor="12"
            icon={<FiShoppingCart />}
            onClick={handleNavigate('/administrar/pedidos')}
          />

          {/* Reservas para hoy */}
          <DashboardCard
            titulo="Reservas Hoy"
            valor="8"
            icon={<FiCalendar />}
            onClick={handleNavigate('/administrar/reservaciones')}
          />

          {/* Gestionar Clientes */}
          <DashboardCard
            titulo="Clientes"
            valor="156"
            icon={<FiUsers />}
            gridClass="bento-card--ancho"
            onClick={handleNavigate('/administrar/panel/usuarios')}
          />

          {/* Inventario */}
          <DashboardCard
            titulo="Inventario"
            valor="Low"
            icon={<FiBox />}
            type="alto"
            onClick={handleNavigate('/administrar/panel/inventario')}
          />

          {/* Más acciones rápidas podrían ir aquí */}
        </div>
      </main>
    </div>
  );
};

DashboardUI.propTypes = {
  handleNavigate: PropTypes.func.isRequired,
};

export default DashboardUI;
