'use client';

import { useState, useCallback } from 'react';

import DropZone from '@/components/ui/DropZone';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { MED_RECORD_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlineFingerPrint, HiArrowTopRightOnSquare } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

const RECORD_TYPES = [
  'Lab Report',
  'MRI / CT Scan',
  'Clinical Note',
  'Prescription',
  'Pathology Report',
  'Research Paper',
  'Patient Summary',
  'Other',
];

export default function RegisterPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('Lab Report');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const handleFileHashed = useCallback((hash: string, name: string) => {
    setFileHash(hash);
    setFileName(name);
  }, []);

  const handleRegister = useCallback(async () => {
    if (!isConnected || !fileHash || !title) return;

    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(fileHash.substring(i * 2, i * 2 + 2), 16);
      }

      // Pre-check for duplicate
      const isRegVal = await stellar.simulateRead({
        publicKey,
        contractId: MED_RECORD_CONTRACT_ID,
        method: 'is_registered',
        args: [StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes))],
      });
      const registered = isRegVal ? StellarSdk.scValToNative(isRegVal) : false;
      if (registered) {
        throw new Error('This document has already been registered on-chain.');
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
        StellarSdk.nativeToScVal(title, { type: 'string' }),
        StellarSdk.nativeToScVal(recordType, { type: 'string' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: MED_RECORD_CONTRACT_ID,
        method: 'register',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Registering on-chain…', { id: 'register' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          setRegistrationId(result.returnValue || null);
          toast.success('Medical record registered on-chain!', { id: 'register' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Registration failed.', { id: 'register' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Registration failed', { id: 'register' });
    }
  }, [isConnected, publicKey, fileHash, title, recordType]);

  const busy = txStatus === 'signing' || txStatus === 'polling';

  return (
    <>
      
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <p className="eyebrow mb-3">Clinical Data Registry</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          Register a <span className="text-[rgb(var(--ink))]">Cryptographic Proof</span>
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Generate a client-side SHA-256 fingerprint for your clinical record. Patient data never leaves the browser environment.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">
              Authentication Required
            </p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">
              Connect your institutional wallet to register records.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Step 1 — File Hash */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
              <p className="eyebrow mb-4">01 — Client-Side Proof Generation</p>
              <DropZone onFileHashed={handleFileHashed} disabled={busy} />
              {fileHash && (
                <div className="mt-4 rounded-lg p-3" style={{ background: 'rgb(var(--canvas))', border: '1px solid rgb(var(--hairline))' }}>
                  <p className="eyebrow mb-1">SHA-256 Hash</p>
                  <p className="text-xs font-mono break-all" style={{ color: 'rgb(var(--brand))' }}>{fileHash}</p>
                </div>
              )}
            </div>

            {/* Step 2 — Metadata */}
            <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-4">
              <p className="eyebrow mb-2">02 — Clinical Metadata</p>

              <div>
                <label className="eyebrow mb-1.5 block uppercase">Clinical Record ID (Pseudonymous) *</label>
                <input
                  id="register-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Patient Blood Panel — 2026-07-15"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block uppercase">Record Classification</label>
                <select
                  id="register-type"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="input-field text-sm"
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              onClick={handleRegister}
              disabled={!fileHash || !title || busy}
              className="btn-primary w-full justify-center text-sm py-3 "
            >
              {busy ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Registering…'}
                </>
              ) : (
                <>
                  <HiOutlineFingerPrint className="h-4 w-4" />
                  Submit Proof to Ledger
                </>
              )}
            </button>

            {/* Success */}
            {txStatus === 'success' && txHash && (
              <div className="rounded-none border border-green-900/50 bg-[rgb(var(--surface))] p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgb(var(--success))' }}>
                  ✓ Cryptographic Proof Registered On-Chain
                </h3>
                <div className="space-y-3">
                  {registrationId && (
                    <div>
                      <p className="eyebrow mb-1">Registration ID</p>
                      <p className="text-sm font-mono text-[rgb(var(--ink))]">#{registrationId}</p>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-1">Document Name</p>
                    <p className="text-sm text-[rgb(var(--ink-muted))]">{fileName}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Classification</p>
                    <p className="text-sm text-[rgb(var(--ink-muted))]">{recordType}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">SHA-256 Hash</p>
                    <p className="text-xs font-mono break-all" style={{ color: 'rgb(var(--ink-faint))' }}>{fileHash}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Transaction</p>
                    <a
                      href={stellar.getExplorerLink(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-mono break-all transition-colors hover:border-[rgb(var(--ink-muted))]"
                      style={{ color: 'rgb(var(--brand))' }}
                    >
                      {txHash}
                      <HiArrowTopRightOnSquare className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Failed */}
            {txStatus === 'failed' && (
              <div className="rounded-none border border-red-900/50 bg-[rgb(var(--surface))] p-5 text-center">
                <p className="text-sm" style={{ color: 'rgb(var(--danger))' }}>
                  Registration failed. Please try again.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
