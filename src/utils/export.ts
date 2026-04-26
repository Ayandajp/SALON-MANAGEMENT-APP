import type { Sale, Expense } from '../types';
import { formatCurrency, formatDate } from './date';

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportReportToPDF(
  sales: Sale[],
  expenses: Expense[],
  totalSales: number,
  totalDiscounts: number,
  totalCommission: number,
  totalExpenses: number,
  netProfit: number,
  dateRange: string
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Report - ${dateRange}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          h2 { font-size: 20px; margin: 24px 0 16px; }
          .subtitle { color: #5A5F66; margin-bottom: 32px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
          .stat { padding: 16px; background: #F8F9FB; border-radius: 10px; }
          .stat-label { font-size: 14px; color: #5A5F66; margin-bottom: 4px; }
          .stat-value { font-size: 24px; font-weight: 600; }
          .profit { color: #1F9D55; }
          .loss { color: #D64545; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #E6E8EC; }
          th { background: #F8F9FB; font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #E6E8EC; text-align: center; color: #5A5F66; font-size: 14px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <p class="subtitle">${dateRange} • Generated ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div class="summary">
          <div class="stat">
            <div class="stat-label">Total Sales</div>
            <div class="stat-value">${formatCurrency(totalSales)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Discounts</div>
            <div class="stat-value">${formatCurrency(totalDiscounts)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Commission</div>
            <div class="stat-value">${formatCurrency(totalCommission)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value">${formatCurrency(totalExpenses)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Net Profit</div>
            <div class="stat-value ${netProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(netProfit)}</div>
          </div>
        </div>

        <h2>Sales Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            ${sales.map(sale => `
              <tr>
                <td>${formatDate(sale.date)}</td>
                <td>${sale.employeeName}</td>
                <td>${sale.service}</td>
                <td>${sale.customerName || '-'}</td>
                <td>${formatCurrency(sale.finalTotal)}</td>
                <td>${formatCurrency(sale.commission)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>${formatCurrency(expense.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Salon Management System • Confidential Report</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
