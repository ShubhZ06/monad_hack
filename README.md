# FoMo — Social Discovery & Group Escrow on Monad

**FoMo** is a mobile-first social venue discovery and trustless group experience platform built on the **Monad Testnet**. 

Combining an Instagram-inspired editorial discovery feed with Web3 smart contracts, FoMo allows communities to explore curated venues, verify physical check-ins, earn onchain 20% discount NFT vouchers, and pool funds for group trips through trustless escrow.

---

## ⚡ Smart Contracts (Monad Testnet — Chain ID: 10143)

The FoMo platform integrates three core production smart contracts deployed on the Monad Testnet:

### 1. `EventEscrow.sol` (Group Event & Milestone Escrow)
- **Contract Address:** [`0x93336A3dBC919f15f15Da2133A99C7b687523525`](https://testnet.monadexplorer.com/address/0x93336A3dBC919f15f15Da2133A99C7b687523525)
- **Standard:** Custom Escrow / State Machine
- **Purpose & Architecture:**
  - Powers community demand aggregation for college trips, afterparties, and group experiences.
  - Users lock funds into the contract to prove demand.
  - Organizers submit bids. When a bid is accepted and the target threshold is met, funds lock into milestone escrow.
  - Protects participants: if the minimum threshold isn't achieved or an event is disputed, automatic refunds are issued back to participants.

### 2. `ReviewCouponNFT.sol` (ERC-721 Verified Review & Discount Voucher)
- **Contract Address:** [`0x50a285f62c994c5cba4d3df13960220249ee0bed`](https://testnet.monadexplorer.com/address/0x50a285f62c994c5cba4d3df13960220249ee0bed)
- **Standard:** ERC-721 (Non-Fungible Token with Onchain Metadata)
- **Purpose & Architecture:**
  - Rewards users with an exclusive 20% discount coupon NFT whenever they complete a GPS-verified check-in and post a photo review of a partner venue.
  - Includes anti-sybil and anti-farming protections (enforces 1 coupon per wallet per venue).
  - Encodes discount details, venue ID, timestamp, and metadata URI directly on the Monad blockchain.
  - Redeemable at venue checkout via the integrated FoMo Apple Wallet-style voucher drawer.

### 3. `MockUSDC.sol` (ERC-20 Testnet Payment Token)
- **Contract Address:** [`0x43398FC6734151E9477f61605d8C88d05B93EFf0`](https://testnet.monadexplorer.com/address/0x43398FC6734151E9477f61605d8C88d05B93EFf0)
- **Standard:** ERC-20 (Decimals: 6)
- **Purpose & Architecture:**
  - Provides stable pricing and currency mechanics for trip pledges and venue escrow without price volatility.
  - Used in tandem with `EventEscrow.sol` for token approvals and automated deposits.

*(Additional contracts in repository: `AttendanceBadge.sol` for Soulbound attendance credentials and `VenueRegistry.sol` for verified vendor staking).*

---

## 🎨 Design System: "Season Mix" & Instagram Ergonomics

- **Aesthetic:** Editorial Light Theme (Warm Linen `#faf8f5`, Rich Charcoal `#1a1a1a`, Warm Cream `#eee7dc`, and Sunset Coral `#ff533d`). No AI-slop neon or purple.
- **Typography:** Season Mix pairing Google Fonts **Playfair Display** (editorial serif headings) with **Plus Jakarta Sans** (crisp geometric sans body).
- **Icons:** 100% Vector Lucide React icons — zero emojis in UI controls.
- **Mobile-First Layout:**
  - **Live Stories Carousel:** Active venues with sunset story rings (`season-story-ring`) and real-time check-in counts.
  - **4:3 Media Post Cards:** Double-tap heart like interaction, location pills, and instant review triggers.
  - **iOS Frosted Dock:** Bottom navigation bar with glassmorphism blur and active indicator tabs.
  - **Voucher Wallet:** Apple Wallet style coupon cards with dashed perforations, QR codes, and block explorer links.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide React
- **Blockchain Layer:** Monad Testnet (RPC: `https://testnet-rpc.monad.xyz`)
- **Web3 Libraries:** Wagmi v3, Viem, TanStack Query
- **Smart Contract Tooling:** Solidity 0.8.20+, Foundry, Hardhat
- **Database & Storage:** Supabase (Venues, Reviews, Geospatial coordinates, Check-in photos)
- **Deployment:** Vercel

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/monad_hack.git
cd monad_hack
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the variables:
```env
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_SUPABASE_URL=https://magcqxjmblxmtamkblkg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TySVEogd8fmjpVH6vz1x2g_zDJkIzKa

# Monad Testnet Contract Addresses
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x43398FC6734151E9477f61605d8C88d05B93EFf0
NEXT_PUBLIC_ESCROW_ADDRESS=0x93336A3dBC919f15f15Da2133A99C7b687523525
NEXT_PUBLIC_REVIEW_COUPON_NFT_ADDRESS=0x50a285f62c994c5cba4d3df13960220249ee0bed

# Server-side automated NFT Minter key
DEPLOYER_PRIVATE_KEY=your_monad_testnet_private_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production / Vercel
```bash
npm run build
```
Tested with **0 errors** across all static and dynamic routes. Ready to deploy directly to Vercel.
