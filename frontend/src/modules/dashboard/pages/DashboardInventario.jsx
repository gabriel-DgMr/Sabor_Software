import React from 'react';
import { useDashboardInventario } from '../hooks/useDashboardInventario';
import DashboardInventarioUI from '../components/DashboardInventarioUI';

const DashboardInventario = () => {
  const dashboardData = useDashboardInventario();
  return <DashboardInventarioUI {...dashboardData} />;
};

export default DashboardInventario;
