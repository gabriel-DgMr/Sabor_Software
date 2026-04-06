import React, { useMemo } from 'react';
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

const formatCurrency = value =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = value => new Intl.NumberFormat('es-CO').format(value || 0);

const DashboardInventarioUI = ({ metrics, loading, error, contentRef, handleGeneratePDF }) => {
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
      labels: ['Stock saludable', 'Stock crítico', 'Agotados'],
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
    [resumen.total_productos, lowStockProducts.length, agotados.length]
  );

  const barData = useMemo(
    () => ({
      labels: stockPorCategoria.map(item => item.categoria || 'Sin categoría'),
      datasets: [
        {
          label: 'Unidades en inventario',
          data: stockPorCategoria.map(item => item.total_stock || 0),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: '#2196F3',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [stockPorCategoria]
  );

  if (loading) return <div>Cargando inventario...</div>;

  if (error) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <h1 className="dashboard-title">Inventario</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>Error al cargar el dashboard de inventario</h3>
            <p>{error}</p>
            <p style={{ fontSize: 14, marginTop: 16 }}>
              Verifica la conexión con el servidor y vuelve a intentar.
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
          <h1 className="dashboard-title">Inventario</h1>
          <PDFDownloadButton onGeneratePDF={handleGeneratePDF} disabled={loading || !!error} />
        </div>

        <div ref={contentRef} className="dashboard-content">
          <div className="metrics-grid">
            {[
              {
                label: 'Productos en catálogo',
                value: formatNumber(resumen.total_productos),
                description: 'Incluye todas las referencias activas',
              },
              {
                label: 'Unidades en inventario',
                value: formatNumber(resumen.unidades_en_inventario),
                description: 'Sumatoria total de existencias',
              },
              {
                label: 'Valor estimado',
                value: formatCurrency(resumen.valor_estimado),
                description: 'Inventario valorado a precio de venta',
              },
              {
                label: 'Stock en riesgo',
                value: `${formatNumber(resumen.productos_bajos)} críticos / ${formatNumber(resumen.productos_agotados)} agotados`,
                description: 'Productos que requieren reposición',
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
              <div className="chart-title">Distribución de stock por categoría</div>
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
                          callbacks: { label: context => `${formatNumber(context.raw)} unidades` },
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
                  <div>No hay datos de stock por categoría</div>
                </div>
              )}
            </div>

            <div className="chart-container chart-container--small doughnut-chart">
              <div className="chart-title">Estado del inventario</div>
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
                    Stock saludable:{' '}
                    {formatNumber(
                      Math.max(
                        (resumen.total_productos || 0) - lowStockProducts.length - agotados.length,
                        0
                      )
                    )}{' '}
                    productos
                  </span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#FF9800' }} />
                  <span>Stock crítico: {formatNumber(lowStockProducts.length)} productos</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#E53935' }} />
                  <span>Agotados: {formatNumber(agotados.length)} productos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <div className="table-title">Productos con stock crítico</div>
            {topLowStock.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock actual</th>
                      <th>Stock mínimo</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLowStock.map(producto => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre_producto}</td>
                        <td>{producto.categoria || 'Sin categoría'}</td>
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
                No hay productos con stock crítico en este momento.
              </div>
            )}
          </div>

          <div className="table-container">
            <div className="table-title">Productos agotados</div>
            {agotados.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agotados.map(producto => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre_producto}</td>
                        <td>{producto.categoria || 'Sin categoría'}</td>
                        <td>{formatNumber(producto.stock_minimo ?? 5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="status-message">No hay productos agotados actualmente.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardInventarioUI;
