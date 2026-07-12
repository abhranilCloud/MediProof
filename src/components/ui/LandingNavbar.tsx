import { Link } from 'react-router-dom';
import WalletButton from '@/components/wallet/WalletButton';

export default function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[rgb(var(--hairline))] bg-[rgb(var(--surface))]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm brand-fill text-canvas font-bold text-sm transition-transform group-hover:scale-105">
            ⚕
          </div>
          <span className="text-xl font-bold tracking-tight text-[rgb(var(--ink))]">
            MediProof
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))] transition-colors">
            Protocol
          </Link>
          <Link to="/" className="text-sm font-medium text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))] transition-colors">
            Use Cases
          </Link>
          <Link to="/" className="text-sm font-medium text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))] transition-colors">
            Developers
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <WalletButton />
          <Link to="/dashboard" className="hidden text-sm font-semibold text-[rgb(var(--ink))] hover:text-[rgb(var(--brand))] md:block transition-colors">
            Dashboard →
          </Link>
        </div>
      </div>
    </nav>
  );
}
