'use client';

import { useState, useCallback } from 'react';

import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlinePaperAirplane, HiArrowTopRightOnSquare } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function TransferPage() {
  const { publicKey, isConnected, balance } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const handleSend = useCallback(async () => {
    if (!isConnected || !recipient || !amount) return;
    try {
      setTxStatus('signing');
      const { hash } = await stellar.sendXlmTransaction(publicKey, recipient, amount);
      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Confirming transaction…', { id: 'tx' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Transfer successful!', { id: 'tx' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Transfer failed.', { id: 'tx' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Transfer failed', { id: 'tx' });
    }
  }, [isConnected, publicKey, recipient, amount]);

  const busy = txStatus === 'signing' || txStatus === 'polling';

  return (
    <>
      
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="eyebrow mb-3">Institutional Treasury</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          Treasury <span className="text-[rgb(var(--ink))]">XLM Transfers</span>
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Transfer native XLM to any Stellar address — for clinical trial disbursements, research grants,
          or institutional data access fees on the network.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">Connect your institutional wallet to disburse funds.</p>
          </div>
        ) : (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-5">
            {/* From */}
            <div>
              <label className="eyebrow mb-1.5 block">From</label>
              <div
                className="input-field text-xs font-mono truncate"
                style={{ color: 'rgb(var(--ink-faint))', background: 'rgb(var(--canvas))' }}
              >
                {publicKey}
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'rgb(var(--ink-faint))' }}>
                Balance: <span className="text-[rgb(var(--ink))] font-semibold">{balance} XLM</span>
              </p>
            </div>

            {/* Recipient */}
            <div>
              <label className="eyebrow mb-1.5 block">Recipient / Grantee Address</label>
              <input
                id="transfer-recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="G... Stellar address"
                className="input-field font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="eyebrow mb-1.5 block">Amount (XLM)</label>
              <input
                id="transfer-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field text-sm"
                min="0"
                step="0.01"
              />
            </div>

            {/* Send Button */}
            <button
              id="transfer-send-btn"
              onClick={handleSend}
              disabled={busy || !recipient || !amount}
              className="btn-primary w-full justify-center text-sm py-3 "
            >
              {busy ? (
                <><HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Confirming…'}
                </>
              ) : (
                <><HiOutlinePaperAirplane className="h-4 w-4" /> Disburse XLM Funds</>
              )}
            </button>

            {/* Result */}
            {txHash && (
              <div
                className="rounded-lg p-4"
                style={{ background: 'rgb(var(--elevated) / 0.6)', border: '1px solid rgb(var(--hairline))' }}
              >
                <p className="eyebrow mb-1.5">Transaction Hash</p>
                <a
                  href={stellar.getExplorerLink(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono break-all"
                  style={{ color: 'rgb(var(--brand))' }}
                >
                  {txHash}
                  <HiArrowTopRightOnSquare className="h-3 w-3 shrink-0" />
                </a>
                <p
                  className="text-xs mt-2 font-semibold"
                  style={{
                    color: txStatus === 'success'
                      ? 'rgb(var(--success))'
                      : txStatus === 'failed'
                      ? 'rgb(var(--danger))'
                      : 'rgb(var(--warn))',
                  }}
                >
                  Status: {txStatus.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
