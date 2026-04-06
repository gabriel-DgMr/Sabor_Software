import { useEffect, useState } from 'react';
import dashboardService from '../../../shared/services/dashboardService.js';
import { usePDFGenerator } from '../../../shared/hooks/usePDFGenerator.js';

export const useDashboardVentas = () => {
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
    if (metrics) {
      generatePDF('dashboard-ventas.pdf', 'Dashboard de Ventas', 'sales', metrics);
    }
  };

  return {
    metrics,
    loading,
    error,
    contentRef,
    handleGeneratePDF,
  };
};
