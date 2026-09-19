// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReviewCouponNFT
 * @dev ERC721 NFT minted as a discount coupon when a user posts a verified, 
 * geo-locked review on the Monad Discovery platform.
 * 
 * Key properties:
 * - One coupon per wallet per venue (enforced on-chain)
 * - Coupons can be redeemed (burned) by the venue owner or platform
 * - Metadata is stored on-chain in the token for transparency
 */
contract ReviewCouponNFT {
    string public name = "Monad Review Coupon";
    string public symbol = "MVIBE";

    uint256 public nextTokenId;
    address public owner; // platform deployer / minter

    struct CouponData {
        address recipient;
        string venueId;
        string venueName;
        uint8 discountPercent;
        bool redeemed;
        uint256 mintedAt;
    }

    // token ID → coupon metadata
    mapping(uint256 => CouponData) public coupons;

    // wallet → venue ID → has coupon (anti-farming)
    mapping(address => mapping(string => bool)) public hasCoupon;

    // Standard ERC721 mappings
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CouponMinted(address indexed recipient, string venueId, uint256 tokenId, uint8 discountPercent);
    event CouponRedeemed(uint256 indexed tokenId, address indexed by);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ReviewCouponNFT: Only minter can call this");
        _;
    }

    /**
     * @dev Mint a discount coupon NFT to a reviewer.
     * Called by the backend API after verifying the review is genuine and geo-locked.
     * Enforces one coupon per wallet per venue.
     */
    function _mintCouponInternal(
        address _recipient,
        string memory _venueId,
        string memory _venueName,
        uint8 _discountPercent
    ) internal returns (uint256) {
        require(_recipient != address(0), "Cannot mint to zero address");
        require(!hasCoupon[_recipient][_venueId], "ReviewCouponNFT: Wallet already has a coupon for this venue");
        require(_discountPercent > 0 && _discountPercent <= 100, "Invalid discount percent");

        uint256 tokenId = nextTokenId++;

        coupons[tokenId] = CouponData({
            recipient: _recipient,
            venueId: _venueId,
            venueName: _venueName,
            discountPercent: _discountPercent,
            redeemed: false,
            mintedAt: block.timestamp
        });

        hasCoupon[_recipient][_venueId] = true;
        _owners[tokenId] = _recipient;
        _balances[_recipient] += 1;

        emit Transfer(address(0), _recipient, tokenId);
        emit CouponMinted(_recipient, _venueId, tokenId, _discountPercent);

        return tokenId;
    }

    /**
     * @dev Convenient method so block explorers (MonadVision) display the method as "Coupon" (matching "Pledge")
     */
    function coupon(
        address _recipient,
        string calldata _venueId,
        string calldata _venueName,
        uint8 _discountPercent
    ) external onlyOwner returns (uint256) {
        return _mintCouponInternal(_recipient, _venueId, _venueName, _discountPercent);
    }

    /**
     * @dev Standard mint function
     */
    function mintCoupon(
        address _recipient,
        string calldata _venueId,
        string calldata _venueName,
        uint8 _discountPercent
    ) external onlyOwner returns (uint256) {
        return _mintCouponInternal(_recipient, _venueId, _venueName, _discountPercent);
    }


    /**
     * @dev Mark a coupon as redeemed (used at the venue).
     * Only the platform owner can call this (venue presents QR, platform verifies).
     */
    function redeemCoupon(uint256 _tokenId) external onlyOwner {
        require(_owners[_tokenId] != address(0), "Token does not exist");
        require(!coupons[_tokenId].redeemed, "Coupon already redeemed");

        coupons[_tokenId].redeemed = true;
        emit CouponRedeemed(_tokenId, msg.sender);
    }

    /**
     * @dev Returns all coupon data for a token ID.
     */
    function getCoupon(uint256 _tokenId) external view returns (CouponData memory) {
        require(_owners[_tokenId] != address(0), "Token does not exist");
        return coupons[_tokenId];
    }

    function balanceOf(address _addr) external view returns (uint256) {
        require(_addr != address(0), "Zero address");
        return _balances[_addr];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Invalid token ID");
        return tokenOwner;
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_owners[tokenId] == from, "Not owner");
        require(to != address(0), "Zero address");
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
}
