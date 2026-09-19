// Deployed Contract Addresses on Monad Testnet
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;
export const MOCK_USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS as `0x${string}`;

// EventEscrow ABI — only the functions/events we use in the frontend
export const ESCROW_ABI = [
  // Read: get event details
  {
    name: "events",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [
      { name: "organizer", type: "address" },
      { name: "targetHeadcount", type: "uint256" },
      { name: "currentPledges", type: "uint256" },
      { name: "pricePerHead", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "state", type: "uint8" },
    ],
  },
  // Read: check if an address has pledged
  {
    name: "hasPledged",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // Write: pledge to an event
  {
    name: "pledge",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_eventId", type: "uint256" }],
    outputs: [],
  },
  // Event emitted when someone pledges
  {
    name: "Pledged",
    type: "event",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
    ],
  },
  // Event emitted when threshold is hit
  {
    name: "EventLocked",
    type: "event",
    inputs: [{ name: "eventId", type: "uint256", indexed: true }],
  },
] as const;

// MockUSDC ABI — just approve
export const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
