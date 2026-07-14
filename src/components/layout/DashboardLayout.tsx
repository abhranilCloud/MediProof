import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[rgb(var(--canvas))] text-[rgb(var(--ink))]">
      {/* Sidebar - Fixed to left */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col md:pl-64">
        <TopHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
