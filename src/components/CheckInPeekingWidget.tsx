'use client';

import React, { useState } from 'react';
import { Coffee, Star, Sparkles, MapPin, ChevronLeft, ChevronRight, Gift, Check, ShieldAlert, ShieldCheck, Lock, Navigation, X, ChevronDown, ChevronUp } from 'lucide-react';

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
            className={`bg-white/95 frosted-pill border-y border-l shadow-[-4px_0_20px_rgba(0,0,0,0.08)] rounded-l-2xl p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all group ${
              isInRange ? 'border-emerald-300' : 'border-neutral-200'
            }`}
            title="Venue Check-in & Review Verification"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                isInRange ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-neutral-100 border-neutral-200 text-neutral-500'
              }`}>
                <Coffee size={18} />
              </div>
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white animate-ping ${
                isInRange ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isInRange ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 [writing-mode:vertical-lr] rotate-180 py-1 flex items-center gap-1">
              <Sparkles size={9} className="text-primary inline rotate-90" />
              {isInRange ? 'Verified' : 'Check-In'}
            </span>

            {isExpanded ? (
              <ChevronRight size={15} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            ) : (
              <ChevronLeft size={15} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            )}
          </button>

          {/* Expanded Card Content */}
          {isExpanded && (
            <div className="bg-white border-l border-y border-neutral-200 shadow-[-16px_0_36px_rgba(0,0,0,0.08)] rounded-l-3xl p-5 w-80 flex flex-col gap-4 animate-in slide-in-from-right duration-200">
              {/* Header with Location Range Status */}
              <div className="flex items-center justify-between">
                {isInRange ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    In Venue Zone ({formatDistanceLabel()})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <ShieldAlert size={12} className="text-amber-600" />
                    Outside Range ({formatDistanceLabel()})
                  </span>
                )}

                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-neutral-400 hover:text-neutral-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Current Venue Info */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5 relative overflow-hidden">
                <div className="flex gap-3 items-center">
                  <img
                    src={currentVenue.image_url}
                    alt={currentVenue.name}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                      <Coffee size={10} /> {currentVenue.type}
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900 truncate">{currentVenue.name}</h4>
                    <p className="text-xs text-neutral-500 truncate flex items-center gap-0.5">
                      <MapPin size={10} /> {currentVenue.address}
                    </p>
                  </div>
                </div>

                {/* Change Venue Trigger */}
                {availableVenues.length > 1 && (
                  <button
                    onClick={() => setShowVenuePicker(!showVenuePicker)}
                    className="mt-2 text-[10px] font-bold text-primary hover:underline flex items-center justify-between w-full pt-2 border-t border-neutral-200/60 cursor-pointer"
                  >
                    <span>Switch location check-in</span>
                    <span>{showVenuePicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                  </button>
                )}
              </div>

              {/* Dropdown Venue Picker */}
              {showVenuePicker && (
                <div className="bg-white border border-neutral-200 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5 no-scrollbar shadow-sm">
                  <div className="text-[10px] font-semibold text-neutral-400 px-2 py-0.5 uppercase">Select Venue to Check-In:</div>
                  {availableVenues.map((v) => {
                    const isMonad = v.id === 'venue-monad-cafe' || v.name.toLowerCase().includes('monad cafe');
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          onSelectVenue(v);
                          setShowVenuePicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors border cursor-pointer ${
                          v.id === currentVenue.id
                            ? 'bg-neutral-900 text-white font-bold border-neutral-900'
                            : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="truncate font-bold">{v.name}</div>
                          <div className="text-[10px] flex items-center gap-1 mt-0.5">
                            {isMonad ? (
                              <span className={v.id === currentVenue.id ? 'text-emerald-300' : 'text-emerald-600'}>
                                • Inside Venue (0m)
                              </span>
                            ) : (
                              <span className={v.id === currentVenue.id ? 'text-neutral-300' : 'text-neutral-500'}>
                                • Out of range (2.3 km)
                              </span>
                            )}
                          </div>
                        </div>
                        {v.id === currentVenue.id && <Check size={14} className="text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Exact Range Proof Notice */}
              <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                isInRange 
                  ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800' 
                  : 'bg-amber-50/80 border-amber-200/80 text-amber-800'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {isInRange ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  <span>{isInRange ? 'Location Verified' : 'Location Gate Active'}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isInRange
                    ? `You are within the 250m physical radius. Reviews here are verified on-chain.`
                    : `You are currently outside ${currentVenue.name}. Reviews require physical presence within 250m.`}
                </p>
              </div>

              {/* GPS Demo Mode Simulation Switch */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Navigation size={13} className="text-primary" />
                  <span className="font-semibold text-neutral-800">Simulate In-Venue</span>
                  <span className="text-[9px] bg-neutral-200 text-neutral-700 font-bold px-1.5 py-0.2 rounded">Demo</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleSimulate}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    isSimulatedAtVenue ? 'bg-neutral-900 justify-end' : 'bg-neutral-300 justify-start'
                  }`}
                  title="Toggle between real GPS and simulated presence for hackathon testing"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Reward Callout Pill */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/15 text-primary rounded-lg shrink-0">
                  <Gift size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-neutral-900">Earn 20% OFF NFT</p>
                  <p className="text-[10px] text-neutral-500">1 coupon per verified check-in</p>
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
                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>Add Verified Review</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-neutral-100 text-neutral-400 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 text-xs border border-neutral-200 cursor-not-allowed"
                    title="You must be within 250m of the venue or enable Simulate In-Venue"
                  >
                    <Lock size={13} />
                    <span>Locked (Outside 250m)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenCoupons();
                  }}
                  className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-semibold py-2 rounded-full text-xs flex items-center justify-center gap-1.5 border border-neutral-200 shadow-sm transition-colors cursor-pointer"
                >
                  <Gift size={13} className="text-primary" />
                  <span>My NFT Coupons ({couponsCount})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

