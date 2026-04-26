import { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/Avatar';
import { getSales } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/date';
import type { Sale } from '../types';

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  sales: Array<{
    id: string;
    date: string;
    service: string;
    employeeName: string;
    finalTotal: number;
  }>;
}

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setIsLoading(true);
    const data = await getSales();
    setSales(data);
    setIsLoading(false);
  };

  const customers = sales.reduce((acc, sale) => {
    if (!sale.customerName || !sale.customerPhone) return acc;

    const key = `${sale.customerName}-${sale.customerPhone}`;
    if (!acc[key]) {
      acc[key] = {
        name: sale.customerName,
        phone: sale.customerPhone,
        email: sale.customerEmail || '',
        totalSpent: 0,
        visitCount: 0,
        lastVisit: sale.date,
        sales: [],
      };
    }

    acc[key].totalSpent += sale.finalTotal;
    acc[key].visitCount += 1;
    acc[key].sales.push({
      id: sale.id,
      date: sale.date,
      service: sale.service,
      employeeName: sale.employeeName,
      finalTotal: sale.finalTotal,
    });

    if (new Date(sale.date) > new Date(acc[key].lastVisit)) {
      acc[key].lastVisit = sale.date;
    }

    return acc;
  }, {} as Record<string, CustomerData>);

  const customerList = Object.values(customers).sort((a, b) => 
    new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );

  const filteredCustomers = customerList.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const totalCustomers = customerList.length;
  const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const repeatCustomers = customerList.filter(c => c.visitCount > 1).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Customers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx}>
              <div className="h-4 bg-surface dark:bg-dark-border rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-surface dark:bg-dark-border rounded w-16 animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (customerList.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Customers
        </h1>
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-surface dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-text-secondary dark:text-gray-400" />
            </div>
            <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-2">
              No customers yet
            </h2>
            <p className="text-body text-text-secondary dark:text-gray-400">
              Customer data will appear automatically when you record sales with customer information.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
        Customers
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Customers</p>
          <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            {totalCustomers}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-h2 font-heading font-bold text-success">
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Avg. Spending</p>
          <p className="text-h2 font-heading font-bold text-text-primary dark:text-white">
            {formatCurrency(avgSpending)}
          </p>
        </Card>
        <Card className="border-accent/20">
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Repeat Customers</p>
          <p className="text-h2 font-heading font-bold text-accent">
            {repeatCustomers}
          </p>
        </Card>
      </div>

      <Input
        label="Search customers"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map((customer, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-4 mb-4">
              <Avatar name={customer.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white truncate">
                    {customer.name}
                  </h3>
                  {customer.visitCount > 1 && (
                    <Badge variant="accent">
                      {customer.visitCount} visits
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-caption md:text-body text-text-secondary dark:text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-caption md:text-body text-text-secondary dark:text-gray-400">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-surface dark:bg-dark-surface rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-success" />
                  <p className="text-caption text-text-secondary dark:text-gray-400">Total Spent</p>
                </div>
                <p className="text-body font-semibold text-success">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-text-secondary dark:text-gray-400" />
                  <p className="text-caption text-text-secondary dark:text-gray-400">Last Visit</p>
                </div>
                <p className="text-body font-semibold text-text-primary dark:text-white">
                  {formatDate(customer.lastVisit)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-body font-heading font-semibold text-text-primary dark:text-white mb-2">
                Recent Visits
              </h4>
              <div className="space-y-2">
                {customer.sales.slice(0, 3).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-2 bg-surface dark:bg-dark-surface rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-text-primary dark:text-white truncate">
                        {sale.service}
                      </p>
                      <p className="text-caption text-text-secondary dark:text-gray-400">
                        {formatDate(sale.date)} • {sale.employeeName}
                      </p>
                    </div>
                    <p className="text-body font-semibold text-text-primary dark:text-white ml-2">
                      {formatCurrency(sale.finalTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-body text-text-secondary dark:text-gray-400">
            No customers found matching "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
}