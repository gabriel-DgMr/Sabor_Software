import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';
// Puedes instalar chart.js y react-chartjs-2 si no están: npm install chart.js react-chartjs-2
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardClientes = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!metrics) return <div>Error cargando métricas</div>;

  // Datos para tarjetas
  const { views, visitas, usuarios_nuevos, usuarios_activos, usuariosPorDia, pedidosPorHora } =
    metrics;

  // Datos para gráfico de línea
  const lineData = {
    labels: usuariosPorDia.map(d => d.fecha),
    datasets: [
      {
        label: 'Total de usuarios',
        data: usuariosPorDia.map(d => d.cantidad),
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderColor: '#FF9800',
        tension: 0.4,
      },
    ],
  };

  // Datos para gráfico de dona
  const franjas = ['8 am - 12 pm', '12 pm - 4 pm', '4 pm - 8 pm', '8 pm - 12 am'];
  const pedidosPorFranja = franjas.map(
    f => pedidosPorHora.find(p => p.franja === f)?.cantidad || 0
  );
  const totalPedidos = pedidosPorFranja.reduce((a, b) => a + b, 0);
  const porcentajes = pedidosPorFranja.map(c =>
    totalPedidos ? ((c / totalPedidos) * 100).toFixed(1) : 0
  );
  const doughnutData = {
    labels: franjas,
    datasets: [
      {
        data: pedidosPorFranja,
        backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#E91E63'],
      },
    ],
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="dashboard__clientes" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Clientes</h1>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div
            style={{
              background: '#FF9800',
              color: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: 180,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontSize: 18 }}>Views</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{views} Personas</div>
          </div>
          <div
            style={{
              background: '#FF9800',
              color: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: 180,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontSize: 18 }}>Visitas</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{visitas} Personas</div>
          </div>
          <div
            style={{
              background: '#FF9800',
              color: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: 180,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontSize: 18 }}>Usuarios nuevos</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{usuarios_nuevos} Personas</div>
          </div>
          <div
            style={{
              background: '#FF9800',
              color: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: 180,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontSize: 18 }}>Usuarios Activos</div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>{usuarios_activos} Personas</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              flex: 2,
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Total de usuarios</div>
            <Line
              data={lineData}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
              height={180}
            />
          </div>
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Tiempo por Ganancia</div>
            <Doughnut
              data={doughnutData}
              options={{ plugins: { legend: { position: 'right' } } }}
            />
            <ul style={{ marginTop: 16, fontSize: 14 }}>
              {franjas.map((f, i) => (
                <li key={f}>
                  <span
                    style={{ color: doughnutData.datasets[0].backgroundColor[i], fontWeight: 600 }}
                  >
                    ●
                  </span>{' '}
                  {f}: {porcentajes[i]}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClientes;
