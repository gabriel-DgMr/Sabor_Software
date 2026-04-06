import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const usePDFGenerator = () => {
  const contentRef = useRef(null);

  // Función para generar análisis textual de ventas
  const generateSalesAnalysis = metrics => {
    if (!metrics) return '';

    const {
      ventas_totales,
      ventas_hoy,
      ventas_semana,
      ventas_mes,
      ventasPorDia,
      ventasPorMetodo,
      productosVendidos,
    } = metrics;

    const formatCurrency = amount => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

    let analysis = 'ANÁLISIS DE VENTAS\n\n';

    // Análisis de métricas principales
    analysis += 'RESUMEN EJECUTIVO:\n';
    analysis += `• Las ventas totales acumuladas ascienden a ${formatCurrency(ventas_totales)}\n`;
    analysis += `• Las ventas del día actual representan ${formatCurrency(ventas_hoy)}\n`;
    analysis += `• En los últimos 7 días se han generado ventas por ${formatCurrency(ventas_semana)}\n`;
    analysis += `• El mes actual ha registrado ventas por ${formatCurrency(ventas_mes)}\n\n`;

    // Análisis de tendencias
    if (ventasPorDia && ventasPorDia.length > 0) {
      const promedioDiario = ventas_semana / 7;
      const ventaMaxima = Math.max(...ventasPorDia.map(v => v.total));
      const ventaMinima = Math.min(...ventasPorDia.map(v => v.total));

      analysis += 'ANÁLISIS DE TENDENCIAS:\n';
      analysis += `• El promedio de ventas diarias es de ${formatCurrency(promedioDiario)}\n`;
      analysis += `• El día de mayor venta registró ${formatCurrency(ventaMaxima)}\n`;
      analysis += `• El día de menor venta registró ${formatCurrency(ventaMinima)}\n`;

      if (ventaMaxima > promedioDiario * 1.5) {
        analysis +=
          '• Se observa un pico significativo en las ventas, indicando días de alta demanda\n';
      }
      if (ventaMinima < promedioDiario * 0.5) {
        analysis += '• Se identifican días de baja demanda que requieren atención\n';
      }
      analysis += '\n';
    }

    // Análisis de métodos de pago
    if (ventasPorMetodo && ventasPorMetodo.length > 0) {
      const totalMetodos = ventasPorMetodo.reduce((sum, m) => sum + m.total, 0);
      const metodoPreferido = ventasPorMetodo.reduce((max, m) => (m.total > max.total ? m : max));

      analysis += 'ANÁLISIS DE MÉTODOS DE PAGO:\n';
      analysis += `• El método de pago preferido es ${metodoPreferido.metodo_pago} con ${formatCurrency(metodoPreferido.total)} (${((metodoPreferido.total / totalMetodos) * 100).toFixed(1)}%)\n`;

      ventasPorMetodo.forEach(metodo => {
        const porcentaje = ((metodo.total / totalMetodos) * 100).toFixed(1);
        analysis += `• ${metodo.metodo_pago}: ${formatCurrency(metodo.total)} (${porcentaje}%)\n`;
      });
      analysis += '\n';
    }

    // Análisis de productos
    if (productosVendidos && productosVendidos.length > 0) {
      const totalProductos = productosVendidos.reduce((sum, p) => sum + p.cantidad_vendida, 0);
      const productoTop = productosVendidos[0];

      analysis += 'ANÁLISIS DE PRODUCTOS:\n';
      analysis += `• El producto más vendido es "${productoTop.nombre_producto}" con ${productoTop.cantidad_vendida} unidades\n`;
      analysis += `• Generó ingresos de ${formatCurrency(productoTop.ingresos)}\n`;
      analysis += `• Representa el ${((productoTop.cantidad_vendida / totalProductos) * 100).toFixed(1)}% del total de productos vendidos\n`;

      if (productosVendidos.length > 1) {
        analysis += '• Top 5 productos más vendidos:\n';
        productosVendidos.slice(0, 5).forEach((producto, index) => {
          analysis += `  ${index + 1}. ${producto.nombre_producto}: ${producto.cantidad_vendida} unidades\n`;
        });
      }
      analysis += '\n';
    }

    // Recomendaciones
    analysis += 'RECOMENDACIONES:\n';
    if (ventas_hoy > ventas_semana / 7) {
      analysis +=
        '• Las ventas de hoy superan el promedio semanal, manteniendo esta tendencia positiva\n';
    } else {
      analysis +=
        '• Las ventas de hoy están por debajo del promedio semanal, considerar estrategias de impulso\n';
    }

    if (ventas_semana > ventas_mes / 4) {
      analysis += '• La semana actual muestra un rendimiento superior al promedio mensual\n';
    }

    if (productosVendidos && productosVendidos.length > 0) {
      analysis += '• Considerar promociones especiales para los productos menos vendidos\n';
      analysis += '• Aumentar el inventario de los productos más populares\n';
    }

    return analysis;
  };

  // Función para generar análisis textual de clientes
  const generateClientsAnalysis = metrics => {
    if (!metrics) return '';

    const {
      total_usuarios,
      usuarios_nuevos,
      usuarios_activos,
      views,
      visitas,
      pedidosPorHora,
      usuariosPorDia,
    } = metrics;

    let analysis = 'ANÁLISIS DE CLIENTES\n\n';

    // Análisis de métricas principales
    analysis += 'RESUMEN EJECUTIVO:\n';
    analysis += `• Total de usuarios registrados: ${total_usuarios}\n`;
    analysis += `• Nuevos usuarios hoy: ${usuarios_nuevos}\n`;
    analysis += `• Usuarios activos (últimos 30 días): ${usuarios_activos}\n`;
    analysis += `• Usuarios únicos (últimos 7 días): ${views}\n`;
    analysis += `• Total de visitas (últimos 7 días): ${visitas}\n\n`;

    // Análisis de actividad
    const tasaActividad =
      total_usuarios > 0 ? ((usuarios_activos / total_usuarios) * 100).toFixed(1) : 0;
    const promedioVisitasPorUsuario = views > 0 ? (visitas / views).toFixed(1) : 0;

    analysis += 'ANÁLISIS DE ACTIVIDAD:\n';
    analysis += `• Tasa de actividad de usuarios: ${tasaActividad}%\n`;
    analysis += `• Promedio de visitas por usuario único: ${promedioVisitasPorUsuario}\n`;

    if (tasaActividad > 50) {
      analysis += '• Excelente nivel de actividad de usuarios\n';
    } else if (tasaActividad > 25) {
      analysis += '• Nivel moderado de actividad de usuarios\n';
    } else {
      analysis += '• Bajo nivel de actividad de usuarios, requiere estrategias de retención\n';
    }
    analysis += '\n';

    // Análisis de horarios
    if (pedidosPorHora && pedidosPorHora.length > 0) {
      const horaPico = pedidosPorHora.reduce((max, h) => (h.cantidad > max.cantidad ? h : max));
      analysis += 'ANÁLISIS DE HORARIOS:\n';
      analysis += `• Hora pico de actividad: ${horaPico.hora}:00 con ${horaPico.cantidad} pedidos\n`;
      analysis += '• Distribución de pedidos por hora:\n';
      pedidosPorHora.slice(0, 5).forEach(hora => {
        analysis += `  - ${hora.hora}:00: ${hora.cantidad} pedidos\n`;
      });
      analysis += '\n';
    }

    // Análisis de crecimiento
    if (usuariosPorDia && usuariosPorDia.length > 0) {
      const crecimientoPromedio =
        usuariosPorDia.reduce((sum, u) => sum + u.cantidad, 0) / usuariosPorDia.length;
      analysis += 'ANÁLISIS DE CRECIMIENTO:\n';
      analysis += `• Promedio de nuevos usuarios por día: ${crecimientoPromedio.toFixed(1)}\n`;

      if (usuarios_nuevos > crecimientoPromedio) {
        analysis += '• El crecimiento de hoy supera el promedio reciente\n';
      } else {
        analysis += '• El crecimiento de hoy está por debajo del promedio\n';
      }
      analysis += '\n';
    }

    // Recomendaciones
    analysis += 'RECOMENDACIONES:\n';
    if (usuarios_nuevos > 0) {
      analysis += '• Implementar estrategias de onboarding para nuevos usuarios\n';
    }
    if (tasaActividad < 30) {
      analysis += '• Desarrollar campañas de reactivación para usuarios inactivos\n';
    }
    if (promedioVisitasPorUsuario < 2) {
      analysis += '• Mejorar la experiencia del usuario para aumentar la frecuencia de visitas\n';
    }
    analysis += '• Considerar programas de fidelización para aumentar la retención\n';

    return analysis;
  };

  // Función para generar análisis textual de empleados
  const generateEmployeesAnalysis = metrics => {
    if (!metrics) return '';

    const {
      total_empleados,
      empleados_activos,
      administradores,
      empleados_regulares,
      empleadosPorRol,
      actividadEmpleados,
      listaEmpleados,
    } = metrics;

    let analysis = 'ANÁLISIS DE EMPLEADOS\n\n';

    // Análisis de métricas principales
    analysis += 'RESUMEN EJECUTIVO:\n';
    analysis += `• Total de empleados: ${total_empleados}\n`;
    analysis += `• Empleados activos: ${empleados_activos}\n`;
    analysis += `• Administradores: ${administradores}\n`;
    analysis += `• Empleados regulares: ${empleados_regulares}\n\n`;

    // Análisis de actividad
    const tasaActividadEmpleados =
      total_empleados > 0 ? ((empleados_activos / total_empleados) * 100).toFixed(1) : 0;

    analysis += 'ANÁLISIS DE ACTIVIDAD:\n';
    analysis += `• Tasa de actividad de empleados: ${tasaActividadEmpleados}%\n`;

    if (tasaActividadEmpleados > 80) {
      analysis += '• Excelente nivel de actividad del equipo\n';
    } else if (tasaActividadEmpleados > 60) {
      analysis += '• Buen nivel de actividad del equipo\n';
    } else {
      analysis += '• Bajo nivel de actividad, revisar políticas de trabajo\n';
    }
    analysis += '\n';

    // Análisis de roles
    if (empleadosPorRol && empleadosPorRol.length > 0) {
      analysis += 'DISTRIBUCIÓN POR ROLES:\n';
      empleadosPorRol.forEach(rol => {
        const porcentaje =
          total_empleados > 0 ? ((rol.cantidad / total_empleados) * 100).toFixed(1) : 0;
        analysis += `• ${rol.nombre_rol}: ${rol.cantidad} empleados (${porcentaje}%)\n`;
      });
      analysis += '\n';
    }

    // Análisis de actividad reciente
    if (actividadEmpleados && actividadEmpleados.length > 0) {
      const totalActividad = actividadEmpleados.reduce((sum, a) => sum + a.empleados_activos, 0);
      const promedioActividad = totalActividad / actividadEmpleados.length;

      analysis += 'ACTIVIDAD RECIENTE:\n';
      analysis += `• Promedio de empleados activos por día: ${promedioActividad.toFixed(1)}\n`;
      analysis += '• Actividad por día (últimos 7 días):\n';
      actividadEmpleados.forEach(actividad => {
        const fecha = new Date(actividad.fecha).toLocaleDateString('es-CO');
        analysis += `  - ${fecha}: ${actividad.empleados_activos} empleados activos\n`;
      });
      analysis += '\n';
    }

    // Análisis de estado de empleados
    if (listaEmpleados && listaEmpleados.length > 0) {
      const estados = {};
      listaEmpleados.forEach(emp => {
        estados[emp.estado_actividad] = (estados[emp.estado_actividad] || 0) + 1;
      });

      analysis += 'ESTADO DE ACTIVIDAD:\n';
      Object.entries(estados).forEach(([estado, cantidad]) => {
        const porcentaje =
          total_empleados > 0 ? ((cantidad / total_empleados) * 100).toFixed(1) : 0;
        analysis += `• ${estado}: ${cantidad} empleados (${porcentaje}%)\n`;
      });
      analysis += '\n';
    }

    // Recomendaciones
    analysis += 'RECOMENDACIONES:\n';
    if (tasaActividadEmpleados < 70) {
      analysis += '• Implementar políticas de trabajo remoto o flexibilidad horaria\n';
    }
    if (administradores < 2) {
      analysis += '• Considerar capacitar más empleados para roles administrativos\n';
    }
    if (empleados_regulares > administradores * 5) {
      analysis += '• Evaluar la necesidad de más supervisión administrativa\n';
    }
    analysis += '• Realizar evaluaciones de rendimiento regulares\n';
    analysis += '• Implementar programas de desarrollo profesional\n';

    return analysis;
  };

  // Función para generar análisis textual de inventario
  const generateInventoryAnalysis = metrics => {
    if (!metrics) return '';

    const { resumen = {}, productosStock = [], stockPorCategoria = [] } = metrics;

    const {
      total_productos = 0,
      productos_bajos = 0,
      productos_agotados = 0,
      unidades_en_inventario = 0,
      valor_estimado = 0,
    } = resumen;

    const productos_saludables = Math.max(
      total_productos - productos_bajos - productos_agotados,
      0
    );

    const formatCurrency = amount =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount || 0);

    const formatNumber = value =>
      new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value || 0);

    let analysis = 'ANÁLISIS DE INVENTARIO\n\n';

    analysis += 'RESUMEN EJECUTIVO:\n';
    analysis += `• Total de productos en catálogo: ${formatNumber(total_productos)}\n`;
    analysis += `• Unidades disponibles en inventario: ${formatNumber(unidades_en_inventario)}\n`;
    analysis += `• Valor estimado del inventario: ${formatCurrency(valor_estimado)}\n`;
    analysis += `• Productos con stock suficiente: ${formatNumber(productos_saludables)}\n`;
    analysis += `• Productos con stock bajo: ${formatNumber(productos_bajos)}\n`;
    analysis += `• Productos agotados: ${formatNumber(productos_agotados)}\n\n`;

    if (productosStock && productosStock.length > 0) {
      const agotados = productosStock.filter(p => (p.stock ?? 0) === 0).length;
      const criticos = productosStock.filter(
        p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.stock_minimo ?? 5)
      ).length;

      analysis += 'ESTADO DE STOCK:\n';
      analysis += `• Productos agotados: ${formatNumber(agotados)}\n`;
      analysis += `• Productos en nivel crítico: ${formatNumber(criticos)}\n`;

      const topCriticos = productosStock
        .filter(p => (p.stock ?? 0) <= (p.stock_minimo ?? 5))
        .slice(0, 5);

      if (topCriticos.length > 0) {
        analysis += '• Productos a reabastecer de forma prioritaria:\n';
        topCriticos.forEach((producto, index) => {
          analysis += `  ${index + 1}. ${producto.nombre_producto} - Stock actual: ${formatNumber(
            producto.stock ?? 0
          )} (mínimo recomendado: ${formatNumber(producto.stock_minimo ?? 5)})\n`;
        });
      }
      analysis += '\n';
    }

    if (stockPorCategoria && stockPorCategoria.length > 0) {
      const categoriaMayor = stockPorCategoria.reduce((acc, item) =>
        (item.total_stock || 0) > (acc.total_stock || 0) ? item : acc
      );
      const categoriaMenor = stockPorCategoria.reduce((acc, item) =>
        (item.total_stock || 0) < (acc.total_stock || 0) ? item : acc
      );

      analysis += 'DISTRIBUCIÓN POR CATEGORÍAS:\n';
      analysis += `• Mayor concentración de inventario: ${categoriaMayor.categoria} (${formatNumber(
        categoriaMayor.total_stock || 0
      )} unidades)\n`;
      analysis += `• Menor inventario disponible: ${categoriaMenor.categoria} (${formatNumber(
        categoriaMenor.total_stock || 0
      )} unidades)\n`;
      analysis += '\n';
    }

    analysis += 'RECOMENDACIONES:\n';
    if (productos_bajos > 0 || productos_agotados > 0) {
      analysis += '• Priorizar pedidos de reposición para los productos en nivel crítico\n';
    } else {
      analysis +=
        '• Mantener el monitoreo constante del inventario para evitar quiebres de stock\n';
    }

    if (valor_estimado > 0 && unidades_en_inventario > 0) {
      const valorPromedio = valor_estimado / unidades_en_inventario;
      analysis += `• Valor promedio por unidad: ${formatCurrency(valorPromedio)}\n`;
    }

    if (stockPorCategoria && stockPorCategoria.length > 0) {
      analysis += '• Evaluar rotación de categorías con menor volumen para evitar inmovilización\n';
    }

    return analysis;
  };

  const generatePDF = async (
    filename = 'dashboard-report.pdf',
    title = 'Reporte del Dashboard',
    dashboardType = 'sales',
    metrics = null
  ) => {
    if (!contentRef.current) {
      console.error('No se encontró el contenido para generar el PDF');
      return;
    }

    try {
      // Obtener las dimensiones reales del contenido
      const element = contentRef.current;
      if (!element) {
        throw new Error('Elemento de contenido no encontrado');
      }

      const rect = element.getBoundingClientRect();
      const scrollWidth = Math.max(element.scrollWidth, element.offsetWidth);
      const scrollHeight = Math.max(element.scrollHeight, element.offsetHeight);

      console.log('Dimensiones del elemento:', {
        scrollWidth,
        scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
      });

      // Verificar que el elemento sea visible
      if (scrollWidth === 0 || scrollHeight === 0) {
        throw new Error(`Elemento no tiene dimensiones válidas: ${scrollWidth}x${scrollHeight}`);
      }

      // Esperar un momento para que las gráficas se rendericen completamente
      await new Promise(resolve => setTimeout(resolve, 500));

      // Configuración ultra-simplificada de html2canvas
      let canvas;
      try {
        // Primer intento: configuración básica sin onclone
        canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 1,
          logging: false,
          height: scrollHeight,
          width: scrollWidth,
        });
      } catch (canvasError) {
        console.error('Error en html2canvas básico, intentando configuración mínima:', canvasError);
        try {
          // Segundo intento: solo fondo blanco
          canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
          });
        } catch (secondError) {
          console.error('Error en segundo intento:', secondError);
          try {
            // Tercer intento: sin opciones adicionales
            canvas = await html2canvas(element);
          } catch (thirdError) {
            console.error('Todos los intentos de html2canvas fallaron:', thirdError);
            throw new Error(
              'html2canvas falló completamente. Intenta recargar la página y vuelve a intentarlo.'
            );
          }
        }
      }

      if (!canvas) {
        throw new Error('No se pudo crear el canvas');
      }

      const imgData = canvas.toDataURL('image/png');

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calcular dimensiones de la imagen manteniendo proporción
      const canvasAspectRatio = canvas.width / canvas.height;
      const maxImageWidth = pdfWidth - 20; // Márgenes de 10mm a cada lado
      const maxImageHeight = pdfHeight - 60; // Espacio para título, fecha y márgenes

      let imgWidth, imgHeight;

      if (canvasAspectRatio > maxImageWidth / maxImageHeight) {
        // La imagen es más ancha, ajustar por ancho
        imgWidth = maxImageWidth;
        imgHeight = maxImageWidth / canvasAspectRatio;
      } else {
        // La imagen es más alta, ajustar por altura
        imgHeight = maxImageHeight;
        imgWidth = maxImageHeight * canvasAspectRatio;
      }

      // Centrar la imagen horizontalmente
      const xPosition = (pdfWidth - imgWidth) / 2;

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
      const yPosition = 40;
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

      // Verificar si necesitamos páginas adicionales
      const totalImageHeight = imgHeight + yPosition;
      let heightLeft = totalImageHeight - pdfHeight;

      // Generar análisis textual basado en el tipo de dashboard
      let analysisText = '';
      if (metrics) {
        switch (dashboardType) {
          case 'sales':
            analysisText = generateSalesAnalysis(metrics);
            break;
          case 'clients':
            analysisText = generateClientsAnalysis(metrics);
            break;
          case 'employees':
            analysisText = generateEmployeesAnalysis(metrics);
            break;
          case 'inventory':
            analysisText = generateInventoryAnalysis(metrics);
            break;
          default:
            analysisText = 'Análisis no disponible para este tipo de dashboard.';
        }
      }

      // Agregar análisis textual en una nueva página
      if (analysisText) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANÁLISIS DETALLADO', 20, 20);

        // Dividir el texto en líneas que quepan en la página
        const lines = analysisText.split('\n');
        let yPosition = 35;
        const lineHeight = 6;
        const pageWidth = 170; // Ancho útil de la página

        lines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
          }

          if (line.trim() === '') {
            yPosition += lineHeight;
            return;
          }

          // Verificar si la línea es un título (contiene solo mayúsculas y termina con :)
          if (line.match(/^[A-ZÁÉÍÓÚÑ\s]+:$/)) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line, 20, yPosition);
            yPosition += lineHeight + 2;
          } else {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');

            // Dividir líneas largas
            const words = line.split(' ');
            let currentLine = '';

            words.forEach(word => {
              const testLine = currentLine + (currentLine ? ' ' : '') + word;
              const textWidth = pdf.getTextWidth(testLine);

              if (textWidth > pageWidth) {
                if (currentLine) {
                  pdf.text(currentLine, 20, yPosition);
                  yPosition += lineHeight;
                  if (yPosition > 280) {
                    pdf.addPage();
                    yPosition = 20;
                  }
                }
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            });

            if (currentLine) {
              pdf.text(currentLine, 20, yPosition);
              yPosition += lineHeight;
            }
          }
        });
      }

      // Agregar páginas adicionales si es necesario para la imagen
      if (heightLeft > 0) {
        // Si la imagen es muy grande, dividirla en múltiples páginas
        const remainingHeight = heightLeft;
        const sectionsNeeded = Math.ceil(remainingHeight / (pdfHeight - 20)); // 20mm de margen

        for (let i = 0; i < sectionsNeeded; i++) {
          pdf.addPage();
          const sectionY = -((pdfHeight - 20) * (i + 1)) + yPosition;
          pdf.addImage(imgData, 'PNG', xPosition, sectionY, imgWidth, imgHeight);
        }
      }

      // Descargar PDF
      pdf.save(filename);

      console.log('PDF generado exitosamente');
    } catch (error) {
      const errorDetails = {
        message: error?.message || 'Error desconocido',
        stack: error?.stack || 'Stack no disponible',
        name: error?.name || 'Error',
        elementExists: !!contentRef.current,
        elementDimensions: contentRef.current
          ? {
              scrollWidth: contentRef.current.scrollWidth,
              scrollHeight: contentRef.current.scrollHeight,
              offsetWidth: contentRef.current.offsetWidth,
              offsetHeight: contentRef.current.offsetHeight,
            }
          : null,
        errorType: typeof error,
        errorString: String(error),
      };

      console.error('Error detallado al generar PDF:', errorDetails);

      // Intentar mostrar un mensaje de error más específico al usuario
      const userMessage = error?.message
        ? `Error al generar el PDF: ${error.message}`
        : 'Error desconocido al generar el PDF. Revisa la consola para más detalles.';
      alert(userMessage);
    }
  };

  return { contentRef, generatePDF };
};
