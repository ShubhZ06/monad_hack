'use client';

import { useAccount, useConnect, useDisconnect, useEnsName, useChainId, useSwitchChain } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, LogOut, Flame, Loader2 } from 'lucide-react';
import { monadTestnet } from '@/lib/monad/config';
import { MobileWalletModal } from '@/components/MobileWalletModal';

interface WalletButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function WalletButton({ className = "", showIcon = true }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connectAsync, connectors, isPending: wagmiPending, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const router = useRouter();
  const pathname = usePathname();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  // If connected and on the landing page, automatically push to /home
  useEffect(() => {
    if (isConnected && pathname === '/') {
      router.push('/home');
    }
  }, [isConnected, router, pathname]);

  // If connected but on wrong chain, prompt switch to Monad Testnet
  useEffect(() => {
    if (isConnected && chainId && chainId !== monadTestnet.id && switchChainAsync) {
      switchChainAsync({ chainId: monadTestnet.id }).catch((e) => {
        console.warn('Monad testnet switch dismissed:', e);
      });
    }
  }, [isConnected, chainId, switchChainAsync]);

  // Safety timer to prevent button from ever getting stuck in connecting state
  useEffect(() => {
    if (isConnecting || wagmiPending) {
      const timer = setTimeout(() => {
        setIsConnecting(false);
        reset();
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isConnecting, wagmiPending, reset]);

  // Generate a fun placeholder name if they don't have an ENS name
  const generateUsername = (addr: string) => {
    const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Chill', 'Hype'];
    const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru'];
    
    const num1 = parseInt(addr.slice(2, 4), 16) % adjectives.length;
    const num2 = parseInt(addr.slice(4, 6), 16) % nouns.length;
    
    return `${adjectives[num1]}${nouns[num2]}_${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    const hasInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum);
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // If on mobile browser without injected provider (Safari / Chrome)
    if (isMobile && !hasInjected) {
      setShowMobileModal(true);
      // Attempt to invoke the MetaMask mobile deep link directly
      const cleanDappUrl = `${window.location.host}${window.location.pathname}${window.location.search}`;
      try {
        window.location.href = `https://metamask.app.link/dapp/${cleanDappUrl}`;
      } catch (err) {
        console.warn("Deep link trigger notice:", err);
      }
      return;
    }

    // If on desktop without injected provider (browser without MetaMask)
    if (!hasInjected) {
      setShowMobileModal(true);
      return;
    }

    // Provider is present (Desktop extension or inside MetaMask in-app browser)
    setIsConnecting(true);
    try {
      const metaMaskConnector = connectors.find(
        (c) => c.id === 'injected' || c.name.toLowerCase().includes('metamask')
      ) || connectors[0];

      if (!metaMaskConnector) {
        setShowMobileModal(true);
        return;
      }

      await connectAsync({
        connector: metaMaskConnector,
        chainId: monadTestnet.id,
      });
    } catch (err: any) {
      console.warn('Wallet connection cancelled or failed:', err?.message || err);
      reset();
    } finally {
      setIsConnecting(false);
    }
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

  const pending = isConnecting || wagmiPending;

  return (
    <>
      <button
        disabled={pending}
        onClick={handleConnect}
        className={`bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-75 cursor-pointer ${className}`}
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin text-primary" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>Connect Wallet</span>
            {showIcon && <ArrowRight size={16} />}
          </>
        )}
      </button>

      {/* Mobile & MetaMask Guidance Modal */}
      <MobileWalletModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onRetryConnect={handleConnect}
      />
    </>
  );
}
