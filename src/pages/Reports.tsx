import { useState, useEffect } from 'react';
import { Download, FileText, Printer, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, Receipt, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getSales, getExpenses, getEmployees } from '../utils/storage';
import { formatCurrency, formatDate, getDateRangeFilter, isInDateRange } from '../utils/date';
import { exportToCSV } from '../utils/export';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../hooks/useSettings';
import type { DateRange, Sale, Expense, Employee } from '../types';

interface IncomeStatementData {
  period: string;
  totalRevenue: number;
  costOfServices: number;
  grossProfit: number;
  operatingExpenses: {
    rent: number;
    utilities: number;
    marketing: number;
    products: number;
    other: number;
  };
  totalOperatingExpenses: number;
  operatingIncome: number;
  commissionExpense: number;
  netIncome: number;
  revenueBreakdown: Array<{ service: string; amount: number; count: number }>;
}

export function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showIncomeStatement, setShowIncomeStatement] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('sales');
  const { success } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const salesData = await getSales();
      const expensesData = await getExpenses();
      const employeesData = await getEmployees();
      setSales(salesData);
      setExpenses(expensesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { start, end } = getDateRangeFilter(dateRange, customStart, customEnd);
  const filteredSales = sales.filter(sale => isInDateRange(sale.date, start, end));
  const filteredExpenses = expenses.filter(expense => isInDateRange(expense.date, start, end));

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const totalCommission = filteredSales.reduce((sum, sale) => sum + sale.commission, 0);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalCommission - totalExpensesAmount;

  const commissionByEmployee = employees.map(employee => {
    const employeeSales = filteredSales.filter(sale => sale.employeeId === employee.id);
    const commission = employeeSales.reduce((sum, sale) => sum + sale.commission, 0);
    const salesCount = employeeSales.length;
    return { name: employee.name, commission, salesCount };
  }).filter(e => e.commission > 0).sort((a, b) => b.commission - a.commission);

  const topPerformer = commissionByEmployee[0];

  const dailySales = filteredSales.reduce((acc, sale) => {
    const date = formatDate(sale.date);
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += sale.finalTotal;
    } else {
      acc.push({ date, total: sale.finalTotal });
    }
    return acc;
  }, [] as { date: string; total: number }[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate Income Statement
  const generateIncomeStatement = (): IncomeStatementData => {
    const [year, month] = selectedMonth.split('-');
    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthEnd = new Date(parseInt(year), parseInt(month), 0);
    
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });
    
    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.finalTotal, 0);
    const totalCommissionExpense = periodSales.reduce((sum, sale) => sum + sale.commission, 0);

    const operatingExpenses = {
      rent: periodExpenses.filter(e => e.category === 'rent').reduce((sum, e) => sum + e.amount, 0),
      utilities: periodExpenses.filter(e => e.category === 'utilities').reduce((sum, e) => sum + e.amount, 0),
      marketing: periodExpenses.filter(e => e.category === 'marketing').reduce((sum, e) => sum + e.amount, 0),
      products: periodExpenses.filter(e => e.category === 'products').reduce((sum, e) => sum + e.amount, 0),
      other: periodExpenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0),
    };

    const totalOperatingExpenses = Object.values(operatingExpenses).reduce((sum, v) => sum + v, 0);
    const costOfServices = totalRevenue * 0.2;
    const grossProfit = totalRevenue - costOfServices;
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const netIncome = operatingIncome - totalCommissionExpense;

    const serviceMap = new Map<string, { amount: number; count: number }>();
    periodSales.forEach(sale => {
      const existing = serviceMap.get(sale.service);
      if (existing) {
        existing.amount += sale.finalTotal;
        existing.count += 1;
      } else {
        serviceMap.set(sale.service, { amount: sale.finalTotal, count: 1 });
      }
    });

    const revenueBreakdown = Array.from(serviceMap.entries())
      .map(([service, data]) => ({ service, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: `${monthStart.toLocaleDateString('en-ZA', { month: 'long' })} ${year}`,
      totalRevenue,
      costOfServices,
      grossProfit,
      operatingExpenses,
      totalOperatingExpenses,
      operatingIncome,
      commissionExpense: totalCommissionExpense,
      netIncome,
      revenueBreakdown,
    };
  };

  const handleExportIncomeStatementCSV = () => {
    const report = generateIncomeStatement();
    const data = [
      { 'Metric': 'Total Revenue', 'Amount': report.totalRevenue },
      { 'Metric': 'Cost of Services (estimated)', 'Amount': report.costOfServices },
      { 'Metric': 'Gross Profit', 'Amount': report.grossProfit },
      { 'Metric': 'Operating Expenses - Rent', 'Amount': report.operatingExpenses.rent },
      { 'Metric': 'Operating Expenses - Utilities', 'Amount': report.operatingExpenses.utilities },
      { 'Metric': 'Operating Expenses - Marketing', 'Amount': report.operatingExpenses.marketing },
      { 'Metric': 'Operating Expenses - Products', 'Amount': report.operatingExpenses.products },
      { 'Metric': 'Operating Expenses - Other', 'Amount': report.operatingExpenses.other },
      { 'Metric': 'Total Operating Expenses', 'Amount': report.totalOperatingExpenses },
      { 'Metric': 'Operating Income', 'Amount': report.operatingIncome },
      { 'Metric': 'Commission Expense', 'Amount': report.commissionExpense },
      { 'Metric': 'Net Income', 'Amount': report.netIncome },
    ];
    exportToCSV(data, `income_statement_${report.period.replace(/\s/g, '_')}`);
    success('Income statement exported as CSV');
  };

  const handlePrintIncomeStatement = () => {
    const report = generateIncomeStatement();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const categoryRows = `
      <tr><td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">Rent</td><td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(report.operatingExpenses.rent)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">Utilities</td><td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(report.operatingExpenses.utilities)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">Marketing</td><td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(report.operatingExpenses.marketing)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">Products</td><td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(report.operatingExpenses.products)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">Other</td><td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(report.operatingExpenses.other)}</td></tr>
    `;

    const revenueRows = report.revenueBreakdown.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E6E8EC;">${item.service}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: center;">${item.count}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Income Statement - ${report.period}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            h2 { font-size: 20px; margin: 24px 0 16px; }
            .subtitle { color: #5A5F66; margin-bottom: 32px; border-bottom: 2px solid #E6E8EC; padding-bottom: 16px; }
            .summary { margin-bottom: 32px; }
            .income-statement { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            .income-statement td, .income-statement th { padding: 12px; border-bottom: 1px solid #E6E8EC; }
            .income-statement th { background: #F8F9FB; font-weight: 600; text-align: left; }
            .total-row { font-weight: bold; border-top: 2px solid #111 !important; }
            .section-title { background: #F8F9FB; font-weight: 600; }
            .positive { color: #1F9D55; }
            .negative { color: #D64545; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #E6E8EC; text-align: center; color: #5A5F66; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h1>Income Statement</h1>
          <p class="subtitle">${report.period} • Generated ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div class="summary">
            <table class="income-statement">
              <tr class="section-title"><th colspan="2">Revenue & Income</th></tr>
              <tr><td>Total Revenue</td><td style="text-align: right;">${formatCurrency(report.totalRevenue)}</td></tr>
              <tr><td style="padding-left: 20px;">Cost of Services (estimated 20%)</td><td style="text-align: right;">${formatCurrency(report.costOfServices)}</td></tr>
              <tr class="total-row"><td>Gross Profit</td><td style="text-align: right; font-weight: bold;">${formatCurrency(report.grossProfit)}</td></tr>
              <tr class="section-title"><th colspan="2">Operating Expenses</th></tr>
              ${categoryRows}
              <tr class="total-row"><td>Total Operating Expenses</td><td style="text-align: right; font-weight: bold;">${formatCurrency(report.totalOperatingExpenses)}</td></tr>
              <tr class="total-row"><td>Operating Income</td><td style="text-align: right; font-weight: bold;">${formatCurrency(report.operatingIncome)}</td></tr>
              <tr><td>Commission Expense</td><td style="text-align: right;">${formatCurrency(report.commissionExpense)}</td></tr>
              <tr class="total-row"><td>Net Income</td><td style="text-align: right; font-weight: bold; font-size: 18px;" class="${report.netIncome >= 0 ? 'positive' : 'negative'}">${formatCurrency(report.netIncome)}</td></tr>
            </table>
          </div>

          <h2>Revenue Breakdown by Service</h2>
          <table>
            <thead><tr style="background: #F8F9FB;"><th style="padding: 12px; text-align: left;">Service</th><th style="padding: 12px; text-align: center;">Count</th><th style="padding: 12px; text-align: right;">Amount</th></tr></thead>
            <tbody>${revenueRows}</tbody>
          </table>

          <div class="footer">
            <p>Salon Management System • Income Statement • Confidential</p>
            <p style="margin-top: 8px;">Cost of services is estimated at 20% of revenue.</p>
          </div>

          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    success('Income statement generated');
  };

  const handleExportCurrentCSV = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = filteredSales.map(sale => ({
      Date: formatDate(sale.date),
      Employee: sale.employeeName,
      Service: sale.service,
      Customer: sale.customerName || '-',
      'Original Price': sale.originalPrice,
      Discount: sale.discount,
      'Final Total': sale.finalTotal,
      Commission: sale.commission,
    }));
    exportToCSV(data, 'sales_report');
    
    setIsExporting(false);
    success('Report exported as CSV');
  };

  const handleExportCurrentPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    success('PDF export - use browser print instead');
    setIsExporting(false);
  };

  const salesColumns = [
    { key: 'date', header: 'Date', render: (sale: Sale) => formatDate(sale.date) },
    { key: 'employeeName', header: 'Employee' },
    { key: 'service', header: 'Service' },
    { key: 'customerName', header: 'Customer', render: (sale: Sale) => sale.customerName || '-' },
    { key: 'finalTotal', header: 'Total', render: (sale: Sale) => formatCurrency(sale.finalTotal) },
    { key: 'commission', header: 'Commission', render: (sale: Sale) => formatCurrency(sale.commission) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Reports & Financials
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowIncomeStatement(true)}>
            <Wallet className="w-4 h-4 mr-2" />
            Income Statement
          </Button>
          <Button variant="secondary" onClick={() => setShowMonthlyReport(true)}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Monthly Report
          </Button>
          <Button variant="secondary" onClick={handleExportCurrentCSV} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
          <Button variant="secondary" onClick={handleExportCurrentPDF} disabled={isExporting}>
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Tabs
          tabs={[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom' },
          ]}
          activeTab={dateRange}
          onChange={(tab) => setDateRange(tab as DateRange)}
        />

        {dateRange === 'custom' && (
          <div className="flex gap-2">
            <Input label="From" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <Input label="To" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Sales</p>
              <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">{formatCurrency(totalSales)}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-md"><DollarSign className="w-6 h-6 text-accent" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Commission</p>
              <p className="text-h2 font-heading font-bold text-success">{formatCurrency(totalCommission)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-md"><Wallet className="w-6 h-6 text-success" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Expenses</p>
              <p className="text-h2 font-heading font-bold text-danger">{formatCurrency(totalExpensesAmount)}</p>
            </div>
            <div className="p-3 bg-danger/10 rounded-md"><Receipt className="w-6 h-6 text-danger" /></div>
          </div>
        </Card>
        <Card className={netProfit >= 0 ? 'border-success/20' : 'border-danger/20'}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Net Profit</p>
              <p className={`text-h2 font-heading font-bold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(netProfit)}</p>
            </div>
            <div className={`p-3 rounded-md ${netProfit >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
              {netProfit >= 0 ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-danger" />}
            </div>
          </div>
        </Card>
      </div>

      {dailySales.length > 0 && (
        <Card>
          <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">Daily Sales</h2>
          <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 200 : 300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke={settings.darkMode ? '#2A2A2A' : '#E6E8EC'} />
              <XAxis dataKey="date" stroke={settings.darkMode ? '#9CA3AF' : '#5A5F66'} style={{ fontSize: '14px' }} angle={window.innerWidth < 768 ? -45 : 0} textAnchor={window.innerWidth < 768 ? 'end' : 'middle'} height={window.innerWidth < 768 ? 80 : 30} />
              <YAxis stroke={settings.darkMode ? '#9CA3AF' : '#5A5F66'} style={{ fontSize: '14px' }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: settings.darkMode ? '#1A1A1A' : '#FFFFFF', border: `1px solid ${settings.darkMode ? '#2A2A2A' : '#E6E8EC'}`, borderRadius: '10px' }} />
              <Bar dataKey="total" fill="#0E7C66" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="flex gap-4 mb-4 border-b border-border dark:border-dark-border">
        <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 text-body font-medium transition-colors ${activeTab === 'sales' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary dark:text-gray-400 hover:text-text-primary'}`}>Sales Transactions</button>
        <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 text-body font-medium transition-colors ${activeTab === 'performance' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary dark:text-gray-400 hover:text-text-primary'}`}>Employee Performance</button>
      </div>

      {activeTab === 'sales' && (
        <Table data={filteredSales.slice().reverse()} columns={salesColumns} emptyMessage="No sales recorded for this period" loading={isLoading} />
      )}

      {activeTab === 'performance' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white">Commission Breakdown</h2>
            {topPerformer && <Badge variant="success">Top: {topPerformer.name}</Badge>}
          </div>
          <Table data={commissionByEmployee} columns={[{ key: 'name', header: 'Employee', sortable: true }, { key: 'salesCount', header: 'Sales', sortable: true }, { key: 'commission', header: 'Commission', sortable: true, render: (row: any) => formatCurrency(row.commission) }]} emptyMessage="No sales data for this period" loading={isLoading} />
        </div>
      )}

      {/* Income Statement Modal */}
      <Modal isOpen={showIncomeStatement} onClose={() => setShowIncomeStatement(false)} title="Income Statement">
        <div className="space-y-4">
          <Input label="Select Period" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowIncomeStatement(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleExportIncomeStatementCSV} className="flex-1"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Button onClick={handlePrintIncomeStatement} className="flex-1"><Printer className="w-4 h-4 mr-2" />Print</Button>
          </div>
        </div>
      </Modal>

      {/* Monthly Report Modal */}
      <Modal isOpen={showMonthlyReport} onClose={() => setShowMonthlyReport(false)} title="Generate Monthly Report">
        <div className="space-y-4">
          <Input label="Select Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowMonthlyReport(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleExportIncomeStatementCSV} className="flex-1"><Download className="w-4 h-4 mr-2" />Export Summary</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
