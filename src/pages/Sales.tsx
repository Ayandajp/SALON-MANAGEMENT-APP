import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { getSales, saveSales } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/date';
import { QuickSaleModal } from '../components/QuickSaleModal';
import { useToast } from '../hooks/useToast';
import type { Sale } from '../types';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setIsLoading(true);
    const data = await getSales();
    setSales(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickSale(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    
    const updated = sales.filter(sale => sale.id !== id);
    setSales(updated);
    await saveSales(updated);
    setDeleteConfirm(null);
    setIsDeleting(false);
    success('Sale deleted');
  };

  const handleSaleAdded = async () => {
    await loadSales();
    setShowQuickSale(false);
  };

  const columns = [
    { key: 'date', header: 'Date', sortable: true, render: (sale: Sale) => formatDate(sale.date) },
    { key: 'employeeName', header: 'Employee', sortable: true },
    { key: 'service', header: 'Service', sortable: true },
    { key: 'customerName', header: 'Customer', render: (sale: Sale) => sale.customerName || '-' },
    { key: 'originalPrice', header: 'Original', sortable: true, render: (sale: Sale) => formatCurrency(sale.originalPrice) },
    { key: 'discount', header: 'Discount', render: (sale: Sale) => formatCurrency(sale.discount) },
    { key: 'finalTotal', header: 'Total', sortable: true, render: (sale: Sale) => formatCurrency(sale.finalTotal) },
    { key: 'commission', header: 'Commission', render: (sale: Sale) => formatCurrency(sale.commission) },
    {
      key: 'actions',
      header: 'Actions',
      render: (sale: Sale) => (
        <Button
          variant="danger"
          onClick={() => setDeleteConfirm(sale.id)}
          className="!px-3 !py-2 min-w-[44px] min-h-[44px]"
          aria-label={`Delete sale for ${sale.service}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Sales
        </h1>
        <Button onClick={() => setShowQuickSale(true)} title="Keyboard shortcut: Ctrl+N or Cmd+N">
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="bg-surface dark:bg-dark-surface rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Sales</p>
          <p className="text-h3 font-heading font-bold text-text-primary dark:text-white">
            {formatCurrency(sales.reduce((sum, s) => sum + s.finalTotal, 0))}
          </p>
        </div>
        <div>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Discounts</p>
          <p className="text-h3 font-heading font-bold text-danger">
            {formatCurrency(sales.reduce((sum, s) => sum + s.discount, 0))}
          </p>
        </div>
        <div>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Total Commission</p>
          <p className="text-h3 font-heading font-bold text-success">
            {formatCurrency(sales.reduce((sum, s) => sum + s.commission, 0))}
          </p>
        </div>
        <div>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-1">Transactions</p>
          <p className="text-h3 font-heading font-bold text-text-primary dark:text-white">
            {sales.length}
          </p>
        </div>
      </div>

      <Table
        data={sales.slice().reverse()}
        columns={columns}
        emptyMessage="No sales recorded yet. Click 'New Sale' to get started."
        loading={isLoading}
      />

      {showQuickSale && (
        <QuickSaleModal onClose={handleSaleAdded} />
      )}

      {deleteConfirm && (
        <Modal
          isOpen
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="text-body text-text-primary dark:text-white mb-6">
            Are you sure you want to delete this sale? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setDeleteConfirm(null)} 
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleDelete(deleteConfirm)} 
              className="flex-1"
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}