'use client';

import { useState, useCallback } from 'react';

import DropZone from '@/components/ui/DropZone';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { CONSORTIUM_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlinePlusCircle, HiOutlineMinusCircle, HiOutlineArrowPath, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { RiGroupLine } from 'react-icons/ri';

interface Investigator {
  address: string;
  share: number; // basis points (0-10000)
}

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

const SHARE_COLORS = [
  'bg-[rgb(var(--brand))]',
  'bg-[rgb(53_199_122)]',
  'bg-[rgb(236_179_92)]',
  'bg-[rgb(242_94_106)]',
  'bg-[rgb(147_197_253)]',
  'bg-[rgb(196_181_253)]',
];

export default function SplitPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [title, setTitle] = useState('');
  const [investigators, setInvestigators] = useState<Investigator[]>([
    { address: '', share: 6000 },
    { address: '', share: 4000 },
  ]);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const totalShares = investigators.reduce((sum, c) => sum + c.share, 0);
  const isValid =
    fileHash &&
    title &&
    totalShares === 10000 &&
    investigators.every((c) => c.address && c.share > 0);

  const handleFileHashed = useCallback((hash: string) => setFileHash(hash), []);
  const addInvestigator = useCallback(() => {
    setInvestigators((prev) => [...prev, { address: '', share: 0 }]);
  }, []);
  const removeInvestigator = useCallback((index: number) => {
    setInvestigators((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const updateInvestigator = useCallback(
    (index: number, field: 'address' | 'share', value: string | number) => {
      setInvestigators((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, [field]: field === 'share' ? Number(value) : value } : c
        )
      );
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!isConnected || !isValid) return;
    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(fileHash.substring(i * 2, i * 2 + 2), 16);
      }

      const creatorAddresses = investigators.map((c) =>
        StellarSdk.nativeToScVal(c.address, { type: 'address' })
      );
      const creatorShares = investigators.map((c) =>
        StellarSdk.nativeToScVal(c.share, { type: 'u32' })
      );

      const args = [
        StellarSdk.xdr.ScVal.scvVec(creatorAddresses),
        StellarSdk.xdr.ScVal.scvVec(creatorShares),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
        StellarSdk.nativeToScVal(title, { type: 'string' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: CONSORTIUM_CONTRACT_ID,
        method: 'register_work',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Registering research consortium…', { id: 'split' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Research consortium registered!', { id: 'split' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Registration failed.', { id: 'split' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Registration failed', { id: 'split' });
    }
  }, [isConnected, isValid, fileHash, title, investigators, publicKey]);

  const busy = txStatus === 'signing' || txStatus === 'polling';

  return (
    <>
      
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow mb-3">Institutional Grants</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          <span className="text-[rgb(var(--ink))]">Research Funding</span> Allocation
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Register a clinical research trial or medical dataset with multiple Co-Principal Investigators and
          custom funding percentages. Allocations must total exactly 100%.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">
              Connect your institutional wallet to configure grant allocations.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Step 1 — Document */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <p className="eyebrow mb-4">01 — Clinical Dataset Hash</p>
              <DropZone onFileHashed={handleFileHashed} disabled={busy} />
            </div>

            {/* Step 2 — Title */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <p className="eyebrow mb-4">02 — Trial / Dataset Designation</p>
              <input
                id="split-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Phase III Clinical Trial on Compound X — 2026"
                className="input-field text-sm"
              />
            </div>

            {/* Step 3 — Investigators */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow">03 — Principal Investigators & Allocation (BPS)</p>
                <button
                  onClick={addInvestigator}
                  className="transition-colors transition-colors hover:border-[rgb(var(--ink-muted))]"
                  style={{ color: 'rgb(var(--brand))' }}
                >
                  <HiOutlinePlusCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {investigators.map((investigator, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={investigator.address}
                      onChange={(e) => updateInvestigator(i, 'address', e.target.value)}
                      placeholder="G... Stellar wallet address"
                      className="input-field font-mono text-xs flex-1"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={investigator.share}
                        onChange={(e) => updateInvestigator(i, 'share', e.target.value)}
                        className="input-field text-sm w-24 text-center"
                        min="0"
                        max="10000"
                      />
                      <span className="text-xs w-12" style={{ color: 'rgb(var(--ink-faint))' }}>
                        {(investigator.share / 100).toFixed(1)}%
                      </span>
                    </div>
                    {investigators.length > 2 && (
                      <button
                        onClick={() => removeInvestigator(i)}
                        style={{ color: 'rgb(var(--danger))' }}
                      >
                        <HiOutlineMinusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                className="mt-4 flex items-center justify-between rounded-lg px-4 py-2"
                style={{
                  background: totalShares === 10000
                    ? 'rgb(var(--success) / 0.12)'
                    : 'rgb(var(--danger) / 0.12)',
                  border: `1px solid ${totalShares === 10000
                    ? 'rgb(var(--success) / 0.3)'
                    : 'rgb(var(--danger) / 0.3)'}`,
                }}
              >
                <span className="text-xs text-[rgb(var(--ink-muted))]">Total</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: totalShares === 10000 ? 'rgb(var(--success))' : 'rgb(var(--danger))' }}
                >
                  {(totalShares / 100).toFixed(1)}% / 100%
                </span>
              </div>

              {/* Visual bar */}
              <div
                className="mt-3 flex h-2 rounded-full overflow-hidden"
                style={{ background: 'rgb(var(--elevated))' }}
              >
                {investigators.map((c, i) => (
                  <div
                    key={i}
                    className={`${SHARE_COLORS[i % SHARE_COLORS.length]} transition-all duration-300`}
                    style={{ width: `${(c.share / 10000) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              id="split-submit-btn"
              onClick={handleSubmit}
              disabled={!isValid || busy}
              className="btn-primary w-full justify-center text-sm py-3 "
            >
              {busy ? (
                <><HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Executing Smart Contract…'}
                </>
              ) : (
                <><RiGroupLine className="h-4 w-4" /> Finalize Funding Allocation</>
              )}
            </button>

            {/* Success */}
            {txStatus === 'success' && txHash && (
              <div className="rounded-none border border-green-900/50 bg-[rgb(var(--surface))] p-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--success))' }}>
                  ✓ Research Grant Allocation Configured
                </h3>
                <div>
                  <p className="eyebrow mb-1">Transaction</p>
                  <a
                    href={stellar.getExplorerLink(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono break-all"
                    style={{ color: 'rgb(var(--brand))' }}
                  >
                    {txHash} <HiArrowTopRightOnSquare className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
