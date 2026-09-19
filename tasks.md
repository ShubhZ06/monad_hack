# Monad Hackathon: Task Delegation

This document splits the MVP build into two distinct tracks. 

---

## 🛠️ Track 1: Frontend & UX (Developer A)
**Focus:** Next.js pages, Tailwind CSS styling, Wagmi/MetaMask integration, and the overall user journey.

### 1. Design System & Layout
- [x] Configure Tailwind CSS (v4) with the **Obsidian Dark & Electric Lime** theme.
- [x] Build the Landing Page (`/`).
- [ ] Build reusable UI components: Glassmorphism Cards, Neon Buttons, Modals.
- [ ] Set up the main Next.js layout (`layout.tsx`) including a global Navigation bar.

### 2. Wallet & Wagmi Integration
- [ ] Configure Wagmi and Viem to explicitly use the MetaMask (`injected`) connector.
- [ ] Create a robust `<ConnectWallet />` button component that handles network switching to Monad Testnet.
- [ ] Create UI states for loading, pending transactions, and confirmed transactions.

### 3. Core Pages (UI Implementation)
- [ ] **Discovery Feed (`/home`):** Build the feed of venue cards with images and Vibe Ratings (seen after login).
- [ ] **Venue Detail (`/venues/[id]`):** Page showing venue details and a "Propose Trip" button.
- [ ] **Community Hub (`/communities/[id]`):** Feed of active event requests for a specific college.
- [ ] **Event Escrow (`/events/[id]`):** The interactive page where users vote on bids and pledge funds.
- [ ] **Organizer Dashboard (`/dashboard`):** A portal for venues to pay onboarding fees and submit bids.

---

## ⚙️ Track 2: Web3 & Backend (Developer B)
**Focus:** Monad Smart Contracts, Postgres Database (off-chain state), and API Routes.

### 1. Smart Contracts (Foundry + Monad)
- [ ] **`VenueRegistry.sol`**: Write contract to handle venue onboarding fees (accepting USDC/Native token). Include a mapping of verified venues.
- [ ] **`EventEscrow.sol`**: Write the core state machine for group events. Needs functions for: `pledge()`, `lock()`, `refund()`, and `releaseFunds()`.
- [ ] **`AttendanceBadge.sol`**: Write a simple ERC-721/ERC-1155 Soulbound token that mints to an address upon successful check-in.
- [ ] **Testing & Deploy:** Write Foundry tests (`forge test`) for the escrow threshold logic and deploy to Monad Testnet.

### 2. Off-Chain Database (Supabase / Postgres)
*Why? We can't store images, long reviews, and request drafts on-chain—it's too expensive and slow.*
- [ ] Set up DB schema for **Users** (wallet address, college ID status).
- [ ] Set up DB schema for **Venues** (images, description, off-chain vibe ratings).
- [ ] Set up DB schema for **Event Requests** (title, description, soft-interest count).

### 3. Next.js API Routes (Backend Logic)
- [ ] Create `/api/verify-id`: A mock endpoint to handle college ID photo uploads and approve users.
- [ ] Create `/api/venues`: Fetch the list of venues for the Discovery Feed.
- [ ] Create `/api/events`: Endpoints to create a new event request and register "Soft Interest".

---

## 🤝 Integration Points
- Developer B provides the ABI (Application Binary Interface) and Contract Addresses to Developer A.
- Developer A uses `wagmi` hooks (`useWriteContract`, `useReadContract`) to connect the UI buttons to Developer B's smart contracts.
