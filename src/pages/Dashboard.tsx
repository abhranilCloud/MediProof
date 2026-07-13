import { Link } from 'react-router-dom';
import { IoFingerPrintOutline } from 'react-icons/io5';
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import { RiGroupLine } from 'react-icons/ri';
import { useWallet } from '@/hooks/useWallet';

const QUICK_ACTIONS = [
  {
    icon: IoFingerPrintOutline,
    title: 'Register Proof',
    desc: 'Hash and register a new medical record.',
    href: '/register',
    color: 'brand',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Audit Record',
    desc: 'Check cryptographic authenticity of evidence.',
    href: '/verify',
    color: 'ink',
  },
  {
    icon: RiGroupLine,
    title: 'Funding Allocation',
    desc: 'Manage research grant distribution.',
    href: '/split',
    color: 'ink',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Data Agreements',
    desc: 'Grant institutional data access.',
    href: '/licenses',
    color: 'ink',
  },
];

export default function Home() {
  const { isConnected, balance } = useWallet();

  return (
    <div className="relative min-h-[80vh]">
      
      <div className="relative z-10 space-y-8 animate-[reveal-up_0.5s_ease-out_both]">
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--ink))]">
            Clinical Operations
          </h2>
          <p className="mt-2 text-[rgb(var(--ink-muted))]">
            Manage your medical records, research data, and institutional sharing agreements on the Stellar network.
          </p>
        </div>

        {/* Network & Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">Network</p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">Soroban Testnet</p>
            <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">Current Ledger: Synchronized</p>
          </div>
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">Wallet Status</p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--brand))]">{isConnected ? `Balance: ${balance} XLM` : 'Connect wallet to transact'}</p>
          </div>
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">Active Records</p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">—</p>
            <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">Querying indexer...</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[rgb(var(--ink))]">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group relative flex flex-col rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 transition-colors hover:border-[rgb(var(--ink-muted))]"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm ${action.color === 'brand' ? 'brand-fill text-canvas' : 'bg-[rgb(var(--elevated))] text-[rgb(var(--ink))]"'}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-[rgb(var(--ink))]">{action.title}</h4>
                <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* System Logs / Recent Activity placeholder */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[rgb(var(--ink))]">System Logs</h3>
          <div className="flex h-40 items-center justify-center rounded-none border border-dashed border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] text-sm text-[rgb(var(--ink-muted))]">
            No recent clinical activity found for this session.
          </div>
        </div>
      </div>
    </div>
  );
}
