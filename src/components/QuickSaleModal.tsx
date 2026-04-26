import { useState, useEffect } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { getEmployees, getSales, saveSales } from '../utils/storage';
import { formatCurrency } from '../utils/date';
import { useToast } from '../hooks/useToast';
import type { Sale, Employee } from '../types';

const SERVICES = [
  { value: 'haircut', label: 'Haircut - R150', price: 150 },
  { value: 'colour', label: 'Colour - R400', price: 400 },
  { value: 'blowdry', label: 'Blow-dry - R100', price: 100 },
  { value: 'braids', label: 'Braids - R300', price: 300 },
  { value: 'custom', label: 'Custom Service', price: 0 },
];

type DiscountType = 'percentage' | 'fixed';

interface QuickSaleModalProps {
  onClose: () => void;
}

export function QuickSaleModal({ onClose }: QuickSaleModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    employeeId: '',
    service: '',
    customService: '',
    customPrice: '',
    discountType: 'percentage' as DiscountType,
    discount: '',
    commission: '',
    customerName: '',
    customerPhone: '',
    customerSocialMedia: '',
    saleDate: getTodayDate(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data.filter(e => e.isWorking));
      } catch (err) {
        console.error('Error loading employees:', err);
        toastError('Failed to load employees');
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [toastError]);

  const selectedService = SERVICES.find(s => s.value === formData.service);
  const originalPrice = formData.service === 'custom' 
    ? parseFloat(formData.customPrice) || 0 
    : selectedService?.price || 0;
  
  const discountAmount = formData.discountType === 'percentage'
    ? (originalPrice * (parseFloat(formData.discount) || 0)) / 100
    : parseFloat(formData.discount) || 0;
  
  const finalTotal = Math.max(0, originalPrice - discountAmount);
  const commissionAmount = parseFloat(formData.commission) || 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    if (formData.service === 'custom') {
      if (!formData.customService.trim()) {
        newErrors.customService = 'Please enter service name';
      }
      if (!formData.customPrice || parseFloat(formData.customPrice) <= 0) {
        newErrors.customPrice = 'Price must be greater than 0';
      }
    }

    if (!formData.saleDate) {
      newErrors.saleDate = 'Sale date is required';
    }

    if (formData.discount && parseFloat(formData.discount) < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }

    if (formData.discountType === 'percentage' && formData.discount && parseFloat(formData.discount) > 100) {
      newErrors.discount = 'Percentage cannot exceed 100%';
    }

    if (!formData.commission || formData.commission.trim() === '') {
      newErrors.commission = 'Commission amount is required';
    } else if (parseFloat(formData.commission) < 0) {
      newErrors.commission = 'Commission cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toastError('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) {
      toastError('Selected employee not found');
      setIsSubmitting(false);
      return;
    }

    const serviceName = formData.service === 'custom' 
      ? formData.customService.trim() 
      : selectedService?.label.split(' - ')[0] || '';

    // Create date with time to preserve the selected date
    const selectedDate = new Date(formData.saleDate);
    selectedDate.setHours(12, 0, 0, 0); // Set noon to avoid timezone issues
    
    const newSale: Sale = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      employeeId: employee.id,
      employeeName: employee.name,
      service: serviceName,
      originalPrice,
      discount: discountAmount,
      finalTotal,
      commission: commissionAmount,
      commissionPaid: false,
      customerName: formData.customerName.trim() || undefined,
      customerPhone: formData.customerPhone.trim() || undefined,
      customerEmail: formData.customerSocialMedia.trim() || undefined,
    };

    // Get existing sales and add new one
    const currentSales = await getSales();
    await saveSales([...currentSales, newSale]);

    setIsSubmitting(false);
    const formattedDate = new Date(formData.saleDate).toLocaleDateString('en-ZA');
    success(`Sale recorded: ${formatCurrency(finalTotal)} on ${formattedDate} • Commission: ${formatCurrency(commissionAmount)}`);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      service: '',
      customService: '',
      customPrice: '',
      discountType: 'percentage',
      discount: '',
      commission: '',
      customerName: '',
      customerPhone: '',
      customerSocialMedia: '',
      saleDate: getTodayDate(),
    });
    setErrors({});
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  if (isLoadingEmployees) {
    return (
      <Modal isOpen onClose={handleModalClose} title="Quick Sale">
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-body text-text-primary dark:text-white mt-4">Loading employees...</p>
        </div>
      </Modal>
    );
  }

  if (employees.length === 0) {
    return (
      <Modal isOpen onClose={handleModalClose} title="Quick Sale">
        <div className="text-center py-8">
          <p className="text-body text-text-primary dark:text-white mb-4">
            No employees are currently working.
          </p>
          <p className="text-caption text-text-secondary dark:text-gray-400 mb-6">
            Please clock in an employee before recording a sale.
          </p>
          <Button onClick={handleModalClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={handleModalClose} title="Quick Sale">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee"
          value={formData.employeeId}
          onChange={(e) => {
            setFormData({ ...formData, employeeId: e.target.value });
            setErrors(prev => ({ ...prev, employeeId: '' }));
          }}
          options={[
            { value: '', label: 'Select employee' },
            ...employees.map(emp => ({ value: emp.id, label: emp.name })),
          ]}
          error={errors.employeeId}
          required
        />

        <Select
          label="Service"
          value={formData.service}
          onChange={(e) => {
            setFormData({ ...formData, service: e.target.value });
            setErrors(prev => ({ ...prev, service: '' }));
          }}
          options={[
            { value: '', label: 'Select service...' },
            ...SERVICES.map(s => ({ value: s.value, label: s.label })),
          ]}
          error={errors.service}
          required
        />

        {formData.service === 'custom' && (
          <>
            <Input
              label="Service Name"
              value={formData.customService}
              onChange={(e) => {
                setFormData({ ...formData, customService: e.target.value });
                setErrors(prev => ({ ...prev, customService: '' }));
              }}
              placeholder="e.g., Deep Conditioning"
              error={errors.customService}
              required
            />
            <Input
              label="Price (R)"
              type="number"
              min="0"
              step="0.01"
              value={formData.customPrice}
              onChange={(e) => {
                setFormData({ ...formData, customPrice: e.target.value });
                setErrors(prev => ({ ...prev, customPrice: '' }));
              }}
              placeholder="0.00"
              error={errors.customPrice}
              aria-label="Amount in Rands"
              required
            />
          </>
        )}

        {/* Date Picker Field */}
        <div className="relative">
          <Input
            label="Sale Date"
            type="date"
            value={formData.saleDate}
            onChange={(e) => {
              setFormData({ ...formData, saleDate: e.target.value });
              setErrors(prev => ({ ...prev, saleDate: '' }));
            }}
            error={errors.saleDate}
            required
          />
          <Calendar className="absolute right-3 top-9 w-4 h-4 text-text-secondary dark:text-gray-400 pointer-events-none" />
        </div>

        <Input
          label="Customer Name (Optional)"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="e.g., Jane Smith"
        />

        <div>
          <label className="text-caption font-medium text-text-primary dark:text-white mb-2 block">
            Discount
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
              className={`flex-1 px-3 py-2 rounded-md text-body font-medium transition-colors ${
                formData.discountType === 'percentage'
                  ? 'bg-accent text-white'
                  : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-white hover:bg-border/50'
              }`}
            >
              Percentage
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
              className={`flex-1 px-3 py-2 rounded-md text-body font-medium transition-colors ${
                formData.discountType === 'fixed'
                  ? 'bg-accent text-white'
                  : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-white hover:bg-border/50'
              }`}
            >
              Fixed Amount
            </button>
          </div>
          <Input
            label={formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount (R)'}
            type="number"
            min="0"
            step={formData.discountType === 'percentage' ? '1' : '0.01'}
            max={formData.discountType === 'percentage' ? '100' : undefined}
            value={formData.discount}
            onChange={(e) => {
              setFormData({ ...formData, discount: e.target.value });
              setErrors(prev => ({ ...prev, discount: '' }));
            }}
            placeholder="0"
            error={errors.discount}
            aria-label={formData.discountType === 'percentage' ? 'Discount percentage' : 'Discount amount in Rands'}
          />
        </div>

        <div className="relative">
          <Input
            label="Commission Amount (R)"
            type="number"
            min="0"
            step="0.01"
            value={formData.commission}
            onChange={(e) => {
              setFormData({ ...formData, commission: e.target.value });
              setErrors(prev => ({ ...prev, commission: '' }));
            }}
            placeholder="Enter commission amount"
            error={errors.commission}
            aria-label="Commission amount in Rands"
            aria-describedby="commission-help"
            required
          />
          <p id="commission-help" className="text-caption text-text-secondary dark:text-gray-400 mt-1">
            Enter the exact commission amount for this sale
          </p>
        </div>

        {originalPrice > 0 && (
          <div className="bg-surface dark:bg-dark-surface rounded-lg p-4 border border-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-body text-text-secondary dark:text-gray-400">Original Price:</span>
              <span className="text-body font-semibold text-text-primary dark:text-white">
                {formatCurrency(originalPrice)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-body text-text-secondary dark:text-gray-400">Discount:</span>
                <span className="text-body font-semibold text-danger">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-body text-text-secondary dark:text-gray-400">Commission:</span>
              <span className="text-body font-semibold text-success">
                {formatCurrency(commissionAmount)}
              </span>
            </div>
            <div className="border-t border-border dark:border-dark-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-h3 font-heading font-bold text-text-primary dark:text-white">Final Total:</span>
                <span className="text-h2 font-heading font-bold text-accent">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleModalClose} 
            className="flex-1" 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Recording...' : 'Record Sale'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}