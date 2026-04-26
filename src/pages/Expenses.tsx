import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home, Package, Zap, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { getExpenses, saveExpenses } from '../utils/storage';
import { formatCurrency, formatDate, getDateRangeFilter, isInDateRange } from '../utils/date';
import { useToast } from '../hooks/useToast';
import type { Expense, ExpenseCategory, DateRange } from '../types';

const CATEGORIES: { value: ExpenseCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'rent', label: 'Rent', icon: Home },
  { value: 'products', label: 'Products', icon: Package },
  { value: 'utilities', label: 'Utilities', icon: Zap },
  { value: 'marketing', label: 'Marketing', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other' as ExpenseCategory,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success } = useToast();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    const data = await getExpenses();
    setExpenses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const filterExpenses = async () => {
      setIsLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setIsLoading(false);
    };
    filterExpenses();
  }, [dateRange, customStart, customEnd]);

  const { start, end } = getDateRangeFilter(dateRange, customStart, customEnd);
  const filteredExpenses = expenses.filter(expense => isInDateRange(expense.date, start, end));
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (editingExpense) {
      const updated = expenses.map(exp =>
        exp.id === editingExpense.id
          ? { ...exp, ...formData, amount: parseFloat(formData.amount) }
          : exp
      );
      setExpenses(updated);
      await saveExpenses(updated);
      success('Expense updated successfully');
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
      };
      const updated = [...expenses, newExpense];
      setExpenses(updated);
      await saveExpenses(updated);
      success(`Expense added: ${formatCurrency(parseFloat(formData.amount))}`);
    }

    handleCloseModal();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      category: expense.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    await saveExpenses(updated);
    setDeleteConfirm(null);
    success('Expense deleted');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'other',
    });
    setErrors({});
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const columns = [
    { 
      key: 'date', 
      header: 'Date', 
      sortable: true, 
      render: (expense: Expense) => formatDate(expense.date) 
    },
    { 
      key: 'description', 
      header: 'Description', 
      sortable: true 
    },
    { 
      key: 'category', 
      header: 'Category', 
      sortable: true, 
      render: (expense: Expense) => {
        const cat = CATEGORIES.find(c => c.value === expense.category);
        const Icon = cat?.icon || MoreHorizontal;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-text-secondary dark:text-gray-400" />
            <span>{cat?.label || expense.category}</span>
          </div>
        );
      }
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      sortable: true, 
      render: (expense: Expense) => formatCurrency(expense.amount) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (expense: Expense) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleEdit(expense)}
            className="!px-3 !py-2 min-w-[44px] min-h-[44px]"
            aria-label={`Edit ${getCategoryLabel(expense.category)} expense: ${expense.description} for ${formatCurrency(expense.amount)} on ${formatDate(expense.date)}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteConfirm(expense.id)}
            className="!px-3 !py-2 min-w-[44px] min-h-[44px]"
            aria-label={`Delete ${getCategoryLabel(expense.category)} expense: ${expense.description} for ${formatCurrency(expense.amount)} on ${formatDate(expense.date)}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white">
          Expenses
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-auto">
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
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-2">
            <Input
              label="From"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}

        <div className="bg-accent/10 rounded-lg px-4 py-3">
          <p className="text-caption text-accent font-medium mb-1">Total Expenses</p>
          <p className="text-h2 font-heading font-bold text-accent">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      <Table
        data={filteredExpenses.slice().reverse()}
        columns={columns}
        emptyMessage="No expenses recorded for this period."
        loading={isLoading}
      />

      {showModal && (
        <Modal
          isOpen
          onClose={handleCloseModal}
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="e.g., Monthly rent payment"
              error={errors.description}
              required
            />
            <Input
              label="Amount (R)"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setErrors(prev => ({ ...prev, amount: '' }));
              }}
              placeholder="0.00"
              error={errors.amount}
              aria-label="Amount in Rands"
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setErrors(prev => ({ ...prev, date: '' }));
              }}
              error={errors.date}
              required
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          isOpen
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="text-body text-text-primary dark:text-white mb-6">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="flex-1">
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}