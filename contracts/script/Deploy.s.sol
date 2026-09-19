// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VenueRegistry.sol";
import "../src/EventEscrow.sol";
import "../src/AttendanceBadge.sol";

contract DeployScript is Script {
    function run() external {
        // Retrieve private key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Mock Stablecoin address for Monad Testnet (can be updated later)
        address mockStablecoin = address(0x1234567890123456789012345678901234567890);
        uint256 onboardingFee = 0.01 ether; // 0.01 MON

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Venue Registry
        VenueRegistry registry = new VenueRegistry(onboardingFee);
        console.log("VenueRegistry deployed to:", address(registry));

        // 2. Deploy Event Escrow
        EventEscrow escrow = new EventEscrow(mockStablecoin);
        console.log("EventEscrow deployed to:", address(escrow));

        // 3. Deploy Attendance Badge (Soulbound Token)
        AttendanceBadge badge = new AttendanceBadge();
        console.log("AttendanceBadge deployed to:", address(badge));

        vm.stopBroadcast();
    }
}
