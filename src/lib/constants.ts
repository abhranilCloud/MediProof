export const STELLAR_RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const EXPLORER_BASE_URL = 'https://stellar.expert/explorer/testnet';

/* ── MediProof Contract IDs (Testnet) ── */
/* Update these after deploying new contracts with: stellar contract deploy */

export const MED_RECORD_CONTRACT_ID = import.meta.env.VITE_MED_RECORD_CONTRACT_ID || '';

export const CONSORTIUM_CONTRACT_ID = import.meta.env.VITE_CONSORTIUM_CONTRACT_ID || '';

export const DATA_ACCESS_CONTRACT_ID = import.meta.env.VITE_DATA_ACCESS_CONTRACT_ID || '';
