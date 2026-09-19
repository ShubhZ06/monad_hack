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
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-28">
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Instagram-style Profile Header */}
        <div className="bg-white border border-[#eee7dc] rounded-2xl sm:rounded-3xl p-6 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Story Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full season-story-ring p-[3px] shrink-0 relative">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                <Sparkles size={32} className="text-primary fill-primary/20" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h1 className="font-display italic font-bold text-xl sm:text-2xl text-neutral-900 truncate">
                  @{username}
                </h1>
                <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check size={10} className="stroke-[3]" />
                </span>
              </div>

              <p className="text-xs text-neutral-500 mb-3 truncate">
                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Wallet not connected'}
              </p>

              {/* Badges Pill */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> ID Verified
                </span>
                <span className="bg-[#f4f0e8] text-neutral-700 border border-[#eee7dc] px-2.5 py-0.5 rounded-full font-medium">
                  FoMo Club Member
                </span>
              </div>
            </div>
          </div>

          {/* Instagram Stats Row */}
          <div className="grid grid-cols-3 gap-2 text-center pt-5 mt-5 border-t border-[#f4f0e8]">
            <div className="flex flex-col">
              <span className="font-bold text-base text-neutral-900">12</span>
              <span className="text-[11px] text-neutral-500">Check-ins</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-neutral-900">{BADGES.length}</span>
              <span className="text-[11px] text-neutral-500">SBT Badges</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-neutral-900">{coupons.length}</span>
              <span className="text-[11px] text-neutral-500">Coupons</span>
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-5 mb-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-neutral-900">Campus & Identity Verified</h3>
              <p className="text-[11px] text-neutral-500">Exclusive access to private events & VIP merchant discount perks.</p>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer">
            <Settings size={18} />
          </button>
        </div>

        {/* Monad NFT Discount Coupons Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5 px-1">
            <h2 className="font-display font-bold text-lg text-neutral-900 flex items-center gap-2">
              <Gift className="text-primary" size={18} /> 
              <span>My Claimed NFT Coupons</span>
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {coupons.length} Active
            </span>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-8 text-center shadow-sm">
              <Gift size={28} className="text-neutral-300 mx-auto mb-2" />
              <h4 className="font-bold text-neutral-800 text-sm mb-1">No coupons in your wallet yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Visit any cafe on the feed, leave a verified review, and mint a 20% discount coupon NFT instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {coupons.map((coupon) => {
                const isCopied = copiedId === coupon.id;
                return (
                  <div
                    key={coupon.id}
                    className="bg-white border border-[#eee7dc] hover:border-primary/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-primary uppercase">
                          NFT #{coupon.token_id}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          {coupon.status}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-neutral-900 mb-0.5">{coupon.venue_name}</h4>
                      <p className="text-xs font-bold text-primary mb-3">{coupon.discount_title}</p>
                    </div>

                    <div className="pt-2 border-t border-[#f4f0e8] flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-neutral-800">
                        {coupon.discount_code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.id, coupon.discount_code)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Soulbound Attendance Badges (SBT) */}
        <div>
          <div className="flex items-center justify-between mb-3.5 px-1">
            <h2 className="font-display font-bold text-lg text-neutral-900 flex items-center gap-2">
              <Award className="text-primary" size={18} />
              <span>Soulbound Attendance Badges</span>
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">{BADGES.length} Badges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="bg-white border border-[#eee7dc] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-full season-story-ring p-[2px] mb-2 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Award size={20} className="text-primary" />
                  </div>
                </div>
                <h4 className="font-bold text-xs text-neutral-900 mb-0.5 line-clamp-1">{badge.name}</h4>
                <p className="text-[10px] text-neutral-400">{badge.date}</p>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {badge.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
