import { Link } from 'react-router-dom';
import { IoFingerPrintOutline } from 'react-icons/io5';
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import { RiGroupLine, RiActivityLine } from 'react-icons/ri';
import { useWallet } from '@/hooks/useWallet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

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

// Mock data for the analytics chart
const generateChartData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    data.push({
      date: format(subDays(new Date(), i), 'MMM dd'),
      proofs: Math.floor(Math.random() * 40) + 10,
    });
  }
  return data;
};
const chartData = generateChartData();

// Mock data for the system logs
const SYSTEM_LOGS = [
  { id: 1, action: 'Clinical Proof Anchored', hash: 'e3b0c44298fc1c149afbf4c8996fb924', time: '2 mins ago' },
  { id: 2, action: 'License Granted', hash: 'CCFAGSHGYWELQKX4...', time: '14 mins ago' },
  { id: 3, action: 'Audit Verification Success', hash: '8d969eef6ecad3c29a3a629280e686cf', time: '1 hr ago' },
  { id: 4, action: 'Dispute Filed (Peer Review)', hash: 'CCFAGSHGYWELQKX4...', time: '3 hrs ago' },
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
            Manage your medical records, research data, and institutional sharing agreements on the
            Stellar network.
          </p>
        </div>

        {/* Network & Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">
              Network
            </p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">Soroban Testnet</p>
            <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">
              Current Ledger: Synchronized
            </p>
          </div>
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">
              Wallet Status
            </p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--brand))]">
              {isConnected ? `Balance: ${balance} XLM` : 'Connect wallet to transact'}
            </p>
          </div>
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">
              Active Records (7d)
            </p>
            <p className="mt-2 text-2xl font-bold text-[rgb(var(--ink))]">
              {chartData.reduce((acc, curr) => acc + curr.proofs, 0)}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">Zero-knowledge proofs anchored</p>
          </div>
        </div>

        {/* Analytics & System Logs Section (Level 5 Iteration) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
             <div className="flex items-center gap-2 mb-6">
                <RiActivityLine className="text-[rgb(var(--brand))] h-5 w-5" />
                <h3 className="text-lg font-semibold text-[rgb(var(--ink))]">Network Activity</h3>
             </div>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorProofs" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="rgb(var(--brand))" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="rgb(var(--brand))" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="date" stroke="rgb(var(--ink-muted))" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="rgb(var(--ink-muted))" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'rgb(var(--elevated))', borderColor: 'rgb(var(--hairline))', borderRadius: '0px' }}
                     itemStyle={{ color: 'rgb(var(--ink))' }}
                     labelStyle={{ color: 'rgb(var(--ink-muted))' }}
                   />
                   <Area type="monotone" dataKey="proofs" stroke="rgb(var(--brand))" fillOpacity={1} fill="url(#colorProofs)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
            <h3 className="mb-6 text-lg font-semibold text-[rgb(var(--ink))]">System Logs</h3>
            <div className="space-y-4">
              {SYSTEM_LOGS.map((log) => (
                <div key={log.id} className="border-b border-[rgb(var(--hairline))] pb-3 last:border-0">
                  <p className="text-sm font-medium text-[rgb(var(--ink))]">{log.action}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-[rgb(var(--ink-muted))]">
                    <span className="truncate w-32">{log.hash}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
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
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm ${action.color === 'brand' ? 'brand-fill text-canvas' : 'bg-[rgb(var(--elevated))] text-[rgb(var(--ink))]"'}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-[rgb(var(--ink))]">{action.title}</h4>
                <p className="mt-1 text-xs text-[rgb(var(--ink-muted))]">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
