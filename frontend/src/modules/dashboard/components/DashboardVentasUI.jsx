import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuLateral from './MenuLateralAdministrador';
import PDFDownloadButton from '../../../shared/components/PDFDownloadButton.jsx';
import '../styles/dashboard-ui.css';
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

const DashboardVentasUI = ({ metrics, loading, error, contentRef, handleGeneratePDF }) => {
  const { t, i18n } = useTranslation();

  if (loading) return <div>{t('admin.usuarios.cargando')}</div>;

  if (error) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <h1 className="dashboard-title">{t('admin.dashboard.ventas_hoy')}</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>{t('admin.dashboard.ventas.error_carga')}</h3>
            <p>{error}</p>
            <p style={{ fontSize: 14, marginTop: 16 }}>
              {error.includes('403') || error.includes('No autorizado') ? (
                <>
                  <strong>{t('admin.dashboard.ventas.prob_autorizacion')}</strong>{' '}
                  {t('admin.dashboard.ventas.sesion_expirada')}
                  <br />
                  <a href="/login" style={{ color: '#c62828', textDecoration: 'underline' }}>
                    {t('admin.dashboard.ventas.relogin')}
                  </a>
                </>
              ) : (
                t('admin.dashboard.ventas.verificar_db')
              )}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (metrics && metrics.ventas_totales === 0) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <h1 className="dashboard-title">{t('admin.dashboard.ventas_hoy')}</h1>
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
            <h3 style={{ marginBottom: 16 }}>{t('admin.dashboard.ventas.vacio_titulo')}</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              {t('admin.dashboard.ventas.vacio_desc')}
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
              <h4 style={{ marginBottom: 12 }}>{t('admin.dashboard.ventas.vacio_pasos')}</h4>
              <ul style={{ textAlign: 'left', margin: 0, paddingLeft: 20 }}>
                <li>{t('admin.dashboard.ventas.vacio_paso1')}</li>
                <li>{t('admin.dashboard.ventas.vacio_paso2')}</li>
                <li>{t('admin.dashboard.ventas.vacio_paso3')}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!metrics) return <div>{t('admin.usuarios.no_encontrados')}</div>;

  const {
    ventas_totales,
    ventas_hoy,
    ventas_semana,
    ventas_mes,
    ventasPorDia,
    ventasPorMetodo,
    productosVendidos,
  } = metrics;

  const formatCurrency = amount =>
    new Intl.NumberFormat(i18n.language === 'es' ? 'es-CO' : 'en-US', {
      style: 'currency',
      currency: i18n.language === 'es' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
    }).format(amount);

  const lineData = {
    labels:
      ventasPorDia && ventasPorDia.length > 0
        ? ventasPorDia.map(d => {
            const fecha = new Date(d.fecha);
            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
          })
        : [t('carrito_vacio')],
    datasets: [
      {
        label: t('admin.dashboard.ventas.por_dia'),
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

  const doughnutData = {
    labels:
      ventasPorMetodo && ventasPorMetodo.length > 0
        ? ventasPorMetodo.map(v => v.metodo_pago || t('carrito_vacio'))
        : [t('carrito_vacio')],
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
        : [t('carrito_vacio')],
    datasets: [
      {
        label: t('admin.dashboard.ventas.tabla_cantidad'),
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
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t('admin.dashboard.ventas.titulo')}</h1>
          <PDFDownloadButton
            onGeneratePDF={handleGeneratePDF}
            disabled={loading || error || !metrics}
          />
        </div>

        <div ref={contentRef} className="dashboard-content">
          <div className="metrics-grid">
            {[
              {
                label: t('admin.dashboard.ventas.totales'),
                value: formatCurrency(ventas_totales || 0),
                description: t('admin.dashboard.ventas.historial'),
              },
              {
                label: t('admin.dashboard.ventas.hoy'),
                value: formatCurrency(ventas_hoy || 0),
                description: t('admin.dashboard.ventas.dia_actual'),
              },
              {
                label: t('admin.dashboard.ventas.semana'),
                value: formatCurrency(ventas_semana || 0),
                description: t('admin.dashboard.ventas.ultimos_7'),
              },
              {
                label: t('admin.dashboard.ventas.mes'),
                value: formatCurrency(ventas_mes || 0),
                description: t('admin.dashboard.ventas.ultimos_30'),
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

          <div className="charts-container charts-container--sales">
            <div className="chart-container chart-container--large line-chart">
              <div className="chart-title">{t('admin.dashboard.ventas.por_dia')}</div>
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
                            return `${t('admin.dashboard.ventas.por_dia')}: ${formatCurrency(context.parsed.y)}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: {
                          color: '#666',
                          callback: function (value) {
                            return formatCurrency(value);
                          },
                        },
                      },
                      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#666' } },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container chart-container--small doughnut-chart">
              <div className="chart-title">{t('admin.dashboard.ventas.por_metodo')}</div>
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
                        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
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
                            return `${context.label}: ${formatCurrency(context.parsed)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="chart-container bar-chart">
            <div className="chart-title">{t('admin.dashboard.ventas.mas_vendidos')}</div>
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
                      grid: { color: 'rgba(0, 0, 0, 0.1)' },
                      ticks: { color: '#666' },
                    },
                    x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#666' } },
                  },
                }}
              />
            </div>

            {productosVendidos && productosVendidos.length > 0 && (
              <div className="table-container">
                <div className="table-title">{t('admin.dashboard.ventas.top_10')}</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.dashboard.ventas.tabla_producto')}</th>
                      <th>{t('admin.dashboard.ventas.tabla_cantidad')}</th>
                      <th>{t('admin.dashboard.ventas.tabla_ingresos')}</th>
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

export default DashboardVentasUI;
