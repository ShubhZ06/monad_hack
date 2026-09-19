'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Smartphone, Globe, ShieldCheck } from 'lucide-react';

interface MobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryConnect?: () => void;
}

export function MobileWalletModal({ isOpen, onClose, onRetryConnect }: MobileWalletModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const cleanDappUrl = typeof window !== 'undefined'
    ? `${window.location.host}${window.location.pathname}${window.location.search}`
    : '';

  const metaMaskDeepLink = `https://metamask.app.link/dapp/${cleanDappUrl}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenMetaMask = () => {
    if (typeof window !== 'undefined') {
      window.location.href = metaMaskDeepLink;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-neutral-100 p-6 flex flex-col gap-5 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* MetaMask Fox Badge */}
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shadow-2xs">
              🦊
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 leading-tight">
                Connect MetaMask
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mobile Web3 Connection Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notice Box */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 flex gap-3 text-xs text-amber-900 leading-relaxed">
          <Smartphone size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Mobile Browser Notice:</span> Mobile Safari and Chrome cannot directly inject wallet extensions. Open this dApp inside the <strong className="font-semibold underline">MetaMask App Browser</strong> to connect seamlessly.
          </div>
        </div>

        {/* Primary Action: Direct Deep Link */}
        <button
          onClick={handleOpenMetaMask}
          className="w-full bg-[#ff533d] hover:bg-[#e64733] text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open in MetaMask App</span>
          <ExternalLink size={16} />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-neutral-200 flex-1" />
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">or manually open</span>
          <div className="h-px bg-neutral-200 flex-1" />
        </div>

        {/* Manual Step Guide */}
        <div className="space-y-2.5 bg-neutral-50 rounded-xl p-3.5 border border-neutral-150 text-xs text-neutral-700">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>Copy this website address using the button below.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>Open your <strong>MetaMask App</strong> and tap the <strong>Browser tab</strong> (compass icon).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>Paste the link into the address bar to enjoy 1-tap connection & Monad testnet signing!</span>
          </div>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
            copied
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 shadow-2xs'
          }`}
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span>Link Copied! Open in MetaMask Browser</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-neutral-500" />
              <span>Copy Website Link</span>
            </>
          )}
        </button>

        {/* Footer fallback */}
        {onRetryConnect && (
          <div className="pt-1 text-center">
            <button
              onClick={() => {
                onClose();
                onRetryConnect();
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
            >
              Already in MetaMask Browser? Tap here to retry connect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
