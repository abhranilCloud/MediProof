'use client';

import { useState, useCallback } from 'react';

import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { DATA_ACCESS_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlinePlusCircle, HiOutlineKey, HiArrowTopRightOnSquare } from 'react-icons/hi2';

const ACCESS_TYPES = [
  { value: 0, label: 'Open Access',          desc: 'Freely accessible with attribution' },
  { value: 1, label: 'Restricted Research',  desc: 'Approved research institutions only' },
  { value: 2, label: 'Commercial',           desc: 'Licensed for commercial use' },
  { value: 3, label: 'Custom',               desc: 'Custom terms defined by the owner' },
];

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function LicensesPage() {
  const { publicKey, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'grant'>('create');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const [workId, setWorkId] = useState('');
  const [accessType, setAccessType] = useState(0);
  const [termsHash, setTermsHash] = useState('');
  const [txHash, setTxHash] = useState('');

  const [grantLicenseId, setGrantLicenseId] = useState('');
  const [grantAddress, setGrantAddress] = useState('');
  const [granting, setGranting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!isConnected || !workId) return;
    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      if (termsHash) {
        for (let i = 0; i < 32; i++) {
          hashBytes[i] = parseInt(termsHash.substring(i * 2, i * 2 + 2), 16) || 0;
        }
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(workId), { type: 'u32' }),
        StellarSdk.nativeToScVal(accessType, { type: 'u32' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: DATA_ACCESS_CONTRACT_ID,
        method: 'create_license',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Creating data access agreement…', { id: 'license' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Data access agreement created!', { id: 'license' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Creation failed.', { id: 'license' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Failed', { id: 'license' });
    }
  }, [isConnected, publicKey, workId, accessType, termsHash]);

  const handleGrant = useCallback(async () => {
    if (!isConnected || !grantLicenseId || !grantAddress) return;
    try {
      setGranting(true);
      const args = [
        StellarSdk.nativeToScVal(Number(grantLicenseId), { type: 'u32' }),
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(grantAddress, { type: 'address' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: DATA_ACCESS_CONTRACT_ID,
        method: 'grant_access',
        args,
      });

      toast.loading('Granting data access…', { id: 'grant' });
      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Access granted!', { id: 'grant' });
          setGrantAddress('');
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Grant failed.', { id: 'grant' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Grant failed');
    } finally {
      setGranting(false);
    }
  }, [isConnected, publicKey, grantLicenseId, grantAddress]);

  const busy = txStatus === 'signing' || txStatus === 'polling';

  return (
    <>
      
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="eyebrow mb-3">Institutional Access</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[rgb(var(--ink))]">
          <span className="text-[rgb(var(--ink))]">Data Sharing</span> Agreements
        </h1>
        <p className="text-sm mb-10 text-[rgb(var(--ink-muted))]">
          Define on-chain data access protocols for your EHR payloads.
          Grant or revoke cryptographic keys to verified institutions and clinical researchers.
        </p>

        {!isConnected ? (
          <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-10 text-center">
            <div className="text-4xl mb-4">⚕</div>
            <p className="font-semibold mb-1 text-[rgb(var(--ink))]">Authentication Required</p>
            <p className="text-sm text-[rgb(var(--ink-muted))]">Connect your institutional wallet to configure access agreements.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { key: 'create', label: 'Configure Agreement' },
                { key: 'grant',  label: 'Provision Access' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as 'create' | 'grant')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === key ? 'rgb(var(--brand) / 0.12)' : 'transparent',
                    color: activeTab === key ? 'rgb(var(--brand))' : 'rgb(var(--ink-muted))',
                    border: `1px solid ${activeTab === key ? 'rgb(var(--brand) / 0.25)' : 'transparent'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'create' ? (
              <div className="space-y-5">
                {/* Access Type Selector */}
                <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6">
                  <p className="eyebrow mb-4">Access Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCESS_TYPES.map((at) => (
                      <button
                        key={at.value}
                        onClick={() => setAccessType(at.value)}
                        className="rounded-xl p-4 text-left transition-all transition-colors hover:border-[rgb(var(--ink-muted))]"
                        style={{
                          background: accessType === at.value ? 'rgb(var(--brand) / 0.12)' : 'rgb(var(--elevated) / 0.5)',
                          border: `1px solid ${accessType === at.value ? 'rgb(var(--brand) / 0.4)' : 'rgb(var(--hairline))'}`,
                          color: accessType === at.value ? 'rgb(var(--brand))' : 'rgb(var(--ink-muted))',
                        }}
                      >
                        <p className="font-semibold text-sm">{at.label}</p>
                        <p className="text-xs mt-1" style={{ color: 'rgb(var(--ink-faint))' }}>{at.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Record ID + Terms */}
                <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-4">
                  <div>
                    <label className="eyebrow mb-1.5 block">Clinical Record ID *</label>
                    <input
                      id="license-work-id"
                      type="number"
                      value={workId}
                      onChange={(e) => setWorkId(e.target.value)}
                      placeholder="Registry ID of the EHR data"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="eyebrow mb-1.5 block">Protocol Terms Hash (optional)</label>
                    <input
                      type="text"
                      value={termsHash}
                      onChange={(e) => setTermsHash(e.target.value)}
                      placeholder="SHA-256 hash of your institutional data-sharing terms"
                      className="input-field font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  id="license-create-btn"
                  onClick={handleCreate}
                  disabled={!workId || busy}
                  className="btn-primary w-full justify-center text-sm py-3 "
                >
                  {busy ? (
                    <><HiOutlineArrowPath className="h-4 w-4 animate-spin" />{txStatus === 'signing' ? 'Signing…' : 'Configuring…'}</>
                  ) : (
                    <><HiOutlinePlusCircle className="h-4 w-4" /> Configure Protocol</>
                  )}
                </button>

                {txStatus === 'success' && txHash && (
                  <div className="rounded-none border border-green-900/50 bg-[rgb(var(--surface))] p-5">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--success))' }}>✓ Protocol Configured</h3>
                    <div>
                      <p className="eyebrow mb-1">Transaction</p>
                      <a href={stellar.getExplorerLink(txHash)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-mono break-all" style={{ color: 'rgb(var(--brand))' }}>
                        {txHash} <HiArrowTopRightOnSquare className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-none border border-[rgb(var(--hairline))] bg-[rgb(var(--surface))] p-6 space-y-4">
                <p className="eyebrow mb-2">Provision Data Access</p>

                <div>
                  <label className="eyebrow mb-1.5 block">Protocol Agreement ID</label>
                  <input
                    type="number"
                    value={grantLicenseId}
                    onChange={(e) => setGrantLicenseId(e.target.value)}
                    placeholder="Agreement ID"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="eyebrow mb-1.5 block">Institution / Researcher Stellar Address</label>
                  <input
                    type="text"
                    value={grantAddress}
                    onChange={(e) => setGrantAddress(e.target.value)}
                    placeholder="G... Stellar wallet address"
                    className="input-field font-mono text-sm"
                  />
                </div>

                <button
                  id="license-grant-btn"
                  onClick={handleGrant}
                  disabled={granting || !grantLicenseId || !grantAddress}
                  className="btn-primary w-full justify-center text-sm py-3 "
                >
                  <HiOutlineKey className="h-4 w-4" />
                  {granting ? 'Provisioning…' : 'Provision Secure Access'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
