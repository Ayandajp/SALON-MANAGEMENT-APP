import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background transition-colors">
      <div className="pb-20 md:pb-0 md:pl-64">
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Navigation />
    </div>
  );
}