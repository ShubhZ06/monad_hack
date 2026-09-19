'use client';

import React, { useState } from 'react';
import { X, Gift, ExternalLink, Copy, Check, Sparkles, QrCode, Tag, CheckCircle2 } from 'lucide-react';
import { useAccount } from 'wagmi';

export interface CouponItem {
  id: string;
  venue_id: string;
  venue_name: string;
  wallet_address: string;
  discount_title: string;
  discount_code: string;
  discount_percent: number;
  token_id: number;
  monad_tx_hash?: string;
  nft_image_url?: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  created_at: string;
}

interface CouponsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: CouponItem[];
  onRedeem?: (couponId: string) => void;
}

export function CouponsDrawer({ isOpen, onClose, coupons, onRedeem }: CouponsDrawerProps) {
  const { address } = useAccount();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [selectedQrCoupon, setSelectedQrCoupon] = useState<CouponItem | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCoupons = coupons.filter((c) => (activeTab === 'ALL' ? true : c.status === 'ACTIVE'));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="flex-1 hidden md:block" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Gift size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-foreground">NFT Coupons</h3>
                <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {coupons.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Monad Testnet Verified Rewards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-border/50 flex gap-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            All Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'ACTIVE'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({coupons.filter((c) => c.status === 'ACTIVE').length})
          </button>
        </div>

        {/* Coupons List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Tag size={28} />
              </div>
              <h4 className="font-bold text-foreground">No Coupons Found</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Check in at any cafe or restaurant and post a review to instantly claim a 20% OFF Monad Testnet NFT coupon!
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isCopied = copiedId === coupon.id;
              const isRedeemed = coupon.status === 'REDEEMED';

              return (
                <div
                  key={coupon.id}
                  className={`bg-background/90 border rounded-2xl p-4.5 transition-all flex flex-col gap-3 relative overflow-hidden ${
                    isRedeemed
                      ? 'border-border opacity-60'
                      : 'border-primary/40 hover:border-primary shadow-[0_0_20px_rgba(204,255,0,0.08)]'
                  }`}
                >
                  {/* Top Row: NFT badge & Venue */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {coupon.nft_image_url && (
                        <img
                          src={coupon.nft_image_url}
                          alt={coupon.venue_name}
                          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-black text-primary uppercase tracking-wider">
                            NFT #{coupon.token_id}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">• Monad Testnet</span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground truncate">{coupon.venue_name}</h4>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isRedeemed
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-green-500/10 text-green-400 border border-green-500/30'
                      }`}
                    >
                      {coupon.status}
                    </span>
                  </div>

                  {/* Discount Title */}
                  <div className="text-lg font-black text-foreground flex items-center gap-2">
                    <Sparkles size={16} className="text-primary shrink-0" />
                    {coupon.discount_title}
                  </div>

                  {/* Voucher Code Box */}
                  <div className="bg-card border border-dashed border-primary/50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-muted-foreground block">Voucher Code</span>
                      <span className="font-mono font-bold text-sm text-primary tracking-wider">
                        {coupon.discount_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedQrCoupon(coupon)}
                        className="p-2 rounded-lg bg-secondary hover:bg-border text-muted-foreground hover:text-foreground transition-colors"
                        title="Show QR Code for Redemption"
                      >
                        <QrCode size={16} />
                      </button>

                      <button
                        onClick={() => handleCopy(coupon.id, coupon.discount_code)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Monad Testnet Tx Explorer Link */}
                  {coupon.monad_tx_hash && (
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                      <span>Monad Chain Verified</span>
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${coupon.monad_tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <span>View on Explorer</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* QR Redemption Modal Overlay */}
        {selectedQrCoupon && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedQrCoupon(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-3">
              <QrCode size={28} />
            </div>

            <h4 className="text-lg font-bold text-foreground mb-1">{selectedQrCoupon.venue_name}</h4>
            <p className="text-xs text-muted-foreground mb-4">Show this QR to the cashier at checkout</p>

            {/* Simulated Clean QR Code Graphic */}
            <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
              <div className="w-44 h-44 border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 bg-black" />
                  <div className="w-10 h-10 bg-black" />
                </div>
                <div className="text-[10px] font-mono text-black font-bold tracking-tighter">
                  MONAD-PAY-SBT
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 bg-black" />
                  <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-[8px] text-black">
                    20%
                  </div>
                </div>
              </div>
            </div>

            <div className="font-mono font-black text-primary text-base tracking-widest bg-card border border-border px-4 py-2 rounded-xl mb-4">
              {selectedQrCoupon.discount_code}
            </div>

            <button
              onClick={() => setSelectedQrCoupon(null)}
              className="w-full bg-secondary hover:bg-border text-secondary-foreground font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
