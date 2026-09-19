'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, User } from 'lucide-react';
import { useAccount } from 'wagmi';

export function MobileDock() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  // Don't show the dock on the landing page if they aren't logged in
  if (pathname === '/' && !isConnected) return null;

  const tabs = [
    { name: 'Discovery', href: '/home', icon: Compass },
    { name: 'Community', href: '/events', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[90]">
      <div className="bg-card/90 backdrop-blur-xl border border-border/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-full px-6 py-4 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : ''} />
              <span className="text-[10px] font-bold">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
