
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';

interface WalletRecord {
  id: string;
  clientName: string;
  planTitle: string;
  amount: number;
  trainerAmount: number;
  adminShare: number;
  completedAt: string;
}

export const exportToCSV = (data: WalletRecord[], filename: string) => {
  const headers = [
    'Client Name',
    'Plan Name',
    'Trainer Earnings ($)',
    'Admin Share ($)',
    'Date & Time'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      `"${record.clientName}"`,
      `"${record.planTitle}"`,
      record.amount.toFixed(2),
      record.trainerAmount.toFixed(2),
      record.adminShare.toFixed(2),
      `"${format(parseISO(record.completedAt), 'dd MMM yyyy, hh:mm a')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToPDF = (data: WalletRecord[], filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Trainer Wallet Report', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 32);

  // Prepare table data
  const tableData = data.map(record => [
    record.clientName,
    record.planTitle,
    `₹${record.amount.toFixed(2)}`,
    `₹${record.trainerAmount.toFixed(2)}`,
    `₹${record.adminShare.toFixed(2)}`,
    format(parseISO(record.completedAt), 'dd MMM yyyy, hh:mm a')
  ]);

  // Add table
  autoTable(doc, {
    head: [['Client Name', 'Plan Name',  'Trainer Earnings', 'Admin Share', 'Date & Time']],
    body: tableData,
    startY: 40,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 35 }, // Client Name
      1: { cellWidth: 25 }, // Plan Name
      2: { cellWidth: 25 }, // Trainer Earnings
      3: { cellWidth: 22 }, // Commission
      4: { cellWidth: 35 }  // Date & Time
    }
  });

  // Calculate totals
  const totalAmount = data.reduce((sum, record) => sum + record.amount, 0);
  const totalTrainerEarnings = data.reduce((sum, record) => sum + record.trainerAmount, 0);
  const totalCommission = data.reduce((sum, record) => sum + record.adminShare, 0);

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Summary:', 14, finalY + 15);
  
  doc.setFontSize(10);
  doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 14, finalY + 25);
  doc.text(`Total Trainer Earnings: ₹${totalTrainerEarnings.toFixed(2)}`, 14, finalY + 32);
  doc.text(`Total Commission: ₹${totalCommission.toFixed(2)}`, 14, finalY + 39);

  // Save the PDF
  doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};