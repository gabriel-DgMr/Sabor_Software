import React from 'react';
import { useDashboardVentas } from '../hooks/useDashboardVentas';
import DashboardVentasUI from '../components/DashboardVentasUI';

const DashboardVentas = () => {
  const dashboardData = useDashboardVentas();
  return <DashboardVentasUI {...dashboardData} />;
};

export default DashboardVentas;
