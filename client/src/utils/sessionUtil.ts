import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SessionItem, StatusVariant } from '@/types/Session';
import { UserRole } from '@/types/UserRole';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

// Format date helper
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format time helper
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format date and time for booked at
export const formatBookedAt = (isoString: string): string => {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  );
};

// Get status badge variant
export const getStatusVariant = (status: string): StatusVariant => {
  switch (status.toLowerCase()) {
    case 'booked':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'completed':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Export to CSV
export const exportToCSV = (items: SessionItem[], role: UserRole): void => {
  const csvData = items.map((item) => {
    const data: { [key: string]: string } = {
      ...(role !== 'trainer' && { 'Trainer Name': item.trainerName }),
      ...(role !== 'client' && { 'Client Name': item.clientName }),
      Date: formatDate(item.date),
      Time: `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`,
      Status: item.status,
      'Call Status': item.videoCallStatus,
      'Booked At': formatBookedAt(item.bookedAt),
    };
    return data;
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'session-history.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF
export const exportToPDF = (items: SessionItem[], role: UserRole): void => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Session History', 14, 22);

  // Prepare table headers based on role
  const headers = [
    ...(role !== 'trainer' ? ['Trainer Name'] : []),
    ...(role !== 'client' ? ['Client Name'] : []),
    'Date',
    'Time',
    'Status',
    'Call Status',
    'Booked At',
  ];

  // Prepare table data
  const tableData = items.map((item) => [
    ...(role !== 'trainer' ? [item.trainerName] : []),
    ...(role !== 'client' ? [item.clientName] : []),
    formatDate(item.date),
    `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`,
    item.status,
    item.videoCallStatus,
    formatBookedAt(item.bookedAt),
  ]);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save('session-history.pdf');
};