'use client';

import { useState, useEffect, useCallback } from 'react';

import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { DATA_ACCESS_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineScale, HiOutlineArrowPath, HiOutlineHandRaised, HiArrowTopRightOnSquare } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

interface Dispute {
  id: number;
  plaintiff: string;
  defendant: string;
  workId: number;
  yesVotes: number;
  noVotes: number;
  status: number; // 0 = Active, 1 = Upheld, 2 = Dismissed
  endTime: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Active',
  1: 'Upheld',
  2: 'Dismissed',
};

export default function DisputesPage() {
  const { publicKey, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'file' | 'vote' | 'history'>('file');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);

  // File dispute form
  const [defendant, setDefendant] = useState('');
  const [disputeWorkId, setDisputeWorkId] = useState('');
  const [evidenceHash, setEvidenceHash] = useState('');
  const [txHash, setTxHash] = useState('');

  // Vote form
  const [voteDisputeId, setVoteDisputeId] = useState('');
  const [voteCount, setVoteCount] = useState('');
  const [supportPlaintiff, setSupportPlaintiff] = useState(true);
  const [voting, setVoting] = useState(false);

  const quadraticCost = voteCount ? Number(voteCount) * Number(voteCount) : 0;

  const loadDisputes = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const countVal = await stellar.simulateRead({
        publicKey,
        contractId: DATA_ACCESS_CONTRACT_ID,
        method: 'get_dispute_count',
      });

      const count = countVal ? Number(StellarSdk.scValToNative(countVal)) : 0;
      const items: Dispute[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const val = await stellar.simulateRead({
            publicKey,
            contractId: DATA_ACCESS_CONTRACT_ID,
            method: 'get_dispute',
            args: [StellarSdk.nativeToScVal(i, { type: 'u32' })],
          });
          if (val) {
            const d = StellarSdk.scValToNative(val);
            items.push({
              id: Number(d.id || i),
              plaintiff: String(d.plaintiff || ''),
              defendant: String(d.defendant || ''),
              workId: Number(d.work_id || 0),
              yesVotes: Number(d.yes_votes || 0),
              noVotes: Number(d.no_votes || 0),
              status: Number(d.status || 0),
              endTime: Number(d.end_time || 0),
            });
          }
        } catch {
          // dispute doesn't exist
        }
      }

      setDisputes(items);
    } catch {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleFileDispute = useCallback(async () => {
    if (!isConnected || !defendant || !disputeWorkId) return;

    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      if (evidenceHash) {
        for (let i = 0; i < 32; i++) {
          hashBytes[i] = parseInt(evidenceHash.substring(i * 2, i * 2 + 2), 16) || 0;
        }
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(defendant, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(disputeWorkId), { type: 'u32' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: DATA_ACCESS_CONTRACT_ID,
        method: 'file_dispute',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Filing dispute…', { id: 'dispute' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Dispute filed!', { id: 'dispute' });
          loadDisputes();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Dispute filing failed.', { id: 'dispute' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Failed', { id: 'dispute' });
    }
  }, [isConnected, publicKey, defendant, disputeWorkId, evidenceHash, loadDisputes]);

  const handleVote = useCallback(async () => {
    if (!isConnected || !voteDisputeId || !voteCount) return;

    try {
      setVoting(true);

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(voteDisputeId), { type: 'u32' }),
        StellarSdk.nativeToScVal(BigInt(voteCount), { type: 'i128' }),
        StellarSdk.nativeToScVal(supportPlaintiff),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: DATA_ACCESS_CONTRACT_ID,
        method: 'vote_dispute',
        args,
      });

      toast.loading('Casting quadratic vote…', { id: 'vote' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Vote cast!', { id: 'vote' });
          loadDisputes();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Vote failed.', { id: 'vote' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setVoting(false);
    }
  }, [isConnected, publicKey, voteDisputeId, voteCount, supportPlaintiff, loadDisputes]);

  return (
    <>
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="eyebrow mb-3">Clinical Data Integrity</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          <span className="text-[rgb(var(--ink))]">Clinical Peer Review</span> Cases
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Flag questionable clinical evidence, submit cryptographic proof, and resolve data integrity challenges through
          institutional Quadratic Voting (cost = votes²).
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">Connect your institutional wallet to participate in peer review.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { id: 'file',    label: 'Open Review Case' },
                { id: 'vote',    label: 'Cast Review Vote' },
                { id: 'history', label: 'Case History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'file' | 'vote' | 'history')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'rgb(var(--brand) / 0.12)' : 'transparent',
                    color: activeTab === tab.id ? 'rgb(var(--brand))' : 'rgb(var(--ink-muted))',
                    border: `1px solid ${activeTab === tab.id ? 'rgb(var(--brand) / 0.25)' : 'transparent'}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* File Dispute */}
            {activeTab === 'file' && (
              <div className="space-y-5">
                <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-4">
                  <p className="eyebrow mb-2">Open a Clinical Data Challenge</p>

                  <div>
                    <label className="eyebrow mb-1.5 block">Submitting Researcher Address *</label>
                    <input
                      type="text"
                      value={defendant}
                      onChange={(e) => setDefendant(e.target.value)}
                      placeholder="G... address of the data submitter"
                      className="input-field font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="eyebrow mb-1.5 block">Clinical Record ID *</label>
                    <input
                      type="number"
                      value={disputeWorkId}
                      onChange={(e) => setDisputeWorkId(e.target.value)}
                      placeholder="Registry ID of the challenged medical record"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="eyebrow mb-1.5 block">Rebuttal Evidence Hash</label>
                    <input
                      type="text"
                      value={evidenceHash}
                      onChange={(e) => setEvidenceHash(e.target.value)}
                      placeholder="SHA-256 hash of your counter-evidence file"
                      className="input-field font-mono text-xs"
                    />
                    <p className="text-xs mt-1.5" style={{ color: 'rgb(var(--ink-faint))' }}>
                      Hash your evidence file using the Register page first
                    </p>
                  </div>

                  <button
                    id="dispute-file-btn"
                    onClick={handleFileDispute}
                    disabled={!defendant || !disputeWorkId || txStatus === 'signing' || txStatus === 'polling'}
                    className="btn-primary w-full justify-center text-sm py-3 "
                  >
                    {txStatus === 'signing' || txStatus === 'polling' ? (
                      <><HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                        {txStatus === 'signing' ? 'Signing…' : 'Submitting Challenge…'}
                      </>
                    ) : (
                      <><HiOutlineScale className="h-4 w-4" /> Open Peer Review Challenge</>
                    )}
                  </button>

                  {txStatus === 'success' && txHash && (
                    <div className="rounded-none border border-green-900/50 bg-[rgb(var(--surface))] p-4 mt-2">
                      <h3 className="text-sm font-semibold mb-2" style={{ color: 'rgb(var(--success))' }}>✓ Peer Review Case Opened</h3>
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
                  )}
                </div>
              </div>
            )}

            {/* Vote */}
            {activeTab === 'vote' && (
              <div className="space-y-5">
                <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-4">
                  <p className="eyebrow mb-2">Cast a Peer Review Vote</p>

                  <div>
                    <label className="eyebrow mb-1.5 block">Review Case ID</label>
                    <input
                      type="number"
                      value={voteDisputeId}
                      onChange={(e) => setVoteDisputeId(e.target.value)}
                      placeholder="Case ID to vote on"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="eyebrow mb-1.5 block">Number of Votes</label>
                    <input
                      type="number"
                      value={voteCount}
                      onChange={(e) => setVoteCount(e.target.value)}
                      placeholder="e.g. 5"
                      className="input-field text-sm"
                      min="1"
                    />
                  </div>

                  {/* Quadratic Cost Calculator */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgb(var(--elevated) / 0.6)', border: '1px solid rgb(var(--brand) / 0.15)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow">Quadratic Cost Formula</span>
                      <span className="font-mono text-xs" style={{ color: 'rgb(var(--ink-faint))' }}>cost = votes²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(var(--ink-muted))]">
                        {voteCount || '0'} votes × {voteCount || '0'}
                      </span>
                      <span className="text-lg font-bold text-[rgb(var(--ink))]">
                        = {quadraticCost} tokens
                      </span>
                    </div>
                  </div>

                  {/* Vote Direction */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSupportPlaintiff(true)}
                      className="flex-1 rounded-xl p-4 text-center transition-all transition-colors hover:border-[rgb(var(--ink-muted))]"
                      style={{
                        background: supportPlaintiff ? 'rgb(var(--success) / 0.15)' : 'rgb(var(--elevated) / 0.5)',
                        border: `1px solid ${supportPlaintiff ? 'rgb(var(--success) / 0.4)' : 'rgb(var(--hairline))'}`,
                        color: supportPlaintiff ? 'rgb(var(--success))' : 'rgb(var(--ink-muted))',
                      }}
                    >
                      <p className="font-semibold text-sm">Support Reviewer</p>
                      <p className="text-xs mt-1 opacity-70">Uphold the data challenge</p>
                    </button>
                    <button
                      onClick={() => setSupportPlaintiff(false)}
                      className="flex-1 rounded-xl p-4 text-center transition-all transition-colors hover:border-[rgb(var(--ink-muted))]"
                      style={{
                        background: !supportPlaintiff ? 'rgb(var(--danger) / 0.15)' : 'rgb(var(--elevated) / 0.5)',
                        border: `1px solid ${!supportPlaintiff ? 'rgb(var(--danger) / 0.4)' : 'rgb(var(--hairline))'}`,
                        color: !supportPlaintiff ? 'rgb(var(--danger))' : 'rgb(var(--ink-muted))',
                      }}
                    >
                      <p className="font-semibold text-sm">Defend Submitter</p>
                      <p className="text-xs mt-1 opacity-70">Dismiss the challenge</p>
                    </button>
                  </div>

                  <button
                    id="dispute-vote-btn"
                    onClick={handleVote}
                    disabled={voting || !voteDisputeId || !voteCount}
                    className="btn-primary w-full justify-center text-sm py-3 "
                  >
                    {voting ? (
                      <><HiOutlineArrowPath className="h-4 w-4 animate-spin" /> Voting…</>
                    ) : (
                      <><HiOutlineHandRaised className="h-4 w-4" />
                        Cast {voteCount || '0'} Votes ({quadraticCost} tokens)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
                    <HiOutlineArrowPath className="h-6 w-6 animate-spin mx-auto mb-3" style={{ color: 'rgb(var(--brand))' }} />
                    <p className="text-sm text-[rgb(var(--ink-muted))]">Loading review cases…</p>
                  </div>
                ) : disputes.length === 0 ? (
                  <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
                    <HiOutlineScale className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgb(var(--ink-faint))' }} />
                    <p className="text-[rgb(var(--ink-muted))]">No peer review challenges have been filed yet.</p>
                  </div>
                ) : (
                  disputes.map((d) => (
                    <div key={d.id} className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-5 transition-colors hover:border-[rgb(var(--ink-muted))]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[rgb(var(--ink))]">Case #{d.id}</span>
                        <span
                          className="rounded-full px-3 py-0.5 text-xs font-semibold"
                          style={{
                            background: d.status === 0 ? 'rgb(var(--brand) / 0.12)' : d.status === 1 ? 'rgb(var(--success) / 0.12)' : 'rgb(var(--ink-faint) / 0.12)',
                            color: d.status === 0 ? 'rgb(var(--brand))' : d.status === 1 ? 'rgb(var(--success))' : 'rgb(var(--ink-muted))',
                          }}
                        >
                          {STATUS_LABELS[d.status] || 'Active'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="eyebrow mb-1">Reviewer (Challenger)</p>
                          <p className="text-xs font-mono truncate text-[rgb(var(--ink-muted))]">{d.plaintiff}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Submitter</p>
                          <p className="text-xs font-mono truncate text-[rgb(var(--ink-muted))]">{d.defendant}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Clinical Record ID</p>
                          <p className="text-xs text-[rgb(var(--ink))]">#{d.workId}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Votes</p>
                          <p className="text-xs">
                            <span style={{ color: 'rgb(var(--success))' }}>✓ {d.yesVotes}</span>
                            <span className="mx-1" style={{ color: 'rgb(var(--hairline))' }}>|</span>
                            <span style={{ color: 'rgb(var(--danger))' }}>✗ {d.noVotes}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
