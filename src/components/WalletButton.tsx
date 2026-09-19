'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, LogOut, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { monadTestnet } from '@/lib/monad/config';

interface WalletButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function WalletButton({ className = '', showIcon = true }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExtensionMissing, setIsExtensionMissing] = useState(false);
  const [connectingDemo, setConnectingDemo] = useState(false);

  // If connected and on the landing page, automatically push to /home
  useEffect(() => {
    if (isConnected && pathname === '/') {
      router.push('/home');
    }
  }, [isConnected, router, pathname]);

  // Generate a fun placeholder name based on wallet address
  const generateUsername = (addr: string) => {
    const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Chill', 'Hype'];
    const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru'];
    
    const clean = addr.replace(/^0x/, '');
    const num1 = parseInt(clean.slice(0, 2) || '0', 16) % adjectives.length;
    const num2 = parseInt(clean.slice(2, 4) || '0', 16) % nouns.length;
    
    return `${adjectives[num1]}${nouns[num2]}_${clean.slice(-4)}`;
  };

  const handleMetaMaskConnect = async () => {
    setErrorMessage(null);
    setIsExtensionMissing(false);

    // Check if an injected provider exists in window
    const hasEthereum = typeof window !== 'undefined' && Boolean((window as any).ethereum);

    // Pick the injected connector
    const injectedConnector = connectors.find((c) => c.id === 'injected');

    if (!hasEthereum && !injectedConnector) {
      setIsExtensionMissing(true);
      setErrorMessage('MetaMask extension is not detected in this browser.');
      return;
    }

    try {
      if (injectedConnector) {
        await connectAsync({
          connector: injectedConnector,
          chainId: monadTestnet.id,
        });
      } else if (hasEthereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const msg = err?.message?.toLowerCase() || '';

      if (err?.code === 4001 || msg.includes('reject') || msg.includes('user cancelled')) {
        setErrorMessage('Connection request was cancelled in MetaMask.');
      } else if (msg.includes('already pending') || msg.includes('request pending')) {
        setErrorMessage('A connection request is already pending in MetaMask. Please check your browser extension icon!');
      } else if (msg.includes('connector not found') || msg.includes('not detected') || !hasEthereum) {
        setIsExtensionMissing(true);
        setErrorMessage('MetaMask extension is not installed or enabled in this browser.');
      } else {
        setErrorMessage(err?.shortMessage || err?.message || 'Failed to connect. Please unlock your wallet and try again.');
      }
    }
  };

  const handleDemoConnect = async () => {
    setErrorMessage(null);
    setConnectingDemo(true);
    try {
      const mockConnector = connectors.find((c) => c.id === 'mock');
      if (mockConnector) {
        await connectAsync({
          connector: mockConnector,
          chainId: monadTestnet.id,
        });
      }
      router.push('/home');
    } catch (err: any) {
      console.error('Demo connection error:', err);
      // Fallback: direct navigation to home
      router.push('/home');
    } finally {
      setConnectingDemo(false);
    }
  };

  // ─── Connected State ────────────────────────────────────────────────
  if (isConnected && address) {
    const displayName = generateUsername(address);
    
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl font-mono text-xs md:text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-foreground">{displayName}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-muted-foreground hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-card border border-transparent hover:border-border"
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  const isNavButton = className.includes('!text-sm');

  // ─── Disconnected Nav Button ─────────────────────────────────────────
  if (isNavButton) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={isPending || connectingDemo}
          onClick={handleMetaMaskConnect}
          className={`bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}
        >
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    );
  }

  // ─── Main Landing Page CTA ──────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <button
        disabled={isPending || connectingDemo}
        onClick={handleMetaMaskConnect}
        className={`w-full bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.3)] disabled:opacity-50 disabled:hover:scale-100 ${className}`}
      >
        {isPending ? (
          <>
            <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
            Connecting to MetaMask...
          </>
        ) : (
          <>
            Connect MetaMask to Enter
            {showIcon && <ArrowRight size={20} />}
          </>
        )}
      </button>

      {/* Demo / Guest Bypass CTA */}
      <button
        type="button"
        disabled={isPending || connectingDemo}
        onClick={handleDemoConnect}
        className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-card border border-transparent hover:border-border"
      >
        <Sparkles size={13} className="text-primary" />
        {connectingDemo ? 'Entering demo environment...' : 'Or enter as Demo User / Judge (Instant Access)'}
      </button>

      {/* Error & Extension Guidance */}
      {errorMessage && (
        <div className="w-full bg-destructive/15 border border-destructive/30 rounded-2xl p-4 text-left mt-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-destructive mb-1">{errorMessage}</p>
              
              {isExtensionMissing ? (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-muted-foreground">
                    To use your on-chain wallet on Monad Testnet, install the MetaMask extension:
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-card hover:bg-border text-foreground font-semibold px-3 py-1.5 rounded-lg border border-border transition-colors text-xs"
                    >
                      Install MetaMask <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={handleDemoConnect}
                      className="bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105 text-xs"
                    >
                      ⚡ Instant Demo Login
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mt-1">
                  Tip: If MetaMask didn&apos;t open, check if the extension is locked or if a popup is waiting in your toolbar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

