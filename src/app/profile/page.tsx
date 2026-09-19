'use client';

import { WalletButton } from '@/components/WalletButton';
import { ShieldCheck, Award, MapPin, Settings, Camera, Gift, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { CouponItem } from '@/components/CouponsDrawer';

// Mock Data for Soulbound Tokens (Attendance Badges)
const BADGES = [
  { id: 1, name: 'Hackathon Afterparty', date: 'Oct 2, 2026', type: 'Exclusive' },
  { id: 2, name: 'Monad Cafe & Roastery', date: 'Sep 15, 2026', type: 'Vibe Check' },
  { id: 3, name: 'Monad Builder', date: 'Aug 20, 2026', type: 'Early Adopter' },
];

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const walletParam = address ? `?wallet=${address}` : '';
        const res = await fetch(`/api/coupons${walletParam}`);
        const data = await res.json();
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      }
    };
    fetchCoupons();
  }, [address]);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
              Monad Community
            </span>
          </div>
        </div>

        {/* Verification Banner */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold">College ID Verified</h3>
              <p className="text-sm text-muted-foreground">You have access to exclusive private events and VIP venue rewards.</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <Settings size={20} />
          </button>
        </div>

        {/* Monad NFT Discount Coupons Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="text-primary" /> 
              NFT Discount Coupons
            </h2>
            <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-black px-2.5 py-1 rounded-full">
              {coupons.length} Active
            </span>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Gift size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No coupons yet. Visit a cafe, leave a review from the Discovery feed, and claim a 20% discount NFT!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => {
                const isCopied = copiedId === coupon.id;
                return (
                  <div
                    key={coupon.id}
                    className="bg-card border border-primary/40 rounded-2xl p-5 shadow-[0_0_20px_rgba(204,255,0,0.06)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black text-primary uppercase">
                          NFT #{coupon.token_id}
                        </span>
                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                          {coupon.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-foreground mb-1">{coupon.venue_name}</h4>
                      <p className="text-sm font-black text-primary mb-3">{coupon.discount_title}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-background border border-dashed border-primary/50 rounded-xl p-2.5 flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-primary">{coupon.discount_code}</span>
                        <button
                          onClick={() => handleCopy(coupon.id, coupon.discount_code)}
                          className="bg-secondary hover:bg-border text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-colors"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      {coupon.monad_tx_hash && (
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${coupon.monad_tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-muted-foreground hover:text-primary flex items-center justify-end gap-1 font-mono transition-colors"
                        >
                          <span>Monad Explorer</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
