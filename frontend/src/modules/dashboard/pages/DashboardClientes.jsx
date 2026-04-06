import React from 'react';
import { useDashboardClientes } from '../hooks/useDashboardClientes';
import DashboardClientesUI from '../components/DashboardClientesUI';

const DashboardClientes = () => {
  const dashboardData = useDashboardClientes();
  return <DashboardClientesUI {...dashboardData} />;
};

export default DashboardClientes;
