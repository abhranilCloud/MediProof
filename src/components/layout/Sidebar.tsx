import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineScale,
  HiOutlineCurrencyDollar,
  HiOutlineFingerPrint,
} from 'react-icons/hi2';
import { MdOutlineDashboard } from 'react-icons/md';
import { RiGroupLine } from 'react-icons/ri';

const NAV_GROUPS = [
  {
    title: 'Clinical Operations',
    links: [{ label: 'Dashboard Overview', href: '/dashboard', icon: MdOutlineDashboard }],
  },
  {
    title: 'Data Provenance',
    links: [
      { label: 'Register Proof', href: '/register', icon: HiOutlineFingerPrint },
      { label: 'Audit Record', href: '/verify', icon: HiOutlineShieldCheck },
      { label: 'EHR Database', href: '/portfolio', icon: HiOutlineDocumentText },
    ],
  },
  {
    title: 'Institutional Access',
    links: [
      { label: 'Funding Allocation', href: '/split', icon: RiGroupLine },
      { label: 'Data Agreements', href: '/licenses', icon: HiOutlineDocumentText },
    ],
  },
  {
    title: 'Governance',
    links: [
      { label: 'Peer Review Cases', href: '/disputes', icon: HiOutlineScale },
      { label: 'Treasury (XLM)', href: '/transfer', icon: HiOutlineCurrencyDollar },
    ],
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[260px] flex-col border-r border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] md:flex">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-[rgb(var(--hairline))]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm brand-fill text-canvas font-bold text-sm transition-transform group-hover:scale-105">
            ⚕
          </div>
          <span className="text-lg font-bold tracking-tight text-[rgb(var(--ink))]">
            MediProof
          </span>
        </Link>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="flex flex-col gap-8">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 px-6 text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--ink-muted))]">
                {group.title}
              </h4>
              <div className="flex flex-col">
                {group.links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[rgb(var(--canvas))] text-[rgb(var(--ink))] border-l-2 border-[rgb(var(--brand))]'
                          : 'text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--canvas))] hover:text-[rgb(var(--ink))] border-l-2 border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-[rgb(var(--brand))]' : 'opacity-60'}`} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="border-t border-[rgb(var(--hairline))] p-4">
        <div className="rounded bg-[rgb(var(--elevated))] p-3 text-xs text-[rgb(var(--ink-muted))]">
          <p className="font-semibold text-[rgb(var(--ink))]">MediProof Soroban</p>
          <p className="mt-1">Testnet v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
