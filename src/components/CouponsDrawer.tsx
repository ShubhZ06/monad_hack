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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="flex-1 hidden md:block" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-white border-l border-[#eee7dc] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#eee7dc] flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Gift size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xl text-neutral-900">NFT Coupons</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {coupons.length}
                </span>
              </div>
              <p className="text-xs text-neutral-500">Verified On-Chain Check-in Rewards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-[#eee7dc] flex gap-2 bg-white">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-[#eee7dc] text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-[#eee7dc] text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Active ({coupons.filter((c) => c.status === 'ACTIVE').length})
          </button>
        </div>

        {/* Coupons List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 no-scrollbar bg-[#faf8f5]">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-2.5">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Tag size={24} />
              </div>
              <h4 className="font-bold text-neutral-800 text-sm">No Coupons Yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                Check in at any venue and post a verified review to claim your 20% OFF Monad NFT coupon!
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isCopied = copiedId === coupon.id;
              const isRedeemed = coupon.status === 'REDEEMED';

              return (
                <div
                  key={coupon.id}
                  className={`bg-white border rounded-2xl p-4 transition-all flex flex-col gap-3 relative shadow-sm ${
                    isRedeemed
                      ? 'border-[#eee7dc] opacity-60'
                      : 'border-[#eee7dc] hover:border-primary/50'
                  }`}
                >
                  {/* Top Row: NFT badge & Venue */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {coupon.nft_image_url && (
                        <img
                          src={coupon.nft_image_url}
                          alt={coupon.venue_name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#eee7dc] shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                            NFT #{coupon.token_id}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">• Monad Testnet</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-neutral-900 truncate">{coupon.venue_name}</h4>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isRedeemed
                          ? 'bg-neutral-100 text-neutral-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {coupon.status}
                    </span>
                  </div>

                  {/* Discount Title */}
                  <div className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-primary shrink-0" />
                    <span>{coupon.discount_title}</span>
                  </div>

                  {/* Voucher Code Box */}
                  <div className="bg-[#fbf9f5] border border-dashed border-primary/50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Voucher Code</span>
                      <span className="font-mono font-bold text-sm text-primary tracking-wider">
                        {coupon.discount_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedQrCoupon(coupon)}
                        className="p-2 rounded-lg bg-white border border-[#eee7dc] hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
                        title="Show QR Code for Redemption"
                      >
                        <QrCode size={15} />
                      </button>

                      <button
                        onClick={() => handleCopy(coupon.id, coupon.discount_code)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Monad Testnet Tx Explorer Link */}
                  {coupon.monad_tx_hash && (
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
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
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedQrCoupon(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 hover:text-neutral-900 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <QrCode size={26} />
            </div>

            <h4 className="font-display font-bold text-lg text-neutral-900 mb-0.5">{selectedQrCoupon.venue_name}</h4>
            <p className="text-xs text-neutral-500 mb-4">Show this QR to the cashier at checkout</p>

            {/* Simulated Clean QR Code Graphic */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-[#eee7dc] mb-4">
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

            <div className="font-mono font-bold text-primary text-base tracking-widest bg-white border border-[#eee7dc] px-4 py-2 rounded-xl mb-4 shadow-sm">
              {selectedQrCoupon.discount_code}
            </div>

            <button
              onClick={() => setSelectedQrCoupon(null)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-full text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


