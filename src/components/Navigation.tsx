import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, Receipt, BarChart3, UserCircle, Moon, Sun, Settings, Scissors, Wallet } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { getSalonSettings } from '../utils/storage';
import { SettingsModal } from './SettingsModal';
import type { SalonSettings } from '../types';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/sales', icon: DollarSign, label: 'Sales' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/payroll', icon: Wallet, label: 'Payroll' },
  { path: '/customers', icon: UserCircle, label: 'Customers' },
];

export function Navigation() {
  const { settings, toggleDarkMode } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [salonSettings, setSalonSettings] = useState<SalonSettings>({ name: 'Glam & Co. Salon', logo: '' });
  const [logoError, setLogoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const updateSalonSettings = async () => {
    const settings = await getSalonSettings();
    setSalonSettings(settings);
    setLogoError(false);
    setLogoLoaded(false);
  };

  useEffect(() => {
    updateSalonSettings();
  }, []);

  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoaded(true);
  };

  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background dark:bg-dark-surface border-t border-border dark:border-dark-border z-40">
        <div className="grid grid-cols-7 gap-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 transition-colors relative min-h-[48px] min-w-[48px] rounded-md ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white'
                }`
              }
              aria-label={`Navigate to ${item.label}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-[10px] leading-tight text-center">{item.label}</span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-b-full" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-background dark:bg-dark-surface border-r border-border dark:border-dark-border z-40">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {salonSettings.logo && !logoError ? (
                  <>
                    {!logoLoaded && (
                      <div className="absolute inset-0 bg-accent/10 animate-pulse" />
                    )}
                    <img 
                      src={salonSettings.logo} 
                      alt={`${salonSettings.name} logo`}
                      className={`w-full h-full object-contain transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onError={handleLogoError}
                      onLoad={handleLogoLoad}
                    />
                  </>
                ) : (
                  <Scissors className="w-5 h-5 text-accent" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-h3 font-heading font-bold text-text-primary dark:text-white truncate">
                  {salonSettings.name}
                </h1>
                <p className="text-caption text-text-secondary dark:text-gray-400">
                  Management
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-primary dark:text-white hover:bg-surface dark:hover:bg-dark-background'
                  }`
                }
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-body font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border dark:border-dark-border space-y-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left text-text-primary dark:text-white hover:bg-surface dark:hover:bg-dark-background min-h-[44px]"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
              <span className="text-body font-medium">Settings</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left text-text-primary dark:text-white hover:bg-surface dark:hover:bg-dark-background min-h-[44px]"
            >
              {settings.darkMode ? (
                <>
                  <Sun className="w-5 h-5" aria-hidden="true" />
                  <span className="text-body font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-body font-medium">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={updateSalonSettings}
        />
      )}
    </>
  );
}