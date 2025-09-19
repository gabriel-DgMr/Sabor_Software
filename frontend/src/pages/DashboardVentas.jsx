import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import MenuLateral from '../components/MenuLateralAdministrador';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { usePDFGenerator } from '../hooks/usePDFGenerator';
import '../styles/empleados.css';
import '../styles/dashboard.css';
import '../styles/charts.css';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const DashboardVentas = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contentRef, generatePDF } = usePDFGenerator();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getSalesMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error al cargar métricas de ventas:', err);
        setError(err.response?.data?.error || err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleGeneratePDF = () => {
    generatePDF('dashboard-ventas.pdf', 'Dashboard de Ventas', 'sales', metrics);
  };

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Ventas</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>Error al cargar el dashboard de ventas</h3>
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
  if (metrics && metrics.ventas_totales === 0) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Ventas</h1>
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
            <h3 style={{ marginBottom: 16 }}>💰 Dashboard de Ventas Vacío</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              No hay datos de ventas aún. El dashboard mostrará métricas cuando se realicen pedidos
              completados.
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
                <li>Realiza algunos pedidos</li>
                <li>Completa los pedidos (estado "Completado")</li>
                <li>Las métricas de ventas aparecerán automáticamente</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!metrics) return <div>Error cargando métricas</div>;

  const {
    ventas_totales,
    ventas_hoy,
    ventas_semana,
    ventas_mes,
    ventasPorDia,
    ventasPorMetodo,
    productosVendidos,
  } = metrics;

  // Función para formatear moneda
  const formatCurrency = amount => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Gráfico de línea - Ventas por día
  const lineData = {
    labels:
      ventasPorDia && ventasPorDia.length > 0
        ? ventasPorDia.map(d => {
            const fecha = new Date(d.fecha);
            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
          })
        : ['Sin datos'],
    datasets: [
      {
        label: 'Ventas diarias',
        data: ventasPorDia && ventasPorDia.length > 0 ? ventasPorDia.map(d => d.total || 0) : [0],
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

  // Gráfico de dona - Ventas por método de pago
  const doughnutData = {
    labels:
      ventasPorMetodo && ventasPorMetodo.length > 0
        ? ventasPorMetodo.map(v => v.metodo_pago || 'Sin método')
        : ['Sin datos'],
    datasets: [
      {
        data:
          ventasPorMetodo && ventasPorMetodo.length > 0
            ? ventasPorMetodo.map(v => v.total || 0)
            : [0],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Gráfico de barras - Productos más vendidos
  const barData = {
    labels:
      productosVendidos && productosVendidos.length > 0
        ? productosVendidos
            .slice(0, 5)
            .map(p =>
              p.nombre_producto.length > 20
                ? p.nombre_producto.substring(0, 20) + '...'
                : p.nombre_producto
            )
        : ['Sin datos'],
    datasets: [
      {
        label: 'Cantidad vendida',
        data:
          productosVendidos && productosVendidos.length > 0
            ? productosVendidos.slice(0, 5).map(p => p.cantidad_vendida || 0)
            : [0],
        backgroundColor: 'rgba(33, 150, 243, 0.8)',
        borderColor: '#2196F3',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Ventas</h1>
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
                label: 'Ventas Totales',
                value: formatCurrency(ventas_totales || 0),
                description: 'Historial completo',
              },
              {
                label: 'Ventas Hoy',
                value: formatCurrency(ventas_hoy || 0),
                description: 'Día actual',
              },
              {
                label: 'Ventas Semana',
                value: formatCurrency(ventas_semana || 0),
                description: 'Últimos 7 días',
              },
              {
                label: 'Ventas Mes',
                value: formatCurrency(ventas_mes || 0),
                description: 'Últimos 30 días',
              },
            ].map(card => (
              <div key={card.label} className="metric-card metric-card--sales">
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
              <div className="chart-title">Ventas por Día</div>
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
                        callbacks: {
                          label: function (context) {
                            return `Ventas: ${formatCurrency(context.parsed.y)}`;
                          },
                        },
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
                          callback: function (value) {
                            return formatCurrency(value);
                          },
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
              <div className="chart-title">Ventas por Método de Pago</div>
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
                        callbacks: {
                          label: function (context) {
                            const value = context.parsed;
                            return `${context.label}: ${formatCurrency(value)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Productos más vendidos */}
          <div className="chart-container bar-chart">
            <div className="chart-title">Productos Más Vendidos</div>
            <div className="chart-wrapper chart-wrapper--large">
              <Bar
                data={barData}
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
                      borderColor: '#2196F3',
                      borderWidth: 1,
                      cornerRadius: 8,
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

            {/* Tabla de productos */}
            {productosVendidos && productosVendidos.length > 0 && (
              <div className="table-container">
                <div className="table-title">Top 10 Productos Más Vendidos</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosVendidos.slice(0, 10).map((producto, index) => (
                      <tr key={index}>
                        <td>{producto.nombre_producto}</td>
                        <td style={{ textAlign: 'right' }}>{producto.cantidad_vendida}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(producto.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardVentas;
