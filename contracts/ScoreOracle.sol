// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface ICredoScoreRegistry {
    function updateScore(address user, uint256 score, uint256 version) external;
    function batchUpdateScores(address[] calldata users, uint256[] calldata scores, uint256 version) external;
}

/**
 * @title ScoreOracle
 * @dev Oracle contract that accepts only cryptographically signed score updates
 * @notice This contract ensures score updates are authenticated and prevents unauthorized modifications
 */
contract ScoreOracle is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    // Registry contract interface
    ICredoScoreRegistry public immutable scoreRegistry;
    
    // Authorized signers for score updates
    mapping(address => bool) public authorizedSigners;
    
    // Nonce tracking to prevent replay attacks
    mapping(address => uint256) public nonces;
    
    // Score update request structure
    struct ScoreUpdate {
        address user;
        uint256 score;
        uint256 version;
        uint256 nonce;
        uint256 deadline;
    }
    
    // Events
    event ScoreUpdateSubmitted(
        address indexed user,
        uint256 score,
        uint256 version,
        address indexed signer,
        uint256 nonce
    );
    
    event BatchScoreUpdateSubmitted(
        uint256 batchSize,
        uint256 version,
        address indexed signer,
        uint256 nonce
    );
    
    event SignerAuthorized(address indexed signer, bool authorized);
    
    // Custom errors
    error InvalidSignature();
    error ExpiredDeadline();
    error InvalidNonce();
    error UnauthorizedSigner();
    error InvalidScore();
    error InvalidUser();
    
    constructor(address _scoreRegistry) {
        require(_scoreRegistry != address(0), "Invalid registry address");
        scoreRegistry = ICredoScoreRegistry(_scoreRegistry);
        
        // Owner is automatically authorized signer
        authorizedSigners[msg.sender] = true;
    }
    
    /**
     * @dev Submit a signed score update
     * @param update The score update data
     * @param signature The cryptographic signature
     */
    function submitScoreUpdate(
        ScoreUpdate calldata update,
        bytes calldata signature
    ) external nonReentrant {
        // Validate basic parameters
        if (update.user == address(0)) revert InvalidUser();
        if (update.score > 1000) revert InvalidScore();
        if (block.timestamp > update.deadline) revert ExpiredDeadline();
        if (update.nonce != nonces[update.user]) revert InvalidNonce();
        
        // Verify signature
        address signer = _verifyScoreUpdateSignature(update, signature);
        if (!authorizedSigners[signer]) revert UnauthorizedSigner();
        
        // Update nonce to prevent replay
        nonces[update.user]++;
        
        // Submit to registry
        scoreRegistry.updateScore(update.user, update.score, update.version);
        
        emit ScoreUpdateSubmitted(
            update.user,
            update.score,
            update.version,
            signer,
            update.nonce
        );
    }
    
    /**
     * @dev Submit multiple signed score updates in batch
     * @param users Array of user addresses
     * @param scores Array of scores
     * @param version Algorithm version
     * @param batchNonce Nonce for this batch
     * @param deadline Expiration timestamp
     * @param signature Signature covering the entire batch
     */
    function submitBatchScoreUpdate(
        address[] calldata users,
        uint256[] calldata scores,
        uint256 version,
        uint256 batchNonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        // Validate parameters
        require(users.length == scores.length, "Arrays length mismatch");
        require(users.length > 0 && users.length <= 100, "Invalid batch size");
        if (block.timestamp > deadline) revert ExpiredDeadline();
        if (batchNonce != nonces[msg.sender]) revert InvalidNonce();
        
        // Validate all scores and users
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == address(0)) revert InvalidUser();
            if (scores[i] > 1000) revert InvalidScore();
        }
        
        // Verify batch signature
        address signer = _verifyBatchUpdateSignature(
            users,
            scores,
            version,
            batchNonce,
            deadline,
            signature
        );
        if (!authorizedSigners[signer]) revert UnauthorizedSigner();
        
        // Update nonce
        nonces[msg.sender]++;
        
        // Submit batch to registry
        scoreRegistry.batchUpdateScores(users, scores, version);
        
        emit BatchScoreUpdateSubmitted(
            users.length,
            version,
            signer,
            batchNonce
        );
    }
    
    /**
     * @dev Verify signature for single score update
     */
    function _verifyScoreUpdateSignature(
        ScoreUpdate calldata update,
        bytes calldata signature
    ) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(
            "ScoreUpdate",
            update.user,
            update.score,
            update.version,
            update.nonce,
            update.deadline
        ));
        
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        if (signer == address(0)) revert InvalidSignature();
        return signer;
    }
    
    /**
     * @dev Verify signature for batch score update
     */
    function _verifyBatchUpdateSignature(
        address[] calldata users,
        uint256[] calldata scores,
        uint256 version,
        uint256 batchNonce,
        uint256 deadline,
        bytes calldata signature
    ) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(
            "BatchScoreUpdate",
            keccak256(abi.encodePacked(users)),
            keccak256(abi.encode(scores)),
            version,
            batchNonce,
            deadline
        ));
        
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        if (signer == address(0)) revert InvalidSignature();
        return signer;
    }
    
    /**
     * @dev Authorize or deauthorize a signer
     * @param signer The address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setSignerAuthorization(address signer, bool authorized) external onlyOwner {
        require(signer != address(0), "Invalid signer address");
        authorizedSigners[signer] = authorized;
        emit SignerAuthorized(signer, authorized);
    }
    
    /**
     * @dev Get the current nonce for a user (for signature generation)
     * @param user The user address
     * @return The current nonce
     */
    function getCurrentNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    /**
     * @dev Generate message hash for score update (for off-chain signing)
     * @param update The score update data
     * @return The message hash to sign
     */
    function getScoreUpdateHash(ScoreUpdate calldata update) external pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(
            "ScoreUpdate",
            update.user,
            update.score,
            update.version,
            update.nonce,
            update.deadline
        ));
        return hash.toEthSignedMessageHash();
    }
    
    /**
     * @dev Generate message hash for batch update (for off-chain signing)
     */
    function getBatchUpdateHash(
        address[] calldata users,
        uint256[] calldata scores,
        uint256 version,
        uint256 batchNonce,
        uint256 deadline
    ) external pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(
            "BatchScoreUpdate",
            keccak256(abi.encodePacked(users)),
            keccak256(abi.encode(scores)),
            version,
            batchNonce,
            deadline
        ));
        return hash.toEthSignedMessageHash();
    }
}