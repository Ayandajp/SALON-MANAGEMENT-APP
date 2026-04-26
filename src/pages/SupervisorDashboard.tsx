import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, DollarSign, Users, Wallet, TrendingUp, Calendar, Download, FileText, Receipt, BarChart3, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, getDateRangeFilter, isInDateRange } from '../utils/date';
import { exportToCSV, exportReportToPDF } from '../utils/export';
import { useToast } from '../hooks/useToast';
import type { Sale, Expense, Employee } from '../types';

export function SupervisorDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [viewingSalonName, setViewingSalonName] = useState('');
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    const session = localStorage.getItem('supervisor_session');
    if (!session) {
      navigate('/supervisor-login');
      return;
    }
    const sessionData = JSON.parse(session);
    setViewingSalonName(sessionData.viewingSalonName || 'Salon');
    loadData(sessionData.viewingSalonId);
  }, []);

  const loadData = async (salonId: string) => {
    setIsLoading(true);
    
    try {
      if (!supabase) {
        console.error('Supabase not connected');
        setIsLoading(false);
        return;
      }

      // Fetch sales for this salon
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', salonId)
        .order('date', { ascending: false });

      if (salesError) throw salesError;

      // Fetch employees for this salon
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', salonId);

      if (employeesError) throw employeesError;

      // Fetch expenses for this salon
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', salonId);

      if (expensesError) throw expensesError;

      // Transform data to match our types
      const transformedSales: Sale[] = (salesData || []).map(sale => ({
        id: String(sale.id),
        date: sale.date,
        employeeId: String(sale.employee_id),
        employeeName: String(sale.employee_name),
        service: String(sale.service),
        originalPrice: Number(sale.original_price),
        discount: Number(sale.discount),
        finalTotal: Number(sale.final_total),
        commission: Number(sale.commission),
        commissionPaid: Boolean(sale.commission_paid),
        customerName: sale.customer_name ? String(sale.customer_name) : undefined,
        customerPhone: sale.customer_phone ? String(sale.customer_phone) : undefined,
        customerEmail: sale.customer_social_media ? String(sale.customer_social_media) : undefined,
      }));

      const transformedEmployees: Employee[] = (employeesData || []).map(emp => ({
        id: String(emp.id),
        name: String(emp.name),
        phone: String(emp.phone || ''),
        email: String(emp.email || ''),
        isWorking: Boolean(emp.is_working),
      }));

      const transformedExpenses: Expense[] = (expensesData || []).map(exp => ({
        id: String(exp.id),
        date: exp.date,
        description: String(exp.description),
        amount: Number(exp.amount),
        category: exp.category,
      }));

      setSales(transformedSales);
      setEmployees(transformedEmployees);
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { start, end } = getDateRangeFilter(dateRange, customStart, customEnd);
  const filteredSales = sales.filter(sale => isInDateRange(sale.date, start, end));
  const filteredExpenses = expenses.filter(expense => isInDateRange(expense.date, start, end));

  const totalSales = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalCommission = filteredSales.reduce((sum, s) => sum + s.commission, 0);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalCommission - totalExpensesAmount;

  const commissionByEmployee = employees.map(employee => {
    const employeeSales = filteredSales.filter(sale => sale.employeeId === employee.id);
    const commission = employeeSales.reduce((sum, sale) => sum + sale.commission, 0);
    const salesCount = employeeSales.length;
    return { name: employee.name, commission, salesCount };
  }).filter(e => e.commission > 0).sort((a, b) => b.commission - a.commission);

  const topPerformer = commissionByEmployee[0];

  const workingEmployees = employees.filter(e => e.isWorking);

  const dateRangeLabel = dateRange === 'custom' && customStart && customEnd
    ? `${formatDate(customStart)} - ${formatDate(customEnd)}`
    : dateRange === 'today'
    ? 'Today'
    : dateRange === 'week'
    ? 'This Week'
    : 'This Month';

  const generateMonthlyReport = () => {
    const [year, month] = selectedMonth.split('-');
    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthEnd = new Date(parseInt(year), parseInt(month), 0);
    
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const monthlyTotalSales = monthlySales.reduce((sum, sale) => sum + sale.finalTotal, 0);
    const monthlyTotalDiscounts = monthlySales.reduce((sum, sale) => sum + sale.discount, 0);
    const monthlyTotalCommission = monthlySales.reduce((sum, sale) => sum + sale.commission, 0);
    const monthlyTotalExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyNetProfit = monthlyTotalSales - monthlyTotalCommission - monthlyTotalExpenses;

    const monthlyCommissionByEmployee = employees.map(employee => {
      const employeeSales = monthlySales.filter(sale => sale.employeeId === employee.id);
      const commission = employeeSales.reduce((sum, sale) => sum + sale.commission, 0);
      const salesCount = employeeSales.length;
      return { name: employee.name, commission, salesCount };
    }).filter(e => e.commission > 0).sort((a, b) => b.commission - a.commission);

    const monthlyTopPerformer = monthlyCommissionByEmployee[0];

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return {
      year,
      month: monthStart.toLocaleDateString('en-ZA', { month: 'long' }),
      totalSales: monthlyTotalSales,
      totalDiscounts: monthlyTotalDiscounts,
      totalCommission: monthlyTotalCommission,
      totalExpenses: monthlyTotalExpenses,
      netProfit: monthlyNetProfit,
      commissionByEmployee: monthlyCommissionByEmployee,
      topPerformer: monthlyTopPerformer,
      salesCount: monthlySales.length,
      expenseCount: monthlyExpenses.length,
      categoryTotals,
    };
  };

  const handleExportMonthlyCSV = () => {
    const report = generateMonthlyReport();
    const data = [{
      'Salon': viewingSalonName,
      'Month': `${report.month} ${report.year}`,
      'Total Sales': report.totalSales,
      'Total Discounts': report.totalDiscounts,
      'Total Commission': report.totalCommission,
      'Total Expenses': report.totalExpenses,
      'Net Profit': report.netProfit,
      'Transactions': report.salesCount,
      'Expenses Count': report.expenseCount,
      'Top Employee': report.topPerformer?.name || 'N/A',
      'Top Employee Commission': report.topPerformer?.commission || 0,
    }];
    exportToCSV(data, `monthly_report_${viewingSalonName.replace(/\s/g, '_')}_${report.year}_${report.month}`);
    success('Monthly report exported as CSV');
  };

  const handleExportMonthlyPDF = () => {
    const report = generateMonthlyReport();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const categoryRows = Object.entries(report.categoryTotals)
      .map(([cat, amount]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-transform: capitalize;">${cat}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E6E8EC; text-align: right;">${formatCurrency(amount)}</td>
        </tr>
      `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Report - ${viewingSalonName} - ${report.month} ${report.year}</title>
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
            td:last-child, th:last-child { text-align: right; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #E6E8EC; text-align: center; color: #5A5F66; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Monthly Business Report</h1>
          <p class="subtitle">${viewingSalonName} • ${report.month} ${report.year} • Generated ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div class="summary">
            <div class="stat">
              <div class="stat-label">Total Sales</div>
              <div class="stat-value">${formatCurrency(report.totalSales)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Discounts</div>
              <div class="stat-value">${formatCurrency(report.totalDiscounts)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Commission</div>
              <div class="stat-value">${formatCurrency(report.totalCommission)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Expenses</div>
              <div class="stat-value">${formatCurrency(report.totalExpenses)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Net Profit</div>
              <div class="stat-value ${report.netProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(report.netProfit)}</div>
            </div>
          </div>

          <h2>Sales Summary</h2>
          <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Total Transactions</td><td>${report.salesCount}</td></tr>
              <tr><td>Average Transaction Value</td><td>${formatCurrency(report.salesCount > 0 ? report.totalSales / report.salesCount : 0)}</td></tr>
              <tr><td>Total Expenses Count</td><td>${report.expenseCount}</td></tr>
              <tr><td>Top Employee</td><td>${report.topPerformer?.name || 'N/A'}</td></tr>
              <tr><td>Top Employee Commission</td><td>${formatCurrency(report.topPerformer?.commission || 0)}</td></tr>
            </tbody>
          </table>

          <h2>Commission Breakdown</h2>
          <table>
            <thead><tr><th>Employee</th><th>Sales</th><th>Commission</th></tr></thead>
            <tbody>
              ${report.commissionByEmployee.map(emp => `
                <tr>
                  <td>${emp.name}</td>
                  <td>${emp.salesCount}</td>
                  <td>${formatCurrency(emp.commission)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Expenses by Category</h2>
          <table>
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              ${categoryRows}
              <tr style="font-weight: bold;">
                <td>Total Expenses</td>
                <td>${formatCurrency(report.totalExpenses)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Salon Management System • Monthly Report • Confidential</p>
          </div>

          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    success('Monthly report generated');
  };

  const handleExportCurrentPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    exportReportToPDF(
      filteredSales,
      filteredExpenses,
      totalSales,
      0,
      totalCommission,
      totalExpensesAmount,
      netProfit,
      `${viewingSalonName} - ${dateRangeLabel}`
    );
    
    setIsExporting(false);
    success('Report exported as PDF');
  };

  const handleExportCurrentCSV = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = filteredSales.map(sale => ({
      Salon: viewingSalonName,
      Date: formatDate(sale.date),
      Employee: sale.employeeName,
      Service: sale.service,
      Customer: sale.customerName || '-',
      'Original Price': sale.originalPrice,
      Discount: sale.discount,
      'Final Total': sale.finalTotal,
      Commission: sale.commission,
    }));
    exportToCSV(data, `sales_report_${viewingSalonName.replace(/\s/g, '_')}`);
    
    setIsExporting(false);
    success('Report exported as CSV');
  };

  const handleLogout = () => {
    localStorage.removeItem('supervisor_session');
    navigate('/supervisor-login');
    success('Logged out successfully');
  };

  const salesColumns = [
    { key: 'date', header: 'Date', render: (sale: Sale) => formatDate(sale.date) },
    { key: 'employeeName', header: 'Employee' },
    { key: 'service', header: 'Service' },
    { key: 'customerName', header: 'Customer', render: (sale: Sale) => sale.customerName || '-' },
    { key: 'finalTotal', header: 'Total', render: (sale: Sale) => formatCurrency(sale.finalTotal) },
    { key: 'commission', header: 'Commission', render: (sale: Sale) => formatCurrency(sale.commission) },
  ];

  const expensesColumns = [
    { key: 'date', header: 'Date', render: (expense: Expense) => formatDate(expense.date) },
    { key: 'description', header: 'Description' },
    { key: 'category', header: 'Category', render: (expense: Expense) => expense.category.charAt(0).toUpperCase() + expense.category.slice(1) },
    { key: 'amount', header: 'Amount', render: (expense: Expense) => formatCurrency(expense.amount) },
  ];

  const tabs = [
    { id: 'sales', label: 'Sales' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-accent" />
              <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
                Supervisor Dashboard
              </h1>
            </div>
            <p className="text-body text-text-secondary dark:text-gray-400">
              Viewing: <span className="font-semibold text-accent">{viewingSalonName}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setShowMonthlyReport(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Report
            </Button>
            <Button variant="secondary" onClick={handleExportCurrentCSV} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="secondary" onClick={handleExportCurrentPDF} disabled={isExporting}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <TrendingUp className={`w-6 h-6 ${netProfit >= 0 ? 'text-success' : 'text-danger'}`} />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button variant={dateRange === 'today' ? 'primary' : 'secondary'} onClick={() => setDateRange('today')}>Today</Button>
            <Button variant={dateRange === 'week' ? 'primary' : 'secondary'} onClick={() => setDateRange('week')}>This Week</Button>
            <Button variant={dateRange === 'month' ? 'primary' : 'secondary'} onClick={() => setDateRange('month')}>This Month</Button>
            <Button variant={dateRange === 'custom' ? 'primary' : 'secondary'} onClick={() => setDateRange('custom')}>Custom</Button>
          </div>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Input label="From" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-40" />
              <Input label="To" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-40" />
            </div>
          )}
        </div>

        <div className="mb-6"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>

        <div className="mb-6">
          <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">Active Employees</h2>
          <div className="flex flex-wrap gap-2">
            {workingEmployees.map(emp => (<Badge key={emp.id} variant="success" className="px-3 py-1.5"><Users className="w-3 h-3 mr-1" />{emp.name}</Badge>))}
            {workingEmployees.length === 0 && <p className="text-body text-text-secondary dark:text-gray-400">No employees currently working</p>}
          </div>
        </div>

        {activeTab === 'sales' && (
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white">Sales Transactions</h2><Badge variant="neutral">Read-only mode</Badge></div>
            <Table data={filteredSales.slice(0, 50)} columns={salesColumns} emptyMessage="No sales recorded for this period" loading={isLoading} />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white">Expenses</h2><div className="bg-accent/10 rounded-lg px-4 py-2"><p className="text-caption text-accent font-medium">Total: {formatCurrency(totalExpensesAmount)}</p></div></div>
            <Table data={filteredExpenses.slice().reverse()} columns={expensesColumns} emptyMessage="No expenses recorded for this period" loading={isLoading} />
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white">Employee Performance</h2>{topPerformer && <Badge variant="success"><BarChart3 className="w-3 h-3 mr-1" />Top: {topPerformer.name}</Badge>}</div>
            <Table data={commissionByEmployee} columns={[{ key: 'name', header: 'Employee', sortable: true }, { key: 'salesCount', header: 'Sales', sortable: true }, { key: 'commission', header: 'Commission', sortable: true, render: (row: any) => formatCurrency(row.commission) }]} emptyMessage="No sales data for this period" loading={isLoading} />
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-caption text-text-secondary dark:text-gray-400">
            Viewing data for {viewingSalonName} • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      <Modal isOpen={showMonthlyReport} onClose={() => setShowMonthlyReport(false)} title="Generate Monthly Report">
        <div className="space-y-4">
          <Input label="Select Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowMonthlyReport(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleExportMonthlyCSV} className="flex-1"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Button onClick={handleExportMonthlyPDF} className="flex-1"><FileText className="w-4 h-4 mr-2" />Export PDF</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}