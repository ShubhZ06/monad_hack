import { MapPin, Users, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';
import { InstallPWA } from '@/components/InstallPWA';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-[#eee7dc] bg-white/85 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              F
            </div>
            <span className="font-display italic font-bold text-xl tracking-tight text-neutral-900">
              FoMo<span className="text-primary not-italic font-black">.</span>
            </span>
          </Link>
          <WalletButton className="!px-4 !py-2 !text-xs !rounded-full !shadow-sm" showIcon={false} />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#eee7dc] text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Live on Monad Testnet
        </div>
        
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-5 max-w-3xl text-neutral-900 leading-[1.08]">
          Discover the <span className="italic text-primary font-normal">Vibe.</span> <br />
          <span className="text-neutral-500 font-normal italic">Fund the Experience.</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-xl mb-8 leading-relaxed">
          The social venue discovery platform built on Monad. Verified physical check-ins, instant 20% discount NFT vouchers, and trusted group escrow.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center mb-10">
          <Link href="/home" className="w-full sm:w-auto">
            <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
              <span>Explore Live Feed</span>
              <ArrowRight size={16} />
            </button>
          </Link>
          <WalletButton />
        </div>
        
        {/* PWA Install Prompt for Mobile Devices */}
        <InstallPWA />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 w-full mt-16 sm:mt-24 text-left">
          <div className="bg-white border border-[#eee7dc] p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/40 transition-all">
            <div className="h-11 w-11 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <MapPin size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-neutral-900 mb-1">Curated Discovery</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Real-time feed of vetted cafes and venues with verified on-chain GPS presence and photo reviews.
            </p>
          </div>

          <div className="bg-white border border-[#eee7dc] p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/40 transition-all">
            <div className="h-11 w-11 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <Sparkles size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-neutral-900 mb-1">Instant NFT Perks</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Check in physically at any venue, leave a review, and mint a 20% discount voucher NFT directly to your wallet.
            </p>
          </div>

          <div className="bg-white border border-[#eee7dc] p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:border-primary/40 transition-all">
            <div className="h-11 w-11 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <Zap size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-neutral-900 mb-1">Trustless Escrow</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              No more awkward group payment chasing. Pledge MON securely. Automatic instant refunds if event quorum isn't met.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

