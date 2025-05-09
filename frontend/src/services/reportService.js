import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart } from 'chart.js';

export const generateCommunityPDF = async (community, demographicData) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(0, 76, 153);
  doc.text('Relatório da Comunidade', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text(community.nome, 105, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Município: ${community.municipio_nome}`, 105, 35, { align: 'center' });
  
  // Basic stats
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Dados Gerais', 20, 50);
  
  const fishermenPercentage = ((community.pescadores / community.pessoas) * 100).toFixed(1);
  const avgFamilySize = (community.pessoas / community.familias).toFixed(1);
  
  doc.autoTable({
    startY: 55,
    head: [['Indicador', 'Valor']],
    body: [
      ['População Total', community.pessoas.toLocaleString('pt-BR')],
      ['Pescadores', community.pescadores.toLocaleString('pt-BR')],
      ['Percentual de Pescadores', `${fishermenPercentage}%`],
      ['Famílias', community.familias.toLocaleString('pt-BR')],
      ['Média de pessoas por família', avgFamilySize]
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 76, 153] }
  });
  
  // Add charts as images
  if (demographicData && demographicData.length > 0) {
    // Generate charts and add them to PDF
    // ...
  }
  
  // Add footer with generation date
  const date = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em ${date} - PESCARTE Viz`, 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save(`relatorio_${community.nome.replace(/\s+/g, '_')}.pdf`);
};