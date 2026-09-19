'use client';

import { WalletButton } from '@/components/WalletButton';
import { ShieldCheck, Award, MapPin, Settings, Camera } from 'lucide-react';
import { useAccount } from 'wagmi';

// Mock Data for Soulbound Tokens (Attendance Badges)
const BADGES = [
  { id: 1, name: 'Hackathon Afterparty', date: 'Oct 2, 2026', type: 'Exclusive' },
  { id: 2, name: 'Neon Nights Rooftop', date: 'Sep 15, 2026', type: 'Vibe Check' },
  { id: 3, name: 'Monad Builder', date: 'Aug 20, 2026', type: 'Early Adopter' },
];

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  // Re-using the logic from WalletButton for visualization here
  const generateUsername = (addr: string) => {
    const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Chill', 'Hype'];
    const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru'];
    const num1 = parseInt(addr.slice(2, 4), 16) % adjectives.length;
    const num2 = parseInt(addr.slice(4, 6), 16) % nouns.length;
    return `${adjectives[num1]}${nouns[num2]}_${addr.slice(-4)}`;
  };

  const username = address ? generateUsername(address) : 'Guest_User';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-tighter">
            MONAD<span className="text-primary">.PWA</span>
          </div>
          <div className="flex items-center gap-4">
            <WalletButton className="!px-4 !py-2 !text-sm !rounded-lg !shadow-none" showIcon={false} />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-12 relative">
          <div className="w-32 h-32 rounded-full bg-border border-4 border-background overflow-hidden relative mb-4 shadow-[0_0_30px_rgba(204,255,0,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-background flex items-center justify-center text-4xl">
              👽
            </div>
            <button className="absolute bottom-2 right-2 bg-background p-1.5 rounded-full border border-border text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              <Camera size={16} />
            </button>
          </div>
          
          <h1 className="text-3xl font-bold font-mono tracking-tight mb-2">
            @{username}
          </h1>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> ID Verified
            </span>
            <span className="text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
              NYU Community
            </span>
          </div>
        </div>

        {/* Verification Banner (Mock State) */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold">College ID Verified</h3>
              <p className="text-sm text-muted-foreground">You have access to exclusive private events.</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <Settings size={20} />
          </button>
        </div>

        {/* Soulbound Badges Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-primary" /> 
            Soulbound Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge) => (
              <div key={badge.id} className="bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-background border border-primary/20 mb-3 flex items-center justify-center">
                  <Award size={28} className="text-primary" />
                </div>
                <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.date}</p>
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {badge.type}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
