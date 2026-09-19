'use client';

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, LogOut } from 'lucide-react';

interface WalletButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function WalletButton({ className = "", showIcon = true }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  // If connected and on the landing page, automatically push to /home
  useEffect(() => {
    if (isConnected && pathname === '/') {
      router.push('/home');
    }
  }, [isConnected, router, pathname]);

  // We use the first injected connector (MetaMask)
  const metaMaskConnector = connectors.find((c) => c.id === 'injected' || c.name.toLowerCase().includes('metamask')) || connectors[0];

  if (isConnected && address) {
    const displayName = ensName ? ensName : `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    return (
      <div className="flex items-center gap-4">
        <div className="bg-card border border-border px-4 py-2 rounded-lg font-mono text-sm">
          {displayName}
        </div>
        <button
          onClick={() => disconnect()}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
          title="Disconnect Wallet"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() => connect({ connector: metaMaskConnector })}
      className={`bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.3)] disabled:opacity-50 disabled:hover:scale-100 ${className}`}
    >
      {isPending ? 'Connecting...' : 'Connect MetaMask to Enter'}
      {showIcon && !isPending && <ArrowRight size={20} />}
    </button>
  );
}
