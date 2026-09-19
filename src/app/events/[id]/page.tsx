'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Send, Shield, Clock, DollarSign, Users, ExternalLink, Check, Lock } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { ESCROW_ADDRESS, MOCK_USDC_ADDRESS, ESCROW_ABI, USDC_ABI } from '@/config/contracts';

// Onchain event ID — in production this maps from Supabase event to chain event ID
const ONCHAIN_EVENT_ID = BigInt(0);

// Mock metadata (title, description, date come from Supabase — only financials from chain)
const EVENT_META = {
  title: 'Rooftop Movie Night',
  description: 'We secured the Sunset Lounge rooftop. Price includes projector rental, seating, and 1 drink ticket.',
  date: 'Oct 15, 2026',
};

const INITIAL_COMMENTS = [
  { id: 'c1', username: 'NeonChad_4F9A', text: 'This is going to be insane', time: '2h ago' },
  { id: 'c2', username: 'VibeWhale_88B2', text: 'Just pledged! Let\'s hit the 100 mark.', time: '5h ago' },
];

const STATE_LABELS: Record<number, string> = {
  0: 'BIDDING',
  1: 'PLEDGING LIVE',
  2: 'LOCKED',
  3: 'COMPLETED',
  4: 'DISPUTED',
  5: 'REFUNDED',
};

export default function EventThread() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [pledgeStep, setPledgeStep] = useState<'idle' | 'approving' | 'pledging' | 'done'>('idle');

  // ─── On-chain reads ────────────────────────────────────────────────
  const { data: eventData, refetch: refetchEvent } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'events',
    args: [ONCHAIN_EVENT_ID],
  });

  const { data: alreadyPledged } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'hasPledged',
    args: [ONCHAIN_EVENT_ID, address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected && !!address },
  });

  // ─── On-chain writes ───────────────────────────────────────────────
  const { writeContract: approveUsdc, data: approveTxHash } = useWriteContract();
  const { writeContract: pledgeToEvent, data: pledgeTxHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isLoading: isPledging, isSuccess: pledgeSuccess } = useWaitForTransactionReceipt({
    hash: pledgeTxHash,
  });

  // When approve confirms, auto-call pledge
  if (approveSuccess && pledgeStep === 'approving') {
    setPledgeStep('pledging');
    pledgeToEvent({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'pledge',
      args: [ONCHAIN_EVENT_ID],
    });
  }

  if (pledgeSuccess && pledgeStep === 'pledging') {
    setPledgeStep('done');
    refetchEvent();
  }

  // ─── Derived data ──────────────────────────────────────────────────
  const currentPledges = eventData ? Number(eventData[2]) : 0;
  const targetHeadcount = eventData ? Number(eventData[1]) : 40;
  const pricePerHead = eventData ? eventData[3] : BigInt(1e17); // fallback: 0.1 MON in wei
  const eventState = eventData ? Number(eventData[5]) : 1;
  const totalLocked = currentPledges * Number(formatUnits(pricePerHead, 18));
  const progress = targetHeadcount > 0 ? (currentPledges / targetHeadcount) * 100 : 0;

  const handlePledge = () => {
    if (!isConnected || !address) return;
    setPledgeStep('approving');
    // Step 1: approve MockUSDC spend
    approveUsdc({
      address: MOCK_USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [ESCROW_ADDRESS, pricePerHead],
    });
  };

  const handlePostComment = () => {
    if (!newComment.trim() || !isConnected) return;
    setComments([...comments, {
      id: Math.random().toString(),
      username: 'You',
      text: newComment,
      time: 'Just now'
    }]);
    setNewComment('');
  };

  const pledgeButtonLabel = () => {
    if (!isConnected) return 'Connect Wallet to Pledge';
    if (alreadyPledged) return 'Already Pledged';
    if (pledgeStep === 'done' || pledgeSuccess) return 'Pledged!';
    if (pledgeStep === 'approving' || isApproving) return 'Sending MON...';
    if (pledgeStep === 'pledging' || isPledging) return 'Confirming on Monad...';
    return `Pledge 0.1 MON`;
  };

  const isPledgeDisabled = !isConnected || !!alreadyPledged || pledgeStep !== 'idle' || pledgeSuccess;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <main className="max-w-3xl mx-auto px-6 pt-6 flex flex-col gap-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-bold transition-colors w-fit">
          <ArrowLeft size={20} /> Back to Hub
        </button>

        {/* Main Event Card */}
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="absolute top-6 right-6">
            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {STATE_LABELS[eventState] ?? 'LOADING...'}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-3 pr-32">{EVENT_META.title}</h1>
          <p className="text-muted-foreground text-base mb-8">{EVENT_META.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-background border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                <Users size={12} className="text-primary"/> Pledged
              </div>
              <div className="text-2xl font-bold">{currentPledges} <span className="text-sm text-muted-foreground">/ {targetHeadcount}</span></div>
            </div>

            <div className="bg-background border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                <DollarSign size={12} className="text-primary"/> Vault Total
              </div>
              <div className="text-2xl font-bold">{totalLocked.toFixed(2)} <span className="text-sm text-muted-foreground">MON</span></div>
            </div>

            <div className="bg-background border border-border rounded-xl p-4 col-span-2 md:col-span-1">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                <Shield size={12} className="text-primary"/> Secured By
              </div>
              <div className="font-bold text-primary text-sm">Monad Testnet</div>
              <a
                href={`https://testnet.monadexplorer.com/address/${ESCROW_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 transition-colors"
              >
                View Contract <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span className="text-primary font-bold">{progress.toFixed(0)}% funded</span>
              <span className="text-muted-foreground">{targetHeadcount - currentPledges} spots left</span>
            </div>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden border border-border">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Pledge Button */}
          <button
            onClick={handlePledge}
            disabled={isPledgeDisabled}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:scale-105 transition-transform flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {(alreadyPledged || pledgeStep === 'done' || pledgeSuccess) && <Check size={18} />}
            {pledgeButtonLabel()}
          </button>

          {(isApproving || isPledging) && (
            <p className="text-center text-xs text-muted-foreground mt-3 animate-pulse">
              Transaction pending on Monad... Do not close this page.
            </p>
          )}
        </div>

        {/* Conversations */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <MessageCircle className="text-primary" /> Conversations
          </h2>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isConnected ? "Add a comment..." : "Connect wallet to comment"}
              disabled={!isConnected}
              className="flex-1 bg-card border border-border rounded-2xl py-4 px-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || !isConnected}
              className="bg-secondary text-secondary-foreground px-5 rounded-2xl hover:bg-border transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-card/50 border border-border/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-primary">@{comment.username}</span>
                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
