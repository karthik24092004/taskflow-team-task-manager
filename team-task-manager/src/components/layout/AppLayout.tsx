import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <div className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
