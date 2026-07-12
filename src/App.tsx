import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import WalletButton from './components/wallet/WalletButton';
import { useWallet } from './hooks/useWallet';
import { stellarService } from './lib/stellar';

export default function App() {
  const { isConnected, publicKey, balance } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) return toast.error('Please connect your wallet first.');
    if (!recipient || !amount) return toast.error('Please fill in both fields.');

    setLoading(true);
    setTxHash('');
    try {
      const { hash } = await stellarService.sendXlmTransaction(publicKey, recipient, amount);
      setTxHash(hash);
      toast.success('Transaction successful!');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">Stellar Pay</h1>
        <WalletButton />
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto mt-16 p-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-2">Send XLM</h2>
          <p className="text-gray-400 text-sm mb-8">
            Transfer testnet XLM to any Stellar address instantly.
          </p>

          {!isConnected ? (
            <div className="text-center py-10 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-4">You need to connect your wallet to send funds.</p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Your Balance
                </label>
                <div className="text-lg font-mono bg-gray-900 px-4 py-3 rounded-lg border border-gray-700">
                  {balance} <span className="text-blue-400">XLM</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  placeholder="G..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Amount (XLM)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-4"
              >
                {loading ? 'Sending...' : 'Send Payment'}
              </button>

              {txHash && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-800 rounded-lg">
                  <p className="text-green-400 text-sm font-semibold mb-1">Transaction Successful!</p>
                  <p className="text-xs text-gray-400 break-all">
                    Hash: <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{txHash}</a>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
