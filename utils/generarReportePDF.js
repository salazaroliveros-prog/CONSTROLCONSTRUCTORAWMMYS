import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- FUNCIÓN MAESTRA DE PDF PARA SOFTCON-MYS ---
export const generarReportePDF = (tipo, inventario, renglones) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();

  // Encabezado Profesional
  doc.setFillColor(15, 23, 42); // Color Slate-900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(234, 179, 8); // Color Yellow-500
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SOFTCON-MYS-CONSTRU-WM", 15, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('"CONSTRUYENDO TU FUTURO"', 15, 30);
  doc.text(`FECHA DE REPORTE: ${fecha}`, 140, 30);

  if (tipo === 'inventario') {
    doc.setTextColor(0, 0, 0);
    doc.text("REPORTE MAESTRO DE INVENTARIO Y EQUIPOS", 15, 50);
    
    const tablaData = inventario.map(item => [item.nombre, `${item.cant} UND`, item.estado]);
    doc.autoTable({
      startY: 55,
      head: [["EQUIPO / HERRAMIENTA", "CANTIDAD", "ESTADO"]],
      body: tablaData,
      headStyles: { fillColor: [15, 23, 42] },
      theme: 'grid'
    });
  } else {
    doc.setTextColor(0, 0, 0);
    doc.text("REPORTE DE AVANCE DE OBRA (BITÁCORA)", 15, 50);
    
    const tablaData = renglones.map(r => [r.actividad, `${r.ponderacion}%`, r.completado ? 'COMPLETADO' : 'PENDIENTE']);
    doc.autoTable({
      startY: 55,
      head: [["ACTIVIDAD", "PONDERACIÓN", "ESTATUS"]],
      body: tablaData,
      headStyles: { fillColor: [15, 23, 42] },
      theme: 'grid'
    });
  }

  doc.save(`Reporte_SOFTCON_MYS_${tipo}.pdf`);
};
