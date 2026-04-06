import React from 'react';
import useDashboard from '../hooks/useDashboard';
import DashboardUI from '../components/DashboardUI';

const Dashboard = () => {
  const dashboardData = useDashboard();
  return <DashboardUI {...dashboardData} />;
};

export default Dashboard;
