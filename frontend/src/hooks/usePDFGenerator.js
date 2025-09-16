import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const usePDFGenerator = () => {
  const contentRef = useRef(null);

  const generatePDF = async (
    filename = 'dashboard-report.pdf',
    title = 'Reporte del Dashboard'
  ) => {
    if (!contentRef.current) {
      console.error('No se encontró el contenido para generar el PDF');
      return;
    }

    try {
      // Crear canvas del contenido
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Agregar título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, 20);

      // Agregar fecha
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      pdf.text(`Generado el: ${currentDate}`, 20, 30);

      // Agregar imagen del dashboard
      let position = 40;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar PDF
      pdf.save(filename);

      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  return { contentRef, generatePDF };
};
