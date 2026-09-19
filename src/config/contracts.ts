// Deployed Contract Addresses on Monad Testnet (from README / Monad Deployments)
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x93336A3dBC919f15f15Da2133A99C7b687523525") as `0x${string}`;
export const MOCK_USDC_ADDRESS = (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || "0x43398FC6734151E9477f61605d8C88d05B93EFf0") as `0x${string}`;

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
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const REVIEW_COUPON_NFT_ADDRESS = (process.env.NEXT_PUBLIC_REVIEW_COUPON_NFT_ADDRESS || "0x50a285f62c994c5cba4d3df13960220249ee0bed") as `0x${string}`;

export const REVIEW_COUPON_NFT_ABI = [
  {
    name: "coupon",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_recipient", type: "address" },
      { name: "_venueId", type: "string" },
      { name: "_venueName", type: "string" },
      { name: "_discountPercent", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mintCoupon",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_recipient", type: "address" },
      { name: "_venueId", type: "string" },
      { name: "_venueName", type: "string" },
      { name: "_discountPercent", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasCoupon",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getCoupon",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "recipient", type: "address" },
          { name: "venueId", type: "string" },
          { name: "venueName", type: "string" },
          { name: "discountPercent", type: "uint8" },
          { name: "redeemed", type: "bool" },
          { name: "mintedAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_addr", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "CouponMinted",
    type: "event",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "venueId", type: "string", indexed: false },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "discountPercent", type: "uint8", indexed: false },
    ],
  },
] as const;

