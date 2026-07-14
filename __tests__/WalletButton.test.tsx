import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WalletButton from '@/components/wallet/WalletButton';
import * as useWalletModule from '@/hooks/useWallet';

// Mock the useWallet hook
vi.mock('@/hooks/useWallet', () => ({
  useWallet: vi.fn(),
}));

describe('WalletButton', () => {
  it('renders connect button when not connected', () => {
    vi.mocked(useWalletModule.useWallet).mockReturnValue({
      publicKey: null,
      balance: null,
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<WalletButton />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  it('renders address when connected', () => {
    vi.mocked(useWalletModule.useWallet).mockReturnValue({
      publicKey: 'GABC1234567890',
      balance: '100',
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<WalletButton />);
    expect(screen.getByText('GABC12...7890')).toBeInTheDocument();
  });
});
