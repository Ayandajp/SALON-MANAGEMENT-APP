export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  isWorking: boolean;
}

export interface Sale {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  service: string;
  originalPrice: number;
  discount: number;
  finalTotal: number;
  commission: number;
  commissionPaid: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export type ExpenseCategory = 'rent' | 'products' | 'utilities' | 'marketing' | 'other';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  alertThreshold: number;
}

export interface Settings {
  darkMode: boolean;
  isUnlocked: boolean;
  pin: string;
}

export interface SalonSettings {
  name: string;
  logo?: string;
}

export interface CommissionPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentDate: string;
  salesIds: string[];
}

export type DateRange = 'today' | 'week' | 'month' | 'custom';