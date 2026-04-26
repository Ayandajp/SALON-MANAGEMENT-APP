import { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { getEmployees, getSales, saveSales, getCommissionHistory, saveCommissionHistory } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/date';
import { useToast } from '../hooks/useToast';
import type { Employee, Sale, CommissionPayment } from '../types';

export function Payroll() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [commissionHistory, setCommissionHistory] = useState<CommissionPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const today = new Date();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const employeesData = await getEmployees();
    const salesData = await getSales();
    const historyData = await getCommissionHistory();
    setEmployees(employeesData);
    setSales(salesData);
    setCommissionHistory(historyData);
    setIsLoading(false);
  };

  const unpaidCommissions = employees.map(employee => {
    const unpaidSales = sales.filter(
      sale => sale.employeeId === employee.id && !sale.commissionPaid
    );
    const totalCommission = unpaidSales.reduce((sum, sale) => sum + sale.commission, 0);
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      salesCount: unpaidSales.length,
      totalCommission,
      salesIds: unpaidSales.map(s => s.id),
    };
  }).filter(e => e.totalCommission > 0);

  const handlePayCommission = async (employeeId: string) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const employeeCommission = unpaidCommissions.find(e => e.employeeId === employeeId);
    if (!employeeCommission) {
      setIsProcessing(false);
      return;
    }

    const updatedSales = sales.map(sale =>
      employeeCommission.salesIds.includes(sale.id)
        ? { ...sale, commissionPaid: true }
        : sale
    );
    setSales(updatedSales);
    await saveSales(updatedSales);

    const payment: CommissionPayment = {
      id: Date.now().toString(),
      employeeId: employeeCommission.employeeId,
      employeeName: employeeCommission.employeeName,
      amount: employeeCommission.totalCommission,
      paymentDate: new Date().toISOString(),
      salesIds: employeeCommission.salesIds,
    };

    const updatedHistory = [...commissionHistory, payment];
    setCommissionHistory(updatedHistory);
    await saveCommissionHistory(updatedHistory);

    setIsProcessing(false);
    success(`Paid ${formatCurrency(employeeCommission.totalCommission)} to ${employeeCommission.employeeName}`);
  };

  const handlePayAll = async () => {
    if (unpaidCommissions.length === 0) {
      error('No unpaid commissions to process');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const allSalesIds = unpaidCommissions.flatMap(e => e.salesIds);
    const updatedSales = sales.map(sale =>
      allSalesIds.includes(sale.id)
        ? { ...sale, commissionPaid: true }
        : sale
    );
    setSales(updatedSales);
    await saveSales(updatedSales);

    const newPayments: CommissionPayment[] = unpaidCommissions.map(emp => ({
      id: `${Date.now()}-${emp.employeeId}`,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      amount: emp.totalCommission,
      paymentDate: new Date().toISOString(),
      salesIds: emp.salesIds,
    }));

    const updatedHistory = [...commissionHistory, ...newPayments];
    setCommissionHistory(updatedHistory);
    await saveCommissionHistory(updatedHistory);

    const totalPaid = unpaidCommissions.reduce((sum, e) => sum + e.totalCommission, 0);
    setIsProcessing(false);
    success(`Paid ${formatCurrency(totalPaid)} to ${unpaidCommissions.length} employees`);
  };

  const unpaidColumns = [
    { key: 'employeeName', header: 'Employee', sortable: true },
    { key: 'salesCount', header: 'Sales', sortable: true },
    { 
      key: 'totalCommission', 
      header: 'Commission Due', 
      sortable: true, 
      render: (row: any) => (
        <span className="font-bold text-h3 text-text-primary dark:text-white">
          {formatCurrency(row.totalCommission)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: any) => (
        <Button
          onClick={() => handlePayCommission(row.employeeId)}
          disabled={isProcessing}
          loading={isProcessing}
          className="min-h-[44px]"
          aria-label={`Pay commission to ${row.employeeName}`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Pay Now
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { 
      key: 'paymentDate', 
      header: 'Date', 
      sortable: true, 
      render: (payment: CommissionPayment) => formatDate(payment.paymentDate) 
    },
    { key: 'employeeName', header: 'Employee', sortable: true },
    { 
      key: 'amount', 
      header: 'Amount', 
      sortable: true, 
      render: (payment: CommissionPayment) => (
        <span className="font-semibold text-text-primary dark:text-white">
          {formatCurrency(payment.amount)}
        </span>
      )
    },
  ];

  const totalUnpaid = unpaidCommissions.reduce((sum, e) => sum + e.totalCommission, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white animate-pulse bg-surface dark:bg-dark-border rounded w-32 h-8" />
            <p className="text-body text-text-secondary dark:text-gray-400 mt-1 animate-pulse bg-surface dark:bg-dark-border rounded w-48 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
            Payroll
          </h1>
          <p className="text-body text-text-secondary dark:text-gray-400 mt-1">
            Process commission payments any day of the week
          </p>
        </div>
        {unpaidCommissions.length > 0 && (
          <Button 
            onClick={handlePayAll} 
            disabled={isProcessing}
            loading={isProcessing}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Pay All ({formatCurrency(totalUnpaid)})
          </Button>
        )}
      </div>

      <Card className="border-success/20 bg-success/5">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-1">
              Daily Commission Payments
            </h3>
            <p className="text-body text-text-secondary dark:text-gray-400">
              You can process commission payments any day of the week. Today is {today.toLocaleDateString('en-ZA', { weekday: 'long' })}.
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">
          Unpaid Commissions
        </h2>
        {unpaidCommissions.length === 0 ? (
          <EmptyState
            title="No unpaid commissions"
            description="All employee commissions have been paid. New commissions will appear here as sales are recorded."
            icon={<CheckCircle className="w-12 h-12" />}
          />
        ) : (
          <Table
            data={unpaidCommissions}
            columns={unpaidColumns}
            emptyMessage="No unpaid commissions"
          />
        )}
      </div>

      <div>
        <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-4">
          Payment History
        </h2>
        <Table
          data={commissionHistory.slice().reverse()}
          columns={historyColumns}
          emptyMessage="No payment history yet. Payments will appear here after processing."
        />
      </div>
    </div>
  );
}