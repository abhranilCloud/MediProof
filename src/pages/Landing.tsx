import { Link } from 'react-router-dom';
import LandingNavbar from '@/components/ui/LandingNavbar';
import { IoFingerPrintOutline } from 'react-icons/io5';
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineCurrencyDollar,
  HiArrowRight,
} from 'react-icons/hi2';
import { RiGroupLine } from 'react-icons/ri';

const FEATURES = [
  {
    icon: IoFingerPrintOutline,
    title: 'EHR Provenance Registry',
    desc: 'Compute a SHA-256 fingerprint of any medical dataset locally — lab report, MRI DICOM, or clinical notes — and anchor it on-chain as immutable proof of existence.',
    num: '01',
    href: '/register',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Clinical Audit Trails',
    desc: 'Verify the cryptographic authenticity of any medical document against the on-chain registry. Re-hash locally and confirm provenance without relying on a centralized database.',
    num: '02',
    href: '/verify',
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: 'Treasury Disbursements',
    desc: 'Disburse XLM to any Stellar address for clinical trial reimbursements, research grants, or institutional data access fees — with full auditable transaction tracking.',
    num: '03',
    href: '/transfer',
  },
  {
    icon: RiGroupLine,
    title: 'Grant Allocations',
    desc: 'Register clinical research trials with multiple Co-Principal Investigators and custom funding percentages. Transfer research allocation rights freely on-chain.',
    num: '04',
    href: '/split',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Institutional Access Protocols',
    desc: 'Define open-access, restricted-research, or commercial data-sharing protocols on-chain. Cryptographically grant and revoke access keys to verified institutions.',
    num: '05',
    href: '/licenses',
  },
  {
    icon: HiOutlineScale,
    title: 'Clinical Peer Review',
    desc: 'Decentralized resolution for contested clinical evidence. Flag data integrity issues, submit counter-evidence, and resolve challenges with institutional Quadratic Voting.',
    num: '06',
    href: '/disputes',
  },
];

const STATS = [
  { label: 'Cost per Record', value: '<$0.001' },
  { label: 'Finality Time', value: '~5 sec' },
  { label: 'Network', value: 'Stellar' },
  { label: 'Privacy', value: 'Hash-only' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Client-Side Hashing',
    desc: 'Drop any medical file into the browser. A SHA-256 hash is computed locally using the Web Crypto API — your sensitive PHI never leaves your machine.',
  },
  {
    step: '02',
    title: 'Ledger Anchoring',
    desc: 'Submit the 32-byte cryptographic hash to the MediProof smart contract. The ledger timestamp becomes your immutable, legally-admissible provenance record.',
  },
  {
    step: '03',
    title: 'Zero-Knowledge Audits',
    desc: 'Any authorized party can re-hash the same file and query the registry to confirm exactly when and by whom the clinical record was first anchored.',
  },
  {
    step: '04',
    title: 'Protocol Governance',
    desc: 'Configure data-sharing protocols, provision access to institutions, and resolve contested clinical evidence through decentralized institutional voting.',
  },
];

export default function Landing() {
  return (
    <div className="bg-[rgb(var(--canvas))] text-[rgb(var(--ink))] min-h-screen font-sans">
      <LandingNavbar />
      <main className="relative">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-[rgb(var(--hairline))]">
          <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 text-center">
            <p className="mb-6 inline-block rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--hairline))] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[rgb(var(--ink-muted))]">
              Zero-Knowledge Clinical Provenance · Stellar Soroban
            </p>

            <h1 className="text-[3rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem] text-[rgb(var(--ink))]">
              Immutable Clinical Data.
              <br />
              <span className="text-[rgb(var(--ink-muted))]">Cryptographically Secured.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[rgb(var(--ink-muted))]">
              MediProof is a decentralized infrastructure layer for Electronic Health Records (EHR),
              clinical trials, and healthcare evidence. Anchor cryptographic provenance on Stellar
              Soroban — without exposing a single byte of Protected Health Information (PHI).
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard" className="btn-primary px-6 py-3">
                Open App Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stat Band ── */}
        <section className="mx-auto max-w-6xl px-6 py-12 border-b border-[rgb(var(--hairline))]">
          <div className="grid grid-cols-2 divide-x divide-[rgb(var(--hairline))] md:grid-cols-4">
            {STATS.map(({ label, value }) => (
              <div key={label} className="px-6 py-4 text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[rgb(var(--ink-muted))]">
                  {label}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--ink))]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="mx-auto max-w-6xl px-6 py-24 border-b border-[rgb(var(--hairline))]">
          <div className="mb-16 md:w-2/3">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-[rgb(var(--ink))]">
              Cryptographic Infrastructure for HealthTech.
            </h2>
            <p className="mt-4 text-lg text-[rgb(var(--ink-muted))]">
              A complete suite of Soroban smart contracts designed specifically for clinical data
              integrity, institutional access provisioning, and grant treasury management.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 transition-colors hover:border-[rgb(var(--ink-muted))]"
              >
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-[rgb(var(--elevated))] text-[rgb(var(--ink))]">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold tracking-tight text-lg text-[rgb(var(--ink))]">
                  {f.title}
                </h3>
                <p className="mb-8 flex-1 text-sm leading-relaxed text-[rgb(var(--ink-muted))]">
                  {f.desc}
                </p>
                <div className="mt-auto">
                  <Link
                    to={f.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--ink))] hover:text-[rgb(var(--brand))] transition-colors"
                  >
                    Try Feature <HiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-24 bg-[rgb(var(--surface))] border-b border-[rgb(var(--hairline))]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 md:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-[rgb(var(--ink))]">
                HIPAA-Compliant by Design.
              </h2>
              <p className="mt-4 text-lg text-[rgb(var(--ink-muted))]">
                Patient records and clinical datasets never leave your local environment. Only
                irreversible cryptographic hashes are transmitted to the decentralized ledger.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-4">
              {HOW_IT_WORKS.map((item, i) => (
                <div key={item.step} className="relative">
                  <div className="mb-4 text-xs font-mono text-[rgb(var(--ink-muted))]">
                    {item.step} —
                  </div>
                  <h4 className="font-semibold tracking-tight text-[rgb(var(--ink))]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--ink-muted))]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 text-center bg-[rgb(var(--canvas))]">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-[rgb(var(--ink))]">
            Secure Clinical Infrastructure.
          </h2>
          <div className="mt-10 flex justify-center">
            <Link to="/dashboard" className="btn-primary px-8 py-3 text-sm">
              Launch App
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
