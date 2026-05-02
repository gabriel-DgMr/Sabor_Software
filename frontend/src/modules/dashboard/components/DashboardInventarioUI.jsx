import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import MenuLateral from './MenuLateralAdministrador';
import PDFDownloadButton from '../../../shared/components/PDFDownloadButton.jsx';

import '../styles/dashboard-ui.css';
import '../styles/dashboard.css';
import '../styles/charts.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardInventarioUI = ({ metrics, loading, error, contentRef, handleGeneratePDF }) => {
  const { t, i18n } = useTranslation();

  const formatCurrency = value =>
    new Intl.NumberFormat(i18n.language === 'es' ? 'es-CO' : 'en-US', {
      style: 'currency',
      currency: i18n.language === 'es' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0);

  const formatNumber = value =>
    new Intl.NumberFormat(i18n.language === 'es' ? 'es-CO' : 'en-US').format(value || 0);

  const resumen = metrics?.resumen || {};
  const productosStock = metrics?.productosStock || [];
  const stockPorCategoria = metrics?.stockPorCategoria || [];

  const lowStockProducts = useMemo(
    () =>
      productosStock.filter(producto => {
        const stock = producto.stock ?? 0;
        const minimo = producto.stock_minimo ?? 5;
        return stock <= minimo;
      }),
    [productosStock]
  );

  const topLowStock = useMemo(() => lowStockProducts.slice(0, 10), [lowStockProducts]);
  const agotados = productosStock.filter(producto => (producto.stock ?? 0) === 0);

  const doughnutData = useMemo(
    () => ({
      labels: [
        t('admin.dashboard.inventario_panel.stock_saludable'),
        t('admin.dashboard.inventario_panel.stock_critico'),
        t('admin.dashboard.inventario_panel.agotados_titulo'),
      ],
      datasets: [
        {
          data: [
            Math.max((resumen.total_productos || 0) - lowStockProducts.length - agotados.length, 0),
            lowStockProducts.length,
            agotados.length,
          ],
          backgroundColor: ['#4CAF50', '#FF9800', '#E53935'],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    }),
    [resumen.total_productos, lowStockProducts.length, agotados.length, t]
  );

  const barData = useMemo(
    () => ({
      labels: stockPorCategoria.map(item => item.categoria || t('carrito_vacio')),
      datasets: [
        {
          label: t('admin.dashboard.inventario_panel.unidades_inventario'),
          data: stockPorCategoria.map(item => item.total_stock || 0),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: '#2196F3',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [stockPorCategoria, t]
  );

  if (loading) return <div>{t('admin.usuarios.cargando')}...</div>;

  if (error) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <h1 className="dashboard-title">{t('admin.dashboard.inventario')}</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>
              {t('admin.dashboard.inventario_panel.error_carga') ||
                t('admin.dashboard.ventas.error_carga')}
            </h3>
            <p>{error}</p>
            <p style={{ fontSize: 14, marginTop: 16 }}>
              {t('admin.dashboard.ventas.verificar_db')}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t('admin.dashboard.inventario')}</h1>
          <PDFDownloadButton onGeneratePDF={handleGeneratePDF} disabled={loading || !!error} />
        </div>

        <div ref={contentRef} className="dashboard-content">
          <div className="metrics-grid">
            {[
              {
                label: t('admin.dashboard.inventario_panel.productos_catalogo'),
                value: formatNumber(resumen.total_productos),
                description: t('admin.dashboard.inventario_panel.incluye_referencias'),
              },
              {
                label: t('admin.dashboard.inventario_panel.unidades_inventario'),
                value: formatNumber(resumen.unidades_en_inventario),
                description: t('admin.dashboard.inventario_panel.total_existencias'),
              },
              {
                label: t('admin.dashboard.inventario_panel.valor_estimado'),
                value: formatCurrency(resumen.valor_estimado),
                description: t('admin.dashboard.inventario_panel.valorado_precio'),
              },
              {
                label: t('admin.dashboard.inventario_panel.stock_riesgo'),
                value: `${formatNumber(resumen.productos_bajos)} ${t('admin.dashboard.inventario_panel.criticos')} / ${formatNumber(resumen.productos_agotados)} ${t('admin.dashboard.inventario_panel.agotados')}`,
                description: t('admin.dashboard.inventario_panel.requieren_reposicion'),
              },
            ].map(card => (
              <div key={card.label} className="metric-card metric-card--inventory">
                <div className="metric-card-header">
                  <div className="metric-card-title">{card.label}</div>
                  <div className="metric-card-description">{card.description}</div>
                </div>
                <div className="metric-card-value">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="charts-container charts-container--inventory">
            <div className="chart-container chart-container--large bar-chart">
              <div className="chart-title">
                {t('admin.dashboard.inventario_panel.distribucion_cat')}
              </div>
              {stockPorCategoria.length > 0 ? (
                <div className="chart-wrapper chart-wrapper--large">
                  <Bar
                    data={barData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: context =>
                              `${formatNumber(context.raw)} ${t('admin.dashboard.inventario_panel.unidades_inventario')}`,
                          },
                        },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { callback: value => formatNumber(value) } },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="chart-no-data">
                  <div className="chart-no-data-icon">📦</div>
                  <div>{t('admin.dashboard.usuarios.no_datos_pedidos')}</div>
                </div>
              )}
            </div>

            <div className="chart-container chart-container--small doughnut-chart">
              <div className="chart-title">
                {t('admin.dashboard.inventario_panel.estado_inventario')}
              </div>
              <div className="chart-wrapper chart-wrapper--small">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
                  }}
                />
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#4CAF50' }} />
                  <span>
                    {t('admin.dashboard.inventario_panel.stock_saludable')}:{' '}
                    {formatNumber(
                      Math.max(
                        (resumen.total_productos || 0) - lowStockProducts.length - agotados.length,
                        0
                      )
                    )}{' '}
                    {t('admin.dashboard.inventario_panel.productos')}
                  </span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#FF9800' }} />
                  <span>
                    {t('admin.dashboard.inventario_panel.stock_critico')}:{' '}
                    {formatNumber(lowStockProducts.length)}{' '}
                    {t('admin.dashboard.inventario_panel.productos')}
                  </span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#E53935' }} />
                  <span>
                    {t('admin.dashboard.inventario_panel.agotados_titulo')}:{' '}
                    {formatNumber(agotados.length)}{' '}
                    {t('admin.dashboard.inventario_panel.productos')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <div className="table-title">
              {t('admin.dashboard.inventario_panel.con_stock_critico')}
            </div>
            {topLowStock.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.productos.nombre')}</th>
                      <th>{t('admin.productos.categoria')}</th>
                      <th>Stock</th>
                      <th>{t('admin.dashboard.inventario_panel.stock_critico')}</th>
                      <th>{t('admin.productos.precio')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLowStock.map(producto => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre_producto}</td>
                        <td>{producto.categoria || t('carrito_vacio')}</td>
                        <td>{formatNumber(producto.stock ?? 0)}</td>
                        <td>{formatNumber(producto.stock_minimo ?? 5)}</td>
                        <td>{formatCurrency(producto.precio_producto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="status-message">
                {t('admin.dashboard.inventario_panel.sin_criticos')}
              </div>
            )}
          </div>

          <div className="table-container">
            <div className="table-title">
              {t('admin.dashboard.inventario_panel.agotados_titulo')}
            </div>
            {agotados.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('admin.productos.nombre')}</th>
                      <th>{t('admin.productos.categoria')}</th>
                      <th>{t('admin.dashboard.inventario_panel.stock_critico')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agotados.map(producto => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre_producto}</td>
                        <td>{producto.categoria || t('carrito_vacio')}</td>
                        <td>{formatNumber(producto.stock_minimo ?? 5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="status-message">
                {t('admin.dashboard.inventario_panel.sin_agotados')}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardInventarioUI;
