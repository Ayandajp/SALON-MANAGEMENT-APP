import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Users, DollarSign, Receipt, BarChart3, UserCircle, Wallet, Clock } from 'lucide-react';
import { getEmployees, getSales } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/date';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCommands = async () => {
      const employees = await getEmployees();
      const sales = await getSales();
      const recentSales = sales.slice(-10).reverse();

      const navCommands: Command[] = [
        { id: 'nav-dashboard', label: 'Dashboard', description: 'View today\'s overview', icon: Home, action: () => { navigate('/'); onClose(); }, category: 'Navigation' },
        { id: 'nav-employees', label: 'Employees', description: 'Manage team members', icon: Users, action: () => { navigate('/employees'); onClose(); }, category: 'Navigation' },
        { id: 'nav-sales', label: 'Sales', description: 'View sales history', icon: DollarSign, action: () => { navigate('/sales'); onClose(); }, category: 'Navigation' },
        { id: 'nav-expenses', label: 'Expenses', description: 'Track business expenses', icon: Receipt, action: () => { navigate('/expenses'); onClose(); }, category: 'Navigation' },
        { id: 'nav-reports', label: 'Reports', description: 'View analytics and charts', icon: BarChart3, action: () => { navigate('/reports'); onClose(); }, category: 'Navigation' },
        { id: 'nav-payroll', label: 'Payroll', description: 'Process commission payments', icon: Wallet, action: () => { navigate('/payroll'); onClose(); }, category: 'Navigation' },
        { id: 'nav-customers', label: 'Customers', description: 'View customer profiles', icon: UserCircle, action: () => { navigate('/customers'); onClose(); }, category: 'Navigation' },
      ];

      const employeeCommands: Command[] = employees.map(emp => ({
        id: `employee-${emp.id}`,
        label: emp.name,
        description: emp.isWorking ? 'Currently working' : 'Off duty',
        icon: Users,
        action: () => { navigate('/employees'); onClose(); },
        category: 'Employees',
      }));

      const salesCommands: Command[] = recentSales.map(sale => ({
        id: `sale-${sale.id}`,
        label: `${sale.service} - ${sale.customerName || 'Walk-in'}`,
        description: `${formatCurrency(sale.finalTotal)} • ${formatDate(sale.date)}`,
        icon: Clock,
        action: () => { navigate('/sales'); onClose(); },
        category: 'Recent Sales',
      }));

      setCommands([...navCommands, ...employeeCommands, ...salesCommands]);
    };

    if (isOpen) {
      loadCommands();
    }
  }, [isOpen, navigate, onClose]);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background dark:bg-dark-surface rounded-lg shadow-medium max-w-2xl w-full max-h-[60vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 p-4 border-b border-border dark:border-dark-border">
          <Search className="w-5 h-5 text-text-secondary dark:text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for pages, employees, or recent sales..."
            className="flex-1 bg-transparent text-body text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-gray-400 focus:outline-none"
            aria-label="Search command palette"
          />
          <kbd className="px-2 py-1 text-caption font-mono text-text-secondary dark:text-gray-400 bg-surface dark:bg-dark-background border border-border dark:border-dark-border rounded-sm">
            Esc
          </kbd>
        </div>

        <div className="overflow-y-auto max-h-[calc(60vh-80px)]">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-body text-text-secondary dark:text-gray-400">
                No results found for "{search}"
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="px-3 py-2 text-caption font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {cmds.map((cmd, _idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                            globalIndex === selectedIndex
                              ? 'bg-accent text-white'
                              : 'hover:bg-surface dark:hover:bg-dark-background text-text-primary dark:text-white'
                          }`}
                          aria-label={`${cmd.label}${cmd.description ? `: ${cmd.description}` : ''}`}
                        >
                          <cmd.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-body font-medium truncate">{cmd.label}</p>
                            {cmd.description && (
                              <p className={`text-caption truncate ${
                                globalIndex === selectedIndex
                                  ? 'text-white/80'
                                  : 'text-text-secondary dark:text-gray-400'
                              }`}>
                                {cmd.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-dark-border bg-surface/50 dark:bg-dark-surface/50">
          <div className="flex items-center gap-4 text-caption text-text-secondary dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded">↵</kbd>
              select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}