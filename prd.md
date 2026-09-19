# Product Requirements Document (PRD): GenZ Demand & Discovery Platform

## 1. Thesis
A unified platform for Gen Z to coordinate group experiences, aggregate demand, and discover trusted venues. 

The platform serves two core functions:
1. **Demand Aggregation & Escrow:** Students decide what they want to do, prove demand with money held in escrow, and organizers bid to deliver it.
2. **Venue Discovery & Reviews:** A curated directory of resorts, cafes, and fun places where communities can visit, review, and help peers make instant decisions without hopping between Google Maps and Instagram.

## 2. Problem
**For Group Events:** Demand is invisible, organizers guess, and trust is weak when collecting money.
**For Discovery:** Gen Z suffers from decision fatigue. To find out if a place has a good "vibe," they have to cross-reference Google Maps, Instagram, and TikTok. 
**For Venues:** Places struggle to reach highly concentrated college communities directly.

## 3. Target Users & Access Model
**Global Access:** The platform is open to everyone. Anyone can connect their MetaMask wallet and browse venues or public events.
**Private Communities (Colleges):** To join specific college communities, users must upload a photo of their college ID card for verification. 

*   **Member:** Connects wallet. Can browse venues, read reviews, and join public events.
*   **Verified Student:** Has verified ID. Can join private college communities, vote on bids, and pledge.
*   **Venue/Business:** Pays an onboarding fee to be listed on the discovery platform. Can act as an organizer for events.
*   **Organizer:** Event company or freelancer bidding on community requests.

## 4. Core Features

### Feature A: The Escrow Loop (Group Events)
1. **REQUEST:** Member posts an idea (e.g., rooftop movie night).
2. **INTEREST:** Members tap "I'm in" (soft demand).
3. **BIDS:** Verified organizers/venues submit priced proposals.
4. **VOTE & PLEDGE:** Members vote and pledge to the winning bid via **MetaMask**.
5. **THRESHOLD:** Minimum headcount reached by deadline? Yes → LOCK. No → auto-refund.
6. **EVENT & SETTLE:** Event happens, QR check-in, funds released via smart contract.

### Feature B: Venue Discovery & Reviews (The Vibe Check)
1. **ONBOARDING:** Resorts, cafes, and restaurants pay a listing fee to join the platform.
2. **DISCOVERY:** Users browse a curated, highly visual feed of venues (solving the GenZ problem of "where should we go?").
3. **COMMUNITY VISITS:** Communities can use the Escrow Loop (Feature A) to fund group trips to these specific venues.
4. **VERIFIED REVIEWS:** Only users who checked in via the platform can leave a "Vibe Rating" (Insane / Worth it / Mid). This creates high-trust reviews unlike easily faked Google reviews.

## 5. Scope for MVP
*   **Tech Stack:** Next.js (React).
*   **Wallet:** MetaMask integration.
*   **Design & Styling:** Premium, high-contrast dark mode (Obsidian Black) with Electric Lime/Neon Green accents. **Strictly NO purple gradients.**
*   **Auth & Communities:** Wallet login for all. ID upload form for College Community access.
*   **Venue Directory:** A discovery page listing onboarded venues with photos and verified vibe ratings.
*   **Event Escrow:** The core request -> bid -> pledge -> check-in loop.

## 6. Detailed Escrow Mechanics
*   **Bidding:** 5-day window. Organizers manually verified. Price cap of 25% over indicative budget.
*   **Vote:** 48 hours. One verified member, one vote. Simple majority.
*   **Pledge & Escrow:** 72-hour window. Lock happens when minimum viable headcount is reached at deadline. Missed threshold = full automatic refund. Overfunding capped at max headcount.
*   **Release Schedule:** 30% on Lock, 65% on Check-in clear (after 48h dispute window), 5% Platform fee.

## 7. Smart Contracts (Monad)
*   `EventEscrow.sol`: Manages pledges, threshold logic, milestone release, refunds.
*   `VenueRegistry.sol`: (NEW) Handles venue onboarding fees and verified listing status on-chain.
*   `AttendanceBadge.sol`: Soulbound NFT on check-in, which also acts as the "ticket" to leave a verified review.

## 8. Success Metrics (Hackathon)
One complete live on-chain cycle in the demo: request → bid → vote → pledge → lock → check-in → settle, plus one failed-threshold refund path.
