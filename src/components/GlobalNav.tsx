'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';
import { Compass, Calendar, Users, User, Sparkles } from 'lucide-react';

export function GlobalNav() {
  const pathname = usePathname();

  // Hide the global nav entirely on the landing page
  if (pathname === '/') return null;

  const tabs = [
    { name: 'Feed', href: '/home', icon: Compass },
    { name: 'Trips & Escrow', href: '/events', icon: Calendar },
    { name: 'Communities', href: '/communities', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="border-b border-neutral-150 bg-white/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Season Mix Editorial App Logo */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="FoMo Logo"
            className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform border border-[#eee7dc]"
          />
          <div className="flex flex-col">
            <span className="font-display italic font-bold text-xl sm:text-2xl tracking-tight text-neutral-900 leading-none">
              FoMo<span className="text-primary not-italic font-black ml-0.5">.</span>
            </span>
            <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest leading-none mt-0.5">
              SEASON VIBES
            </span>
          </div>
        </Link>


        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-full border border-neutral-200/60">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-white text-neutral-950 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-primary' : ''} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Wallet & Quick Action */}
        <div className="flex items-center gap-2">
          <WalletButton className="!px-3.5 !py-1.5 !text-xs !rounded-full !shadow-sm" showIcon={false} />
        </div>
      </div>
    </nav>
  );
}

