import { WalletRecord } from '../types/wallet';
import { formatCurrency, formatDateTime } from './dateUtils';

export const exportToCSV = (data: WalletRecord[], filename: string = 'strivex-trainer-wallet.csv') => {
  const headers = ['Client Name', 'Plan Title', 'Trainer Earnings', 'Admin Share', 'Date & Time'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      `"${record.clientName}"`,
      `"${record.planTitle}"`,
      record.amount,
      record.trainerAmount,
      record.adminShare,
      `"${formatDateTime(record.completedAt)}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (data: WalletRecord[], trainerName: string = 'Trainer') => {
  const currentDate = new Date().toLocaleDateString();
  const totalEarnings = data.reduce((sum, record) => sum + record.trainerAmount, 0);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>StriveX - Trainer Wallet Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #1f2937; 
              line-height: 1.5;
              background: #fff;
            }
            
            .header {
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
              padding: 2rem;
              text-align: center;
            }
            
            .logo {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              margin-bottom: 1rem;
              font-size: 1.5rem;
              font-weight: bold;
            }
            
            .summary {
              background: #f8fafc;
              padding: 1.5rem;
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .summary-item {
              text-align: center;
            }
            
            .summary-label {
              font-size: 0.875rem;
              color: #6b7280;
              margin-bottom: 0.25rem;
            }
            
            .summary-value {
              font-size: 1.25rem;
              font-weight: 600;
              color: #059669;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
            }
            
            th {
              background: #f9fafb;
              padding: 0.75rem;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
              font-size: 0.875rem;
            }
            
            td {
              padding: 0.75rem;
              border-bottom: 1px solid #f3f4f6;
            }
            
            tr:hover {
              background: #f9fafb;
            }
            
            .amount { 
              font-weight: 600; 
              color: #059669; 
            }
            
            .commission { 
              color: #dc2626; 
            }
            
            .footer {
              text-align: center;
              padding: 1rem;
              color: #6b7280;
              font-size: 0.875rem;
              border-top: 1px solid #e5e7eb;
            }
            
            @media print {
              .header { break-inside: avoid; }
              tr { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L16 6L14.74 12L22 12L15.74 14.74L18 18L12 16L6 18L8.26 14.74L2 12L9.26 12L8 6L10.91 8.26L12 2Z"/>
              </svg>
              StriveX
            </div>
            <h1>Trainer Wallet Report</h1>
            <p>Generated for ${trainerName} • ${currentDate}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Transactions</div>
              <div class="summary-value">${data.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Earnings</div>
              <div class="summary-value">${formatCurrency(totalEarnings)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Report Date</div>
              <div class="summary-value">${currentDate}</div>
            </div>
          </div>
          
          ${data.length === 0 ? 
            '<div style="text-align: center; padding: 3rem; color: #6b7280;">No transactions found</div>' : 
            `<table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Plan</th>
                  <th>Your Earnings</th>
                  <th>Commission</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(record => `
                  <tr>
                    <td><strong>${record.clientName}</strong></td>
                    <td>${record.planTitle}</td>
                    <td class="amount">${formatCurrency(record.trainerAmount)}</td>
                    <td class="commission">${formatCurrency(record.adminShare)}</td>
                    <td>${formatDateTime(record.completedAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
          
          <div class="footer">
            <p>StriveX Fitness Platform • Confidential Report</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
};