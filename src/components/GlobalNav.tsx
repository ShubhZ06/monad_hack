'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';

export function GlobalNav() {
  const pathname = usePathname();

  // Hide the global nav entirely on the landing page
  if (pathname === '/') return null;

  const tabs = [
    { name: 'Discovery', href: '/home' },
    { name: 'Community', href: '/communities' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="font-mono font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
          MONAD<span className="text-primary">.PWA</span>
        </Link>

        {/* Desktop Tabs (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Wallet Button */}
        <div className="flex items-center gap-4">
          <WalletButton className="!px-4 !py-2 !text-sm !rounded-lg !shadow-none" showIcon={false} />
        </div>
      </div>
    </nav>
  );
}
