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
  ArcElement
);

const DashboardEmpleados = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contentRef, generatePDF } = usePDFGenerator();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getEmployeeMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error al cargar métricas de empleados:', err);
        setError(err.response?.data?.error || err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleGeneratePDF = () => {
    generatePDF('dashboard-trabajadores.pdf', 'Dashboard de Trabajadores');
  };

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Trabajadores</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>Error al cargar el dashboard de trabajadores</h3>
            <p>{error}</p>
            <p style={{ fontSize: 14, marginTop: 16 }}>
              {error.includes('403') || error.includes('No autorizado') ? (
                <>
                  <strong>Problema de autorización:</strong> Solo los administradores pueden acceder
                  a este dashboard.
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
  if (metrics && metrics.total_empleados === 0) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard-container">
          <h1 className="dashboard-title">Trabajadores</h1>
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
            <h3 style={{ marginBottom: 16 }}>👥 Dashboard de Trabajadores Vacío</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              No hay trabajadores registrados aún. El dashboard mostrará métricas cuando se
              registren empleados y administradores.
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
                <li>Registra algunos empleados</li>
                <li>Asigna roles de empleado o administrador</li>
                <li>Las métricas de trabajadores aparecerán automáticamente</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!metrics) return <div>Error cargando métricas</div>;

  const {
    total_empleados,
    empleados_activos,
    administradores,
    empleados_regulares,
    empleadosPorRol,
    actividadEmpleados,
    listaEmpleados,
  } = metrics;

  // Función para formatear fecha
  const formatDate = dateString => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para obtener color según estado de actividad
  const getActivityColor = estado => {
    switch (estado) {
      case 'Activo':
        return '#4CAF50';
      case 'Reciente':
        return '#FF9800';
      case 'Inactivo':
        return '#FF5722';
      case 'Muy inactivo':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  // Gráfico de línea - Actividad de empleados
  const lineData = {
    labels:
      actividadEmpleados && actividadEmpleados.length > 0
        ? actividadEmpleados.map(a => {
            const fecha = new Date(a.fecha);
            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
          })
        : ['Sin datos'],
    datasets: [
      {
        label: 'Empleados activos',
        data:
          actividadEmpleados && actividadEmpleados.length > 0
            ? actividadEmpleados.map(a => a.empleados_activos || 0)
            : [0],
        fill: true,
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderColor: '#2196F3',
        tension: 0.4,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Gráfico de dona - Empleados por rol
  const doughnutData = {
    labels:
      empleadosPorRol && empleadosPorRol.length > 0
        ? empleadosPorRol.map(e => e.nombre_rol)
        : ['Sin datos'],
    datasets: [
      {
        data:
          empleadosPorRol && empleadosPorRol.length > 0
            ? empleadosPorRol.map(e => e.cantidad)
            : [0],
        backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#E91E63'],
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
          <h1 className="dashboard-title">Trabajadores</h1>
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
                label: 'Total Trabajadores',
                value: `${total_empleados || 0} Personas`,
                description: 'Empleados y administradores',
              },
              {
                label: 'Trabajadores Activos',
                value: `${empleados_activos || 0} Personas`,
                description: 'Últimos 30 días',
              },
              {
                label: 'Administradores',
                value: `${administradores || 0} Personas`,
                description: 'Rol administrador',
              },
              {
                label: 'Empleados Regulares',
                value: `${empleados_regulares || 0} Personas`,
                description: 'Rol empleado',
              },
            ].map(card => (
              <div key={card.label} className="metric-card metric-card--employees">
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
              <div className="chart-title">Actividad de Trabajadores</div>
              <div className="chart-wrapper chart-wrapper--large">
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#2196F3',
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
                          stepSize: 1,
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
              <div className="chart-title">Trabajadores por Rol</div>
              <div className="chart-wrapper chart-wrapper--small">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
            </div>
          </div>

          {/* Lista de trabajadores */}
          <div className="table-container">
            <div className="table-title">Lista de Trabajadores</div>

            {listaEmpleados && listaEmpleados.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Última Actividad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaEmpleados.map((empleado, index) => (
                      <tr key={index}>
                        <td>{empleado.nombre_usuario}</td>
                        <td>{empleado.correo_usuario}</td>
                        <td>
                          <span
                            className={`role-badge role-badge--${empleado.nombre_rol === 'Administrador' ? 'admin' : 'employee'}`}
                          >
                            {empleado.nombre_rol}
                          </span>
                        </td>
                        <td>{formatDate(empleado.last_active)}</td>
                        <td>
                          <span
                            className={`status-badge status-badge--${empleado.estado_actividad.toLowerCase().replace(' ', '-')}`}
                            style={{ backgroundColor: getActivityColor(empleado.estado_actividad) }}
                          >
                            {empleado.estado_actividad}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="status-message">No hay trabajadores registrados</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEmpleados;
