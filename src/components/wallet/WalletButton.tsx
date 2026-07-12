import { useWallet } from '@/hooks/useWallet';

export default function WalletButton() {
  const { isConnected, connect, publicKey, balance } = useWallet();

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold text-[rgb(var(--brand))]">
            {balance} XLM
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--ink-muted))]">
            Testnet
          </span>
        </div>
        <button
          className="flex h-9 items-center justify-center rounded-sm bg-[rgb(var(--elevated))] border border-[rgb(var(--hairline))] px-3 text-sm font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--hairline))]"
          onClick={() => {
            // Optional: Implement disconnect logic if the wallet supports it
          }}
        >
          {`${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect()}
      className="btn-primary h-9 px-4"
    >
      Connect Wallet
    </button>
  );
}
