import React from 'react';
import { useDashboardEmpleados } from '../hooks/useDashboardEmpleados';
import DashboardEmpleadosUI from '../components/DashboardEmpleadosUI';

const DashboardEmpleados = () => {
  const dashboardData = useDashboardEmpleados();
  return <DashboardEmpleadosUI {...dashboardData} />;
};

export default DashboardEmpleados;
