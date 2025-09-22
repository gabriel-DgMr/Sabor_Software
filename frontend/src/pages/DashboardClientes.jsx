import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import MenuLateral from '../components/MenuLateralAdministrador';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { usePDFGenerator } from '../hooks/usePDFGenerator';
import '../styles/empleados.css';
import '../styles/dashboard.css';
import '../styles/charts.css';
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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const DashboardClientes = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contentRef, generatePDF } = usePDFGenerator();

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

  const handleGeneratePDF = () => {
    generatePDF('dashboard-clientes.pdf', 'Dashboard de Clientes', 'clients', metrics);
  };

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Clientes</h1>
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

  // Mostrar mensaje cuando no hay datos
  if (metrics && metrics.total_usuarios === 0) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Clientes</h1>
          <div
            style={{
              background: '#e3f2fd',
              color: '#1565c0',
              padding: 32,
              borderRadius: 12,
              border: '1px solid #bbdefb',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: 16 }}>📊 Dashboard Vacío</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              No hay datos de usuarios aún. El dashboard mostrará métricas cuando los usuarios
              comiencen a registrarse y hacer pedidos.
            </p>
            <div
              style={{
                background: '#fff',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
                border: '1px solid #e0e0e0',
              }}
            >
              <h4 style={{ marginBottom: 12 }}>💡 Próximos pasos:</h4>
              <ul style={{ textAlign: 'left', margin: 0, paddingLeft: 20 }}>
                <li>Registra algunos usuarios de prueba</li>
                <li>Haz algunos pedidos</li>
                <li>Las métricas aparecerán automáticamente</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!metrics) return <div>Error cargando métricas</div>;

  const {
    total_usuarios,
    usuarios_nuevos,
    usuarios_activos,
    views,
    visitas,
    pedidosPorHora,
    usuariosPorDia,
  } = metrics;

  // 📈 Gráfico de línea con fechas cortas - Usuarios por día
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
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4CAF50',
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Gráfico de dona - Pedidos por hora
  const horas =
    pedidosPorHora && pedidosPorHora.length > 0
      ? pedidosPorHora.map(p => {
          if (typeof p.hora === 'number') {
            return `${p.hora.toString().padStart(2, '0')}:00`;
          }
          return p.hora || 'Sin hora';
        })
      : ['Sin datos'];

  const totalPedidos =
    pedidosPorHora && pedidosPorHora.length > 0
      ? pedidosPorHora.reduce((sum, p) => sum + p.cantidad, 0)
      : 0;

  const porcentajes =
    pedidosPorHora && pedidosPorHora.length > 0
      ? pedidosPorHora.map(p => Math.round((p.cantidad / totalPedidos) * 100))
      : [0];

  const doughnutData = {
    labels: horas,
    datasets: [
      {
        data:
          pedidosPorHora && pedidosPorHora.length > 0 ? pedidosPorHora.map(p => p.cantidad) : [0],
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#E91E63',
          '#9C27B0',
          '#00BCD4',
          '#8BC34A',
          '#FFC107',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Clientes</h1>
          <PDFDownloadButton
            onGeneratePDF={handleGeneratePDF}
            disabled={loading || error || !metrics}
          />
        </div>

        {/* Contenido para PDF */}
        <div ref={contentRef} className="dashboard-content">
          {/* Tarjetas métricas */}
          <div className="metrics-grid">
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
              <div key={card.label} className="metric-card metric-card--clients">
                <div className="metric-card-header">
                  <div className="metric-card-title">{card.label}</div>
                  <div className="metric-card-description">{card.description}</div>
                </div>
                <div className="metric-card-value">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Gráficas */}
          <div className="charts-container">
            <div className="chart-container chart-container--large line-chart">
              <div className="chart-title">Usuarios Registrados por Día</div>
              <div className="chart-wrapper chart-wrapper--large">
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    backgroundColor: '#ffffff',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: '#666',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: '#666',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container chart-container--small doughnut-chart">
              <div className="chart-title">Pedidos por Hora</div>
              <div className="chart-wrapper chart-wrapper--small">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    backgroundColor: '#ffffff',
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#FF9800',
                        borderWidth: 1,
                        cornerRadius: 8,
                      },
                    },
                  }}
                />
              </div>
              {totalPedidos > 0 ? (
                <div className="chart-legend">
                  {horas.map((h, i) => (
                    <div key={h} className="legend-item">
                      <div
                        className="legend-color"
                        style={{
                          backgroundColor: doughnutData.datasets[0].backgroundColor[i],
                        }}
                      ></div>
                      <span>
                        {h}: {porcentajes[i]}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-no-data">
                  <div className="chart-no-data-icon">📊</div>
                  <div>No hay datos de pedidos disponibles</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClientes;
