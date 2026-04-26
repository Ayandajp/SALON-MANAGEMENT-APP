import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PINLock } from './components/PINLock';
import { ToastContainer } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Sales } from './pages/Sales';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Payroll } from './pages/Payroll';
import { Customers } from './pages/Customers';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { supabase } from './lib/supabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase!.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();

    const { data: listener } = supabase!.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-text-secondary dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <PINLock />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="customers" element={<Customers />} />
          </Route>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;