// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VenueRegistry
 * @dev Handles the onboarding of Venues (Cafes, Resorts, etc.) onto the platform.
 * Venues pay an onboarding fee in native Monad to become verified and appear in the Discovery Feed.
 */
contract VenueRegistry {
    address public owner;
    uint256 public onboardingFee;

    struct Venue {
        bool isVerified;
        uint256 joinedAt;
    }

    // Maps wallet address of the venue to their status
    mapping(address => Venue) public venues;

    event VenueOnboarded(address indexed venueAddress, uint256 feePaid);
    event FeeUpdated(uint256 newFee);

    constructor(uint256 _onboardingFee) {
        owner = msg.sender;
        onboardingFee = _onboardingFee;
    }

    /**
     * @dev Venues call this function and send the required onboarding fee.
     */
    function onboardVenue() external payable {
        require(msg.value == onboardingFee, "VenueRegistry: Incorrect fee provided");
        require(!venues[msg.sender].isVerified, "VenueRegistry: Venue already verified");

        venues[msg.sender] = Venue({
            isVerified: true,
            joinedAt: block.timestamp
        });

        emit VenueOnboarded(msg.sender, msg.value);
    }

    /**
     * @dev Allows the platform owner to withdraw collected onboarding fees.
     */
    function withdrawFees() external {
        require(msg.sender == owner, "VenueRegistry: Only owner");
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @dev Updates the required onboarding fee.
     */
    function updateOnboardingFee(uint256 _newFee) external {
        require(msg.sender == owner, "VenueRegistry: Only owner");
        onboardingFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @dev Helper for the frontend to easily check verification status.
     */
    function isVenueVerified(address _venue) external view returns (bool) {
        return venues[_venue].isVerified;
    }
}
