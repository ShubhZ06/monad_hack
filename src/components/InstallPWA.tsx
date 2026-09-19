'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isPwa);

    // Check if iOS (iOS Safari doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // For Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isPwa) setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show the prompt manually if on mobile and not installed
    if (isIosDevice && !isPwa) {
      // Small delay so it doesn't pop up instantly on page load aggressively
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install, tap the Share icon on iOS or 'Add to Home Screen' in your browser menu.");
    }
  };

  // For the hackathon demo, we always show it unless already installed, 
  // because next-pwa service workers sometimes only fire the event in production builds.
  if (isStandalone) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-4">
      {isIOS ? (
        <div className="text-sm text-muted-foreground bg-card border border-border px-4 py-2 rounded-xl">
          Tap Share <span>then</span> 'Add to Home Screen' to install
        </div>
      ) : (
        <button 
          onClick={handleInstallClick}
          className="bg-card border border-border text-foreground hover:bg-border transition-colors font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Install Monad PWA
        </button>
      )}
    </div>
  );
}
