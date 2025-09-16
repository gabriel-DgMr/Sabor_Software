import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';
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

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="dashboard__empleados" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Empleados</h1>
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 24,
              borderRadius: 8,
              border: '1px solid #ffcdd2',
            }}
          >
            <h3>Error al cargar el dashboard de empleados</h3>
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
        <main className="dashboard__empleados" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Empleados</h1>
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
            <h3 style={{ marginBottom: 16 }}>👥 Dashboard de Empleados Vacío</h3>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              No hay empleados registrados aún. El dashboard mostrará métricas cuando se registren
              empleados y administradores.
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
                <li>Las métricas de empleados aparecerán automáticamente</li>
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
        pointRadius: 4,
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
      },
    ],
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="dashboard__empleados" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Empleados</h1>

        {/* Tarjetas métricas */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            {
              label: 'Total Empleados',
              value: `${total_empleados || 0} Personas`,
              description: 'Empleados y administradores',
            },
            {
              label: 'Empleados Activos',
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
            <div
              key={card.label}
              style={{
                background: '#2196F3',
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
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Gráficas */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div
            style={{
              flex: 2,
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Actividad de Empleados</div>
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
              height={200}
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Empleados por Rol</div>
            <Doughnut
              data={doughnutData}
              options={{
                plugins: {
                  legend: { position: 'right' },
                },
              }}
            />
          </div>
        </div>

        {/* Lista de empleados */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 2px 8px #0001',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Lista de Empleados</div>

          {listaEmpleados && listaEmpleados.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Rol</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Última Actividad</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {listaEmpleados.map((empleado, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 12 }}>{empleado.nombre_usuario}</td>
                      <td style={{ padding: 12 }}>{empleado.correo_usuario}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            background:
                              empleado.nombre_rol === 'Administrador' ? '#FF9800' : '#4CAF50',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {empleado.nombre_rol}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{formatDate(empleado.last_active)}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            background: getActivityColor(empleado.estado_actividad),
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
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
            <div
              style={{
                textAlign: 'center',
                padding: 40,
                color: '#666',
              }}
            >
              No hay empleados registrados
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardEmpleados;
