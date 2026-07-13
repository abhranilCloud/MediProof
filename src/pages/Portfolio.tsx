'use client';

import { useState, useEffect, useCallback } from 'react';

import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { CONSORTIUM_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineArrowsRightLeft, HiOutlineArrowPath, HiArrowTopRightOnSquare } from 'react-icons/hi2';

interface OwnedWork {
  id: string;
  title: string;
  fileHash: string;
  myShare: number;
  totalShares: number;
  createdAt: string;
}

export default function PortfolioPage() {
  const { publicKey, isConnected } = useWallet();
  const [works, setWorks] = useState<OwnedWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferModal, setTransferModal] = useState<{ workId: string; share: number } | null>(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      // Query contract for works owned by this address
      const countVal = await stellar.simulateRead({
        publicKey,
        contractId: CONSORTIUM_CONTRACT_ID,
        method: 'get_work_count',
      });

      const count = countVal ? Number(StellarSdk.scValToNative(countVal)) : 0;
      const owned: OwnedWork[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const shareVal = await stellar.simulateRead({
            publicKey,
            contractId: CONSORTIUM_CONTRACT_ID,
            method: 'get_share',
            args: [
              StellarSdk.nativeToScVal(i, { type: 'u32' }),
              StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
            ],
          });

          if (shareVal) {
            const share = Number(StellarSdk.scValToNative(shareVal));
            if (share > 0) {
              const workVal = await stellar.simulateRead({
                publicKey,
                contractId: CONSORTIUM_CONTRACT_ID,
                method: 'get_work',
                args: [StellarSdk.nativeToScVal(i, { type: 'u32' })],
              });

              if (workVal) {
                const work = StellarSdk.scValToNative(workVal);
                owned.push({
                  id: String(work.id || i),
                  title: String(work.title || `Work #${i}`),
                  fileHash: String(work.file_hash || ''),
                  myShare: share,
                  totalShares: Number(work.total_shares || 10000),
                  createdAt: work.created_at ? new Date(Number(work.created_at) * 1000).toLocaleDateString() : '',
                });
              }
            }
          }
        } catch {
          // Work doesn't exist or user has no share
        }
      }

      setWorks(owned);
    } catch {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleTransfer = useCallback(async () => {
    if (!transferModal || !transferTo || !transferAmount) return;
    setTransferring(true);
    try {
      const args = [
        StellarSdk.nativeToScVal(Number(transferModal.workId), { type: 'u32' }),
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(transferTo, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(transferAmount), { type: 'u32' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: CONSORTIUM_CONTRACT_ID,
        method: 'transfer_share',
        args,
      });

      toast.loading('Transferring research share…', { id: 'transfer-share' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Research share transferred!', { id: 'transfer-share' });
          setTransferModal(null);
          setTransferTo('');
          setTransferAmount('');
          loadPortfolio();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Transfer failed', { id: 'transfer-share' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  }, [transferModal, transferTo, transferAmount, publicKey, loadPortfolio]);

  return (
    <>
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="eyebrow mb-3">Institutional EHR Database</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          <span className="text-[rgb(var(--ink))]">Clinical Records</span> Portfolio
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          View all registered medical data structures where your institution holds clinical access rights. Transfer data rights to co-investigators.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">Connect your institutional wallet to view your portfolio.</p>
          </div>
        ) : loading ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <HiOutlineArrowPath className="h-6 w-6 animate-spin mx-auto mb-3" style={{ color: 'rgb(var(--brand))' }} />
            <p className="text-sm text-[rgb(var(--ink-muted))]">Querying ledger…</p>
          </div>
        ) : works.length === 0 ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <HiOutlineDocumentText className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgb(var(--ink-faint))' }} />
            <p className="font-semibold mb-1 text-[rgb(var(--ink-muted))]">No clinical records found.</p>
            <p className="text-xs" style={{ color: 'rgb(var(--ink-faint))' }}>Register a medical record or receive access rights to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {works.map((work) => (
              <div key={work.id} className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-5 transition-colors hover:border-[rgb(var(--ink-muted))]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[rgb(var(--ink))]">{work.title}</h3>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
                        style={{ background: 'rgb(var(--success) / 0.12)', color: 'rgb(var(--success))' }}>
                        Registered
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="eyebrow mb-1">Access Rights</p>
                        <p className="text-lg font-bold text-[rgb(var(--ink))]">{(work.myShare / 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="eyebrow mb-1">Clinical ID</p>
                        <p className="text-sm font-mono text-[rgb(var(--ink-muted))]">#{work.id}</p>
                      </div>
                    </div>
                    {work.fileHash && (
                      <div className="mt-3">
                        <p className="eyebrow mb-1">Document Hash</p>
                        <p className="text-xs font-mono truncate" style={{ color: 'rgb(var(--ink-faint))' }}>{work.fileHash}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setTransferModal({ workId: work.id, share: work.myShare })}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <HiOutlineArrowsRightLeft className="h-3.5 w-3.5" />
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal */}
        {transferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgb(0 0 0 / 0.7)', backdropFilter: 'blur(12px)' }}>
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--ink))]">Transfer Access Rights</h3>
              <p className="text-xs text-[rgb(var(--ink-muted))]">
                Record #{transferModal.workId} · Your current rights: {(transferModal.share / 100).toFixed(2)}%
              </p>

              <div>
                <label className="eyebrow mb-1.5 block">Recipient Stellar Public Key</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="G..."
                  className="input-field font-mono text-sm"
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">
                  Access Allocation (max {transferModal.share} bps)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 2500 = 25%"
                  className="input-field text-sm"
                  min="1"
                  max={transferModal.share}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleTransfer} disabled={transferring} className="btn-primary flex-1 text-sm">
                  {transferring ? 'Transferring…' : 'Confirm Transfer'}
                </button>
                <button onClick={() => setTransferModal(null)} className="btn-secondary flex-1 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
