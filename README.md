# Monad Web3 PWA: GenZ Demand & Discovery Platform

This project is a unified Web3 platform for Gen Z to coordinate group experiences, aggregate demand, and discover trusted venues—built on the **Monad Testnet**.

## The Vision
The platform serves two core functions:
1. **Venue Discovery & Reviews:** A curated directory of resorts, cafes, and fun places where communities can visit, review, and help peers make instant decisions without hopping between Google Maps and Instagram.
2. **Demand Aggregation & Escrow:** Students decide what they want to do, prove demand with money held in smart contract escrow, and organizers bid to deliver it. 

### Why Monad?
We use Monad for our financial and trust layer. Its high throughput and fast finality make it the perfect engine for handling fast pledges and venue onboarding fees, while keeping the user experience seamless.

## Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS v4
* **Styling:** Custom Obsidian Dark & Electric Lime Theme
* **Web3/Wallets:** Wagmi, Viem, MetaMask integration
* **Smart Contracts:** Solidity, Foundry (deployed on Monad Testnet)
* **Off-chain State:** Supabase / PostgreSQL (for images, reviews, and UI speed)

## Project Structure (Core Pages)
* `/` - **Landing Page:** Marketing page explaining the app and prompting MetaMask connection.
* `/home` - **Discovery Feed:** The curated Yelp-style feed of venues and their Vibe Ratings.
* `/communities` - **College Hubs:** Where verified students can join their specific college communities.
* `/events/[id]` - **The Escrow Loop:** The core engine where organizers bid, and users pledge funds into the smart contract.
* `/dashboard` - **Organizer Portal:** Where venues pay to get listed and organizers manage their bids.

## Getting Started

First, install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Smart Contract Development
To work on the Monad smart contracts, navigate to the `contracts` directory (assuming Foundry is installed):

```bash
cd contracts
forge build
forge test
```

## Team Workflow
Please see `tasks.md` in the root of this repository for a complete breakdown of Frontend (Track 1) and Backend/Web3 (Track 2) tasks.
