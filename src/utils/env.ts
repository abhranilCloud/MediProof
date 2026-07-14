export const ENV = {
  NETWORK: import.meta.env.VITE_NETWORK || 'testnet',
  RPC_URL: import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org',
  REGISTRY_CONTRACT_ID: import.meta.env.VITE_REGISTRY_CONTRACT_ID || '',
  DAO_CONTRACT_ID: import.meta.env.VITE_DAO_CONTRACT_ID || '',
};

export const requireEnv = (key: keyof typeof ENV) => {
  const value = ENV[key];
  if (!value) {
    console.warn(`Environment variable for ${key} is missing or empty!`);
  }
  return value;
};
