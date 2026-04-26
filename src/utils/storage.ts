import { supabase } from '../lib/supabase';
import type { Employee, Sale, Expense, Product, Settings, SalonSettings, CommissionPayment, ExpenseCategory } from '../types';

// Helper to get current user ID
const getUserId = (): string | null => {
  return localStorage.getItem('salon_user_id');
};

// ==================== EMPLOYEES ====================
export async function getEmployees(): Promise<Employee[]> {
  const userId = getUserId();
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_employees_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    console.error('Error fetching employees:', error.message);
    const localData = localStorage.getItem(`salon_employees_${userId}`);
    return localData ? JSON.parse(localData) : [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const employees = data.map(emp => ({
    id: String(emp.id),
    name: String(emp.name || ''),
    phone: String(emp.phone || ''),
    email: String(emp.email || ''),
    isWorking: Boolean(emp.is_working),
  }));

  localStorage.setItem(`salon_employees_${userId}`, JSON.stringify(employees));
  return employees;
}

export async function saveEmployees(employees: Employee[]): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  // Always save to localStorage first
  localStorage.setItem(`salon_employees_${userId}`, JSON.stringify(employees));

  if (!supabase) {
    console.log('Supabase not connected - saved to localStorage only');
    return;
  }

  for (const employee of employees) {
    const employeeData = {
      id: String(employee.id),
      name: String(employee.name || ''),
      phone: String(employee.phone || ''),
      email: String(employee.email || ''),
      is_working: Boolean(employee.isWorking),
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('employees')
      .upsert(employeeData, { onConflict: 'id' });

    if (error) {
      console.error('Error saving employee to Supabase:', error.message);
    } else {
      console.log('Employee saved to Supabase:', employee.name);
    }
  }
}

// ==================== SALES ====================
export async function getSales(): Promise<Sale[]> {
  const userId = getUserId();
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_sales_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching sales:', error.message);
    const localData = localStorage.getItem(`salon_sales_${userId}`);
    return localData ? JSON.parse(localData) : [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const sales = data.map(sale => ({
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

  localStorage.setItem(`salon_sales_${userId}`, JSON.stringify(sales));
  return sales;
}

export async function saveSales(sales: Sale[]): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  localStorage.setItem(`salon_sales_${userId}`, JSON.stringify(sales));

  if (!supabase) return;

  for (const sale of sales) {
    const saleData = {
      id: String(sale.id),
      date: sale.date,
      employee_id: String(sale.employeeId),
      employee_name: String(sale.employeeName),
      service: String(sale.service),
      original_price: Number(sale.originalPrice),
      discount: Number(sale.discount),
      final_total: Number(sale.finalTotal),
      commission: Number(sale.commission),
      commission_paid: Boolean(sale.commissionPaid),
      customer_name: sale.customerName ? String(sale.customerName) : null,
      customer_phone: sale.customerPhone ? String(sale.customerPhone) : null,
      customer_social_media: sale.customerEmail ? String(sale.customerEmail) : null,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sales')
      .upsert(saleData, { onConflict: 'id' });

    if (error) console.error('Error saving sale to Supabase:', error.message);
  }
}

// ==================== EXPENSES ====================
export async function getExpenses(): Promise<Expense[]> {
  const userId = getUserId();
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_expenses_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error.message);
    const localData = localStorage.getItem(`salon_expenses_${userId}`);
    return localData ? JSON.parse(localData) : [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const expenses = data.map(exp => ({
    id: String(exp.id),
    date: exp.date,
    description: String(exp.description),
    amount: Number(exp.amount),
    category: exp.category as ExpenseCategory,
  }));

  localStorage.setItem(`salon_expenses_${userId}`, JSON.stringify(expenses));
  return expenses;
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  localStorage.setItem(`salon_expenses_${userId}`, JSON.stringify(expenses));

  if (!supabase) return;

  for (const expense of expenses) {
    const expenseData = {
      id: String(expense.id),
      date: expense.date,
      description: String(expense.description),
      amount: Number(expense.amount),
      category: String(expense.category),
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('expenses')
      .upsert(expenseData, { onConflict: 'id' });

    if (error) console.error('Error saving expense to Supabase:', error.message);
  }
}

// ==================== PRODUCTS (local only - no user isolation needed) ====================
export function getProducts(): Product[] {
  const data = localStorage.getItem('salon_products');
  return data ? JSON.parse(data) : [
    { id: '1', name: 'Shampoo', quantity: 12, alertThreshold: 5 },
    { id: '2', name: 'Hair Color', quantity: 3, alertThreshold: 5 },
    { id: '3', name: 'Conditioner', quantity: 8, alertThreshold: 5 },
  ];
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem('salon_products', JSON.stringify(products));
}

// ==================== SETTINGS ====================
export async function getSettings(): Promise<Settings> {
  const userId = getUserId();
  const defaultSettings = { darkMode: false, isUnlocked: false, pin: '0000' };
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_settings_${userId}`);
    return data ? JSON.parse(data) : defaultSettings;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    const localData = localStorage.getItem(`salon_settings_${userId}`);
    return localData ? JSON.parse(localData) : defaultSettings;
  }

  const settings = {
    darkMode: Boolean(data.dark_mode),
    isUnlocked: Boolean(data.is_unlocked),
    pin: String(data.pin),
  };

  localStorage.setItem(`salon_settings_${userId}`, JSON.stringify(settings));
  return settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  localStorage.setItem(`salon_settings_${userId}`, JSON.stringify(settings));

  if (!supabase) return;

  const { error } = await supabase
    .from('settings')
    .upsert({
      id: userId,
      dark_mode: settings.darkMode,
      is_unlocked: settings.isUnlocked,
      pin: settings.pin,
      user_id: userId,
      updated_at: new Date().toISOString(),
    });

  if (error) console.error('Error saving settings to Supabase:', error.message);
}

// ==================== SALON SETTINGS ====================
export async function getSalonSettings(): Promise<SalonSettings> {
  const userId = getUserId();
  const defaultSettings = { name: 'My Salon', logo: '' };
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_salon_settings_${userId}`);
    return data ? JSON.parse(data) : defaultSettings;
  }

  const { data, error } = await supabase
    .from('salon_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    const localData = localStorage.getItem(`salon_salon_settings_${userId}`);
    return localData ? JSON.parse(localData) : defaultSettings;
  }

  const settings = {
    name: String(data.name),
    logo: data.logo ? String(data.logo) : '',
  };

  localStorage.setItem(`salon_salon_settings_${userId}`, JSON.stringify(settings));
  return settings;
}

export async function saveSalonSettings(settings: SalonSettings): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  localStorage.setItem(`salon_salon_settings_${userId}`, JSON.stringify(settings));

  if (!supabase) return;

  const { error } = await supabase
    .from('salon_settings')
    .upsert({
      id: userId,
      name: settings.name,
      logo: settings.logo,
      user_id: userId,
      updated_at: new Date().toISOString(),
    });

  if (error) console.error('Error saving salon settings to Supabase:', error.message);
}

// ==================== COMMISSION HISTORY ====================
export async function getCommissionHistory(): Promise<CommissionPayment[]> {
  const userId = getUserId();
  
  if (!supabase || !userId) {
    const data = localStorage.getItem(`salon_commission_history_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  const { data, error } = await supabase
    .from('commission_history')
    .select('*')
    .eq('user_id', userId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching commission history:', error.message);
    const localData = localStorage.getItem(`salon_commission_history_${userId}`);
    return localData ? JSON.parse(localData) : [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const history = data.map(item => ({
    id: String(item.id),
    employeeId: String(item.employee_id),
    employeeName: String(item.employee_name),
    amount: Number(item.amount),
    paymentDate: item.payment_date,
    salesIds: item.sales_ids || [],
  }));

  localStorage.setItem(`salon_commission_history_${userId}`, JSON.stringify(history));
  return history;
}

export async function saveCommissionHistory(history: CommissionPayment[]): Promise<void> {
  const userId = getUserId();
  
  if (!userId) return;
  
  localStorage.setItem(`salon_commission_history_${userId}`, JSON.stringify(history));

  if (!supabase) return;

  for (const payment of history) {
    const { error } = await supabase
      .from('commission_history')
      .upsert({
        id: String(payment.id),
        employee_id: String(payment.employeeId),
        employee_name: String(payment.employeeName),
        amount: Number(payment.amount),
        payment_date: payment.paymentDate,
        sales_ids: payment.salesIds,
        user_id: userId,
        updated_at: new Date().toISOString(),
      });

    if (error) console.error('Error saving commission history to Supabase:', error.message);
  }
}

// ==================== LOGOUT ====================
export async function logout(): Promise<void> {
  const userId = getUserId();
  
  if (userId) {
    // Clear user's local storage
    const keysToRemove = [
      `salon_employees_${userId}`,
      `salon_sales_${userId}`,
      `salon_expenses_${userId}`,
      `salon_settings_${userId}`,
      `salon_salon_settings_${userId}`,
      `salon_commission_history_${userId}`,
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  localStorage.removeItem('salon_user_id');
  
  if (supabase) {
    await supabase.auth.signOut();
  }
}

// ==================== INITIALIZE ====================
export async function initializeStorage(): Promise<void> {
  const userId = getUserId();
  
  if (!userId) {
    console.log('No user logged in');
    return;
  }
  
  console.log('Initializing storage for user:', userId);
  
  try {
    await Promise.all([
      getEmployees(),
      getSales(),
      getExpenses(),
      getSettings(),
      getSalonSettings(),
      getCommissionHistory(),
    ]);
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}