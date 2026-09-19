// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AttendanceBadge
 * @dev A minimal Soulbound Token (SBT) implementation for Event Attendance.
 * These tokens are non-transferable and serve as on-chain proof of attending a GenZ event.
 */
contract AttendanceBadge {
    string public name = "Monad Vibe Badge";
    string public symbol = "VIBE";

    uint256 public nextTokenId;
    address public owner;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Attended(address indexed user, uint256 indexed eventId, uint256 tokenId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AttendanceBadge: Only owner can mint");
        _;
    }

    /**
     * @dev Mints a new Soulbound Attendance Badge. 
     * Only the platform owner (or eventually the EventEscrow contract) can mint this when a user checks in.
     */
    function mint(address to, uint256 eventId) external onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = nextTokenId++;
        
        _balances[to] += 1;
        _owners[tokenId] = to;

        // Emit standard ERC721 Transfer event for indexers (from 0x0 means mint)
        emit Transfer(address(0), to, tokenId);
        
        // Emit custom Attended event
        emit Attended(to, eventId, tokenId);

        return tokenId;
    }

    /**
     * @dev Overrides standard transfer to block movement, making it Soulbound.
     */
    function transferFrom(address, address, uint256) external pure {
        revert("AttendanceBadge: Badges are Soulbound and non-transferable");
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert("AttendanceBadge: Badges are Soulbound and non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert("AttendanceBadge: Badges are Soulbound and non-transferable");
    }

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "Address zero is not a valid owner");
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Invalid token ID");
        return tokenOwner;
    }
}
