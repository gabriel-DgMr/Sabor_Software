import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuLateral from './MenuLateralAdministrador';
import PDFDownloadButton from '../../../shared/components/PDFDownloadButton';
import '../styles/dashboard-ui.css';
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

const DashboardClientesUI = ({ metrics, loading, error, contentRef, handleGeneratePDF }) => {
  const { t } = useTranslation();

  if (loading) return <div>{t('admin.usuarios.cargando')}</div>;

  if (error) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <h1 className="dashboard-title">{t('admin.usuarios.clientes')}</h1>
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

  if (metrics && metrics.total_usuarios === 0) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">{t('admin.usuarios.clientes')}</h1>
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
            <h3 style={{ marginBottom: 16 }}>{t('admin.dashboard.usuarios.vacio_titulo')}</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              {t('admin.dashboard.usuarios.vacio_desc')}
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

  const { usuarios_nuevos, usuarios_activos, views, visitas, pedidosPorHora, usuariosPorDia } =
    metrics;

  const lineData = {
    labels:
      usuariosPorDia && usuariosPorDia.length > 0
        ? usuariosPorDia.map(d => {
            const fecha = new Date(d.fecha);
            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
          })
        : [t('carrito_vacio')],
    datasets: [
      {
        label: t('admin.dashboard.usuarios.registrados_dia'),
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

  const horas =
    pedidosPorHora && pedidosPorHora.length > 0
      ? pedidosPorHora.map(p => {
          if (typeof p.hora === 'number') {
            return `${p.hora.toString().padStart(2, '0')}:00`;
          }
          return p.hora || t('carrito_vacio');
        })
      : [t('carrito_vacio')];

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
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t('admin.usuarios.titulo')}</h1>
          <PDFDownloadButton
            onGeneratePDF={handleGeneratePDF}
            disabled={loading || error || !metrics}
          />
        </div>

        <div ref={contentRef} className="dashboard-content">
          <div className="metrics-grid">
            {[
              {
                label: t('admin.dashboard.usuarios.unicos'),
                value: `${views || 0} ${t('admin.dashboard.usuarios.personas')}`,
                description: t('admin.dashboard.ventas.ultimos_7'),
              },
              {
                label: t('admin.dashboard.usuarios.total_visitas'),
                value: `${visitas || 0} ${t('admin.dashboard.usuarios.sesiones')}`,
                description: t('admin.dashboard.ventas.ultimos_7'),
              },
              {
                label: t('admin.dashboard.usuarios.nuevos'),
                value: `${usuarios_nuevos || 0} ${t('admin.dashboard.usuarios.personas')}`,
                description: t('admin.dashboard.ventas.dia_actual'),
              },
              {
                label: t('admin.dashboard.usuarios.activos'),
                value: `${usuarios_activos || 0} ${t('admin.dashboard.usuarios.personas')}`,
                description: t('admin.dashboard.ventas.ultimos_30'),
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

          <div className="charts-container charts-container--clients">
            <div className="chart-container chart-container--large line-chart">
              <div className="chart-title">{t('admin.dashboard.usuarios.registrados_dia')}</div>
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
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: { color: '#666' },
                      },
                      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#666' } },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-container chart-container--small doughnut-chart">
              <div className="chart-title">{t('admin.dashboard.usuarios.pedidos_hora')}</div>
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
                        style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }}
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
                  <div>{t('admin.dashboard.usuarios.no_datos_pedidos')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClientesUI;
