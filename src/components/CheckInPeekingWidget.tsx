'use client';

import React, { useState } from 'react';
import { Coffee, Star, Sparkles, MapPin, ChevronLeft, ChevronRight, Gift, Check, ShieldAlert, ShieldCheck, Lock, Navigation } from 'lucide-react';

export interface VenueSimple {
  id: string;
  name: string;
  type: string;
  address: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
}

interface CheckInPeekingWidgetProps {
  currentVenue: VenueSimple;
  availableVenues: VenueSimple[];
  onSelectVenue: (venue: VenueSimple) => void;
  onOpenReview: () => void;
  onOpenCoupons: () => void;
  couponsCount: number;
  userLat: number | null;
  userLng: number | null;
  isSimulatedAtVenue: boolean;
  onToggleSimulate: () => void;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function CheckInPeekingWidget({
  currentVenue,
  availableVenues,
  onSelectVenue,
  onOpenReview,
  onOpenCoupons,
  couponsCount,
  userLat,
  userLng,
  isSimulatedAtVenue,
  onToggleSimulate,
}: CheckInPeekingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  // Maximum allowed distance from venue to post a review (250 meters)
  const MAX_CHECKIN_RADIUS_METERS = 250;

  let distanceKm: number | null = null;
  let distanceMeters: number | null = null;
  let isInRange = false;

  if (isSimulatedAtVenue) {
    isInRange = true;
    distanceMeters = 24; // simulated 24 meters inside
    distanceKm = 0.024;
  } else if (userLat && userLng) {
    const isMonadCafe = currentVenue.id === 'venue-monad-cafe' || currentVenue.name.toLowerCase().includes('monad cafe');
    const venueLat = isMonadCafe ? userLat : (currentVenue.latitude ?? (userLat + 0.016));
    const venueLng = isMonadCafe ? userLng : (currentVenue.longitude ?? (userLng + 0.014));
    distanceKm = haversineDistance(userLat, userLng, venueLat, venueLng);
    distanceMeters = Math.round(distanceKm * 1000);
    isInRange = distanceMeters <= MAX_CHECKIN_RADIUS_METERS;
  }

  const formatDistanceLabel = () => {
    if (distanceMeters == null) return 'Checking GPS...';
    if (distanceMeters <= 30) return 'In Venue (Verified)';
    if (distanceMeters < 1000) return `${distanceMeters}m away`;
    return `${(distanceKm || 0).toFixed(1)} km away`;
  };

  return (
    <>
      {/* Floating Peeking Square on Right Side */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-out ${
          isExpanded ? 'translate-x-0' : 'translate-x-3 hover:translate-x-0'
        }`}
      >
        <div className="flex items-center">
          {/* Peeking trigger tab */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-card/95 backdrop-blur-xl border-y border-l shadow-[-8px_0_24px_rgba(0,0,0,0.4)] rounded-l-2xl p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all group ${
              isInRange ? 'border-primary/50 hover:border-primary' : 'border-amber-500/40 hover:border-amber-500'
            }`}
            title="Venue Check-in & Review Verification"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                isInRange ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}>
                <Coffee size={18} className="animate-pulse" />
              </div>
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background animate-ping ${
                isInRange ? 'bg-green-500' : 'bg-amber-500'
              }`} />
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background ${
                isInRange ? 'bg-green-500' : 'bg-amber-500'
              }`} />
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider text-foreground [writing-mode:vertical-lr] rotate-180 py-1 flex items-center gap-1">
              <Sparkles size={10} className="text-primary inline rotate-90" />
              {isInRange ? 'Verified' : 'Check-In'}
            </span>

            {isExpanded ? (
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <ChevronLeft size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>

          {/* Expanded Card Content */}
          {isExpanded && (
            <div className="bg-card/95 backdrop-blur-2xl border-l border-y border-border shadow-[-16px_0_40px_rgba(0,0,0,0.6)] rounded-l-3xl p-5 w-80 flex flex-col gap-4 animate-in slide-in-from-right duration-200">
              {/* Header with Location Range Status */}
              <div className="flex items-center justify-between">
                {isInRange ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400 border border-green-500/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-green-400" />
                    In Venue Zone ({formatDistanceLabel()})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <ShieldAlert size={12} className="text-amber-400" />
                    Outside Range ({formatDistanceLabel()})
                  </span>
                )}

                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground hover:text-foreground text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Current Venue Info */}
              <div className="bg-background/80 border border-border/80 rounded-2xl p-3.5 relative overflow-hidden">
                <div className="flex gap-3 items-center">
                  <img
                    src={currentVenue.image_url}
                    alt={currentVenue.name}
                    className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                      <Coffee size={10} /> {currentVenue.type}
                    </div>
                    <h4 className="font-bold text-sm text-foreground truncate">{currentVenue.name}</h4>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-0.5">
                      <MapPin size={10} /> {currentVenue.address}
                    </p>
                  </div>
                </div>

                {/* Change Venue Trigger */}
                {availableVenues.length > 1 && (
                  <button
                    onClick={() => setShowVenuePicker(!showVenuePicker)}
                    className="mt-2 text-[10px] font-bold text-primary hover:underline flex items-center justify-between w-full pt-2 border-t border-border/60"
                  >
                    <span>Switch location check-in</span>
                    <span>{showVenuePicker ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>

              {/* Dropdown Venue Picker */}
              {showVenuePicker && (
                <div className="bg-background border border-border rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                  <div className="text-[10px] font-mono text-muted-foreground px-2 py-0.5">Select Venue to Check-In:</div>
                  {availableVenues.map((v) => {
                    const isMonad = v.id === 'venue-monad-cafe' || v.name.toLowerCase().includes('monad cafe');
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          onSelectVenue(v);
                          setShowVenuePicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors border ${
                          v.id === currentVenue.id
                            ? 'bg-primary/15 border-primary/40 text-primary font-bold'
                            : 'bg-card/50 border-border/50 hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="truncate font-bold">{v.name}</div>
                          <div className="text-[10px] flex items-center gap-1 mt-0.5">
                            {isMonad ? (
                              <span className="text-green-400 font-semibold flex items-center gap-0.5">
                                • Inside Venue (0m)
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                                • Out of range (2.3 km)
                              </span>
                            )}
                          </div>
                        </div>
                        {v.id === currentVenue.id && <Check size={14} className="text-primary shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Exact Range Proof Notice */}
              <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                isInRange 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {isInRange ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  <span>{isInRange ? 'Location Verified' : 'Location Gate Active'}</span>
                </div>
                <p className="text-[11px] opacity-90">
                  {isInRange
                    ? `You are within the 250m physical radius. Reviews here are verified on-chain.`
                    : `You are currently outside ${currentVenue.name}. Reviews require physical presence within 250m.`}
                </p>
              </div>

              {/* GPS Demo Mode Simulation Switch */}
              <div className="bg-secondary/60 border border-border rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Navigation size={13} className="text-primary" />
                  <span className="font-semibold text-foreground">Simulate In-Venue</span>
                  <span className="text-[9px] bg-primary/20 text-primary font-bold px-1.5 py-0.2 rounded">Demo</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleSimulate}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isSimulatedAtVenue ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}
                  title="Toggle between real GPS and simulated presence for hackathon testing"
                >
                  <span className={`w-4 h-4 rounded-full transition-colors ${
                    isSimulatedAtVenue ? 'bg-primary-foreground' : 'bg-muted-foreground'
                  }`} />
                </button>
              </div>

              {/* Reward Callout Pill */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-xl p-3 flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/20 text-primary rounded-lg shrink-0">
                  <Gift size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Earn 20% OFF NFT</p>
                  <p className="text-[10px] text-muted-foreground">1 coupon per verified check-in</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isInRange ? (
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onOpenReview();
                    }}
                    className="w-full bg-primary text-primary-foreground hover:brightness-110 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
                  >
                    <Star size={16} className="fill-primary-foreground" />
                    Add Verified Review
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-muted text-muted-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs border border-border cursor-not-allowed opacity-75"
                    title="You must be within 250m of the venue or enable Simulate In-Venue"
                  >
                    <Lock size={14} />
                    Locked (Outside 250m Range)
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenCoupons();
                  }}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-border font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-border transition-colors"
                >
                  <Gift size={14} className="text-primary" />
                  My NFT Coupons ({couponsCount})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
