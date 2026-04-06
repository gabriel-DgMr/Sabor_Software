import { useEffect, useState } from 'react';
import dashboardService from '../../../shared/services/dashboardService';
import { usePDFGenerator } from '../../../shared/hooks/usePDFGenerator';

export const useDashboardClientes = () => {
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

  return {
    metrics,
    loading,
    error,
    contentRef,
    handleGeneratePDF,
  };
};
