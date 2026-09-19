'use client';

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, LogOut, Flame } from 'lucide-react';

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

  // Generate a fun placeholder name if they don't have an ENS name
  const generateUsername = (addr: string) => {
    const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Based', 'Chill', 'Hype'];
    const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru'];
    
    // Use part of address to deterministically pick words
    const num1 = parseInt(addr.slice(2, 4), 16) % adjectives.length;
    const num2 = parseInt(addr.slice(4, 6), 16) % nouns.length;
    
    return `${adjectives[num1]}${nouns[num2]}_${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    const displayName = ensName ? ensName : generateUsername(address);
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-[#eee7dc] shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800">
          <div className="w-5 h-5 rounded-full p-[1px] season-story-ring flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Flame size={10} className="text-primary fill-primary" />
            </div>
          </div>
          <span className="truncate max-w-[100px] sm:max-w-none">{displayName}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-neutral-400 hover:text-neutral-700 bg-white border border-[#eee7dc] rounded-full p-1.5 shadow-sm transition-colors cursor-pointer"
          title="Disconnect Wallet"
        >
          <LogOut size={14} />
        </button>
      </div>

    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() => connect({ connector: metaMaskConnector })}
      className={`bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-50 ${className}`}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
      {showIcon && !isPending && <ArrowRight size={16} />}
    </button>
  );
}

