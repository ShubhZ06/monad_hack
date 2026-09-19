'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Calendar, Users, User } from 'lucide-react';
import { useAccount } from 'wagmi';

export function MobileDock() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  // Don't show the dock on the landing page if they aren't logged in
  if (pathname === '/' && !isConnected) return null;

  const tabs = [
    { name: 'Feed', href: '/home', icon: Compass },
    { name: 'Trips', href: '/events', icon: Calendar },
    { name: 'Clubs', href: '/communities', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/95 frosted-nav border-t border-neutral-200/80 px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all relative ${
                isActive ? 'text-neutral-950 font-semibold scale-105' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={isActive ? 'text-neutral-950' : 'text-neutral-400'} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

