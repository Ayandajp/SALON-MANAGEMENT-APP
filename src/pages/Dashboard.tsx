import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, Users, Wallet, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { getSales, getEmployees, getProducts } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/date';
import type { Sale, Employee } from '../types';
import { QuickSaleModal } from '../components/QuickSaleModal';
import { useToast } from '../hooks/useToast';

export function Dashboard() {
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products] = useState(getProducts());
  const { success } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const salesData = await getSales();
      const employeesData = await getEmployees();
      setSales(salesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const todayCommission = todaySales.reduce((sum, sale) => sum + sale.commission, 0);
  const workingToday = employees.filter(e => e.isWorking).length;
  const lowStockProducts = products.filter(p => p.quantity < p.alertThreshold);

  const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSale(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSaleAdded = async () => {
    await loadData();
    setShowQuickSale(false);
    success('Sale recorded successfully!');
  };

  const salesColumns = [
    { key: 'date', header: 'Date', render: (sale: Sale) => formatDate(sale.date) },
    { key: 'employeeName', header: 'Employee' },
    { key: 'service', header: 'Service' },
    { key: 'finalTotal', header: 'Total', render: (sale: Sale) => formatCurrency(sale.finalTotal) },
  ];

  const StatCardSkeleton = () => (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-surface dark:bg-dark-border rounded w-24 mb-2 animate-pulse" />
          <div className="h-8 bg-surface dark:bg-dark-border rounded w-32 mb-2 animate-pulse" />
          <div className="h-3 bg-surface dark:bg-dark-border rounded w-20 animate-pulse" />
        </div>
        <div className="p-3 bg-accent/10 rounded-md">
          <div className="w-6 h-6 bg-accent/20 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
            Dashboard
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowQuickSale(true)} 
            title={`Keyboard shortcut: ${shortcutKey}`}
            className="relative"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Sale
            <Badge 
              variant="neutral" 
              className="ml-2 bg-white/20 dark:bg-black/20 text-white dark:text-white border-0 text-xs px-2 py-0.5"
            >
              {shortcutKey}
            </Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">
                    Today's Sales
                  </p>
                  <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
                    {formatCurrency(todayTotal)}
                  </p>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mt-1">
                    {todaySales.length} transactions
                  </p>
                </div>
                <div className="p-3 bg-accent/10 rounded-md">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">
                    Total Commission
                  </p>
                  <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
                    {formatCurrency(todayCommission)}
                  </p>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mt-1">
                    from today's sales
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-md">
                  <Wallet className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">
                    Working Today
                  </p>
                  <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
                    {workingToday}
                  </p>
                  <p className="text-caption text-text-secondary dark:text-gray-400 mt-1">
                    of {employees.length} employees
                  </p>
                </div>
                <div className="p-3 bg-surface dark:bg-dark-surface rounded-md border border-border dark:border-dark-border">
                  <Users className="w-6 h-6 text-text-primary dark:text-white" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-danger/20 dark:border-danger/30">
          <div className="flex items-start gap-3" role="alert" aria-live="polite">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-2">
                Low Stock Alert
              </h3>
              <div className="space-y-2">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <span className="text-body text-text-primary dark:text-white">
                      {product.name}
                    </span>
                    <Badge variant="danger">
                      {product.quantity} remaining
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white">
            Recent Sales
          </h2>
          <Badge variant="neutral">Last 5 transactions</Badge>
        </div>
        <Table
          data={recentSales}
          columns={salesColumns}
          emptyMessage="No sales recorded yet"
          loading={isLoading}
        />
      </div>

      {showQuickSale && (
        <QuickSaleModal onClose={handleSaleAdded} />
      )}
    </div>
  );
}