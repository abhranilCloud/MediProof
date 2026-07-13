'use client';

import { useState, useCallback } from 'react';

import DropZone from '@/components/ui/DropZone';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { MED_RECORD_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import { HiOutlineMagnifyingGlass, HiOutlineArrowPath, HiArrowTopRightOnSquare } from 'react-icons/hi2';

interface VerifyResult {
  found: boolean;
  id?: string;
  creator?: string;
  title?: string;
  recordType?: string;
  timestamp?: string;
}

export default function VerifyPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleFileHashed = useCallback((hash: string) => {
    setFileHash(hash);
    setManualHash(hash);
    setResult(null);
  }, []);

  const handleVerify = useCallback(async () => {
    const hashToCheck = manualHash || fileHash;
    if (!isConnected || !hashToCheck) return;

    try {
      setVerifying(true);
      setResult(null);

      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(hashToCheck.substring(i * 2, i * 2 + 2), 16);
      }

      const args = [StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes))];

      const isRegVal = await stellar.simulateRead({
        publicKey,
        contractId: MED_RECORD_CONTRACT_ID,
        method: 'is_registered',
        args,
      });

      const registered = isRegVal ? StellarSdk.scValToNative(isRegVal) : false;

      if (registered) {
        const retval = await stellar.simulateRead({
          publicKey,
          contractId: MED_RECORD_CONTRACT_ID,
          method: 'verify',
          args,
        });

        if (retval) {
          const native = StellarSdk.scValToNative(retval);
          if (native && typeof native === 'object') {
            setResult({
              found: true,
              id: String(native.id || ''),
              creator: String(native.creator || ''),
              title: String(native.title || ''),
              recordType: String(native.description || native.record_type || ''),
              timestamp: native.timestamp
                ? new Date(Number(native.timestamp) * 1000).toLocaleString()
                : '',
            });
            return;
          }
        }
      }
      setResult({ found: false });
    } catch {
      setResult({ found: false });
    } finally {
      setVerifying(false);
    }
  }, [isConnected, publicKey, fileHash, manualHash]);

  const hashToDisplay = manualHash || fileHash;

  return (
    <>
      
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow mb-3">Clinical Data Integrity</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          Audit <span className="text-[rgb(var(--ink))]">Clinical Evidence</span>
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Re-hash any medical file or paste its SHA-256 fingerprint to check if it exists in the
          MediProof on-chain EHR registry.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">
              Connect your institutional wallet to audit documents.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Option A — Drop File */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <p className="eyebrow mb-4">Option A — Hash a Document</p>
              <DropZone onFileHashed={handleFileHashed} />
            </div>

            {/* Option B — Paste Hash */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <p className="eyebrow mb-4">Option B — Paste a Hash</p>
              <input
                id="verify-manual-hash"
                type="text"
                value={manualHash}
                onChange={(e) => { setManualHash(e.target.value); setResult(null); }}
                placeholder="Enter 64-character SHA-256 hex hash…"
                className="input-field font-mono text-sm"
              />
            </div>

            {/* Verify Button */}
            <button
              id="verify-submit-btn"
              onClick={handleVerify}
              disabled={verifying || (!hashToDisplay)}
              className="btn-primary w-full justify-center text-sm py-3 "
            >
              {verifying ? (
                <><HiOutlineArrowPath className="h-4 w-4 animate-spin" /> Auditing Ledger…</>
              ) : (
                <><HiOutlineMagnifyingGlass className="h-4 w-4" /> Audit On-Chain Evidence</>
              )}
            </button>

            {/* Result */}
            {result && (
              <div
                className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6"
                style={{
                  borderColor: result.found
                    ? 'rgb(var(--success) / 0.3)'
                    : 'rgb(var(--warn) / 0.3)',
                }}
              >
                {result.found ? (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: 'rgb(var(--success) / 0.15)', color: 'rgb(var(--success))' }}
                      >
                        ✓ Registered
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'rgb(var(--success))' }}>
                        Document found on-chain
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="eyebrow mb-1">Registration ID</p>
                        <p className="text-sm font-mono text-[rgb(var(--ink))]">#{result.id}</p>
                      </div>
                      <div>
                        <p className="eyebrow mb-1">Clinical Record ID</p>
                        <p className="text-sm text-[rgb(var(--ink))]">{result.title}</p>
                      </div>
                      {result.recordType && (
                        <div>
                          <p className="eyebrow mb-1">Classification</p>
                          <p className="text-sm text-[rgb(var(--ink-muted))]">{result.recordType}</p>
                        </div>
                      )}
                      <div>
                        <p className="eyebrow mb-1">Registered By (Stellar Public Key)</p>
                        <p className="text-xs font-mono break-all text-[rgb(var(--ink-muted))]">{result.creator}</p>
                      </div>
                      <div>
                        <p className="eyebrow mb-1">Timestamp</p>
                        <p className="text-sm text-[rgb(var(--ink-muted))]">{result.timestamp}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-lg font-semibold mb-2" style={{ color: 'rgb(var(--warn))' }}>✗ Not Found</p>
                    <p className="text-sm text-[rgb(var(--ink-muted))]">
                      This document hash has not been registered on the MediProof registry.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
