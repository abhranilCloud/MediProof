import { useLocation } from 'react-router-dom';
import WalletButton from '@/components/wallet/WalletButton';
import { HiOutlineMenu } from 'react-icons/hi';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Clinical Dashboard Overview',
  '/register': 'Register Cryptographic Proof',
  '/verify': 'Audit Clinical Record',
  '/split': 'Research Funding Allocation',
  '/licenses': 'Institutional Data Agreements',
  '/disputes': 'Clinical Peer Review',
  '/portfolio': 'EHR Database',
  '/transfer': 'Treasury Management',
};

export default function TopHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] px-6">
      {/* Mobile Menu Button - visible only on small screens */}
      <button 
        onClick={onOpenMenu}
        className="md:hidden text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))]"
      >
        <HiOutlineMenu className="h-6 w-6" />
      </button>

      {/* Page Title */}
      <h1 className="text-lg font-semibold tracking-tight text-[rgb(var(--ink))]">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-4">
        <WalletButton />
      </div>
    </header>
  );
}
