import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error al cargar métricas:', err);
        setError(err.response?.data?.error || err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard__clientes" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Clientes</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>Error al cargar el dashboard</h3>
            <p>{error}</p>
            <p style={{ fontSize: 14, marginTop: 16 }}>
              {error.includes('403') || error.includes('No autorizado') ? (
                <>
                  <strong>Problema de autorización:</strong> Tu sesión puede haber expirado o no
                  tienes permisos de administrador.
                  <br />
                  <a href="/login" style={{ color: '#c62828', textDecoration: 'underline' }}>
                    Haz clic aquí para iniciar sesión nuevamente
                  </a>
                </>
              ) : (
                'Verifica que la base de datos esté configurada correctamente y que el servidor esté funcionando.'
              )}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!metrics) return <div>Error cargando métricas</div>;

  const { views, visitas, usuarios_nuevos, usuarios_activos, usuariosPorDia, pedidosPorHora } =
    metrics;

  // 📈 Gráfico de línea
  const lineData = {
    labels:
      usuariosPorDia && usuariosPorDia.length > 0
        ? usuariosPorDia.map(d => {
            const fecha = new Date(d.fecha);
            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
          })
        : ['Sin datos'],
    datasets: [
      {
        label: 'Usuarios registrados',
        data:
          usuariosPorDia && usuariosPorDia.length > 0
            ? usuariosPorDia.map(d => d.cantidad || 0)
            : [0],
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderColor: '#FF9800',
        tension: 0.4,
        pointBackgroundColor: '#FF9800',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // 🍩 Gráfico de dona
  const horas =
    pedidosPorHora && pedidosPorHora.length > 0
      ? pedidosPorHora.map(p =>
          typeof p.hora === 'number' ? `${p.hora.toString().padStart(2, '0')}:00` : p.hora
        )
      : ['Sin datos'];

  const pedidosPorHoras =
    pedidosPorHora && pedidosPorHora.length > 0 ? pedidosPorHora.map(p => p.cantidad || 0) : [0];

  const totalPedidos = pedidosPorHoras.reduce((a, b) => a + b, 0);
  const porcentajes = pedidosPorHoras.map(c =>
    totalPedidos > 0 ? ((c / totalPedidos) * 100).toFixed(1) : 0
  );

  const doughnutData = {
    labels: horas,
    datasets: [
      {
        data: pedidosPorHoras,
        backgroundColor: [
          '#FF9800',
          '#4CAF50',
          '#2196F3',
          '#E91E63',
          '#9C27B0',
          '#3F51B5',
          '#00BCD4',
          '#8BC34A',
          '#FFC107',
          '#795548',
          '#607D8B',
          '#FF5722',
          '#673AB7',
          '#009688',
          '#CDDC39',
        ],
      },
    ],
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="dashboard__clientes" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Clientes</h1>

        {/* Tarjetas métricas */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          {[
            {
              label: 'Usuarios Únicos',
              value: `${views || 0} Personas`,
              description: 'Últimos 7 días',
            },
            {
              label: 'Total Visitas',
              value: `${visitas || 0} Sesiones`,
              description: 'Últimos 7 días',
            },
            {
              label: 'Usuarios Nuevos',
              value: `${usuarios_nuevos || 0} Personas`,
              description: 'Hoy',
            },
            {
              label: 'Usuarios Activos',
              value: `${usuarios_activos || 0} Personas`,
              description: 'Últimos 30 días',
            },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: '#FF9800',
                color: '#fff',
                borderRadius: 12,
                padding: 24,
                minWidth: 180,
                boxShadow: '0 2px 8px #0001',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{card.description}</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 600, marginTop: 8 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Gráficas */}
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Usuarios Registrados por Día</div>
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Pedidos por Hora</div>
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'right' } } }} />
            {totalPedidos > 0 ? (
              <ul style={{ marginTop: 16, fontSize: 14 }}>
                {horas.map((h, i) => (
                  <li key={h} style={{ marginBottom: 4 }}>
                    <span
                      style={{
                        color: doughnutData.datasets[0].backgroundColor[i],
                        fontWeight: 600,
                      }}
                    >
                      ●
                    </span>{' '}
                    {h}: {porcentajes[i]}%
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#666',
                  textAlign: 'center',
                  padding: 20,
                }}
              >
                No hay datos de pedidos disponibles
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClientes;
