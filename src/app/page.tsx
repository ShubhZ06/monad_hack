import { MapPin, Users, Zap } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-tighter">
            MONAD<span className="text-primary">.PWA</span>
          </div>
          {/* Small Wallet Button for Navbar */}
          <WalletButton className="!px-4 !py-2 !text-sm !rounded-lg !shadow-none" showIcon={false} />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Built on Monad Testnet
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
          Discover the Vibe. <br />
          <span className="text-muted-foreground">Fund the Experience.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          The first Web3 platform where Gen Z aggregates demand for group events, 
          discovers trusted venues, and holds funds safely in smart contract escrow.
        </p>

        {/* Main CTA Wallet Button */}
        <WalletButton />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full mt-32 text-left">
          <div className="bg-card border border-border p-6 rounded-2xl">
            <div className="h-12 w-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 text-primary">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Venue Discovery</h3>
            <p className="text-muted-foreground">
              Stop guessing if a place is good. Browse our curated feed of venues with verified on-chain Vibe Ratings from real people who actually went there.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="h-12 w-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 text-primary">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Demand Aggregation</h3>
            <p className="text-muted-foreground">
              Want to throw a massive rooftop party? Propose the idea, gather soft interest ("I'm in"), and get actual venues to bid on your event.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl">
            <div className="h-12 w-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 text-primary">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Trustless Escrow</h3>
            <p className="text-muted-foreground">
              No more Venmo/UPI nightmares. Pledge funds securely via MetaMask. If the minimum headcount isn't reached, everyone is auto-refunded instantly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
