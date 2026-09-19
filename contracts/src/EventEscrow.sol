// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC20 interface for the stablecoin used in Escrow.
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title EventEscrow
 * @dev The core state machine for Gen Z Group Events.
 * Handles demand aggregation, pledging via stablecoins, auto-locking, and refunds.
 */
contract EventEscrow {
    enum EventState { Bidding, Pledging, Locked, Completed, Disputed, Refunded }

    struct GroupEvent {
        address organizer;
        uint256 targetHeadcount;
        uint256 currentPledges;
        uint256 pricePerHead;
        uint256 deadline;
        EventState state;
        // Note: hasPledged mapping is kept separate to avoid nested mapping inside a struct returned by public getter
    }

    // ID counter
    uint256 public nextEventId;

    // Core mappings
    mapping(uint256 => GroupEvent) public events;
    mapping(uint256 => mapping(address => bool)) public hasPledged;

    // Stablecoin used for pledges (e.g. USDC on Monad)
    IERC20 public stablecoin;

    // Events
    event EventCreated(uint256 indexed eventId, address indexed organizer, uint256 price, uint256 targetHeadcount);
    event Pledged(uint256 indexed eventId, address indexed member);
    event EventLocked(uint256 indexed eventId);
    event EventRefunded(uint256 indexed eventId);

    constructor(address _stablecoinAddress) {
        stablecoin = IERC20(_stablecoinAddress);
    }

    /**
     * @dev Called when a bid wins and the community creates the actual escrow instance.
     */
    function createEvent(
        address _organizer, 
        uint256 _pricePerHead, 
        uint256 _targetHeadcount, 
        uint256 _durationSeconds
    ) external returns (uint256) {
        uint256 eventId = nextEventId++;
        
        GroupEvent memory newEvent = GroupEvent({
            organizer: _organizer,
            targetHeadcount: _targetHeadcount,
            currentPledges: 0,
            pricePerHead: _pricePerHead,
            deadline: block.timestamp + _durationSeconds,
            state: EventState.Pledging
        });

        events[eventId] = newEvent;

        emit EventCreated(eventId, _organizer, _pricePerHead, _targetHeadcount);
        return eventId;
    }

    /**
     * @dev Members pledge to an event by transferring stablecoins into this contract.
     */
    function pledge(uint256 _eventId) external {
        GroupEvent storage e = events[_eventId];
        require(e.state == EventState.Pledging, "Escrow: Not in pledging phase");
        require(block.timestamp < e.deadline, "Escrow: Pledging deadline has passed");
        require(!hasPledged[_eventId][msg.sender], "Escrow: You have already pledged");

        // Transfer stablecoin from user to this contract
        // MUST approve this contract first in the frontend!
        require(stablecoin.transferFrom(msg.sender, address(this), e.pricePerHead), "Escrow: Stablecoin transfer failed");

        hasPledged[_eventId][msg.sender] = true;
        e.currentPledges++;
        
        emit Pledged(_eventId, msg.sender);

        // Auto-lock logic: If we hit the threshold, the event is secured.
        if (e.currentPledges >= e.targetHeadcount) {
            e.state = EventState.Locked;
            // Note: In MVP, we might release the 30% tranche to the organizer right here.
            emit EventLocked(_eventId);
        }
    }

    /**
     * @dev Automatically triggers a refund state if the threshold was missed by the deadline.
     */
    function triggerRefund(uint256 _eventId) external {
        GroupEvent storage e = events[_eventId];
        require(e.state == EventState.Pledging, "Escrow: Cannot refund in this state");
        require(block.timestamp >= e.deadline, "Escrow: Deadline has not passed yet");
        require(e.currentPledges < e.targetHeadcount, "Escrow: Threshold was met, event should lock");
        
        e.state = EventState.Refunded;
        emit EventRefunded(_eventId);
    }

    /**
     * @dev Allows a user to claim their refund if the event failed to reach its threshold.
     */
    function claimRefund(uint256 _eventId) external {
        GroupEvent storage e = events[_eventId];
        require(e.state == EventState.Refunded, "Escrow: Event is not in refunded state");
        require(hasPledged[_eventId][msg.sender], "Escrow: You did not pledge");

        hasPledged[_eventId][msg.sender] = false; // Prevent re-entrancy

        require(stablecoin.transfer(msg.sender, e.pricePerHead), "Escrow: Refund transfer failed");
    }
}
