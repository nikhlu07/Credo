// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CredoScoreRegistry
 * @dev Enhanced registry for storing Credo Scores with metadata and access control
 * @notice This contract stores reputation scores with timestamps and version tracking
 */
contract CredoScoreRegistry is Ownable, ReentrancyGuard {
    
    struct ScoreData {
        uint256 score;           // Credo Score (0-1000)
        uint256 lastUpdated;     // Timestamp of last update
        uint256 version;         // Score algorithm version
        bool isActive;           // Whether the score is currently active
    }
    
    // Mapping from user address to their score data
    mapping(address => ScoreData) public scores;
    
    // Mapping to track authorized oracles
    mapping(address => bool) public authorizedOracles;
    
    // Events
    event ScoreUpdated(
        address indexed user, 
        uint256 score, 
        uint256 version, 
        uint256 timestamp,
        address indexed oracle
    );
    
    event OracleAuthorized(address indexed oracle, bool authorized);
    event ScoreDeactivated(address indexed user);
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == owner(), "Not authorized oracle");
        _;
    }
    
    modifier validScore(uint256 _score) {
        require(_score <= 1000, "Score must be <= 1000");
        _;
    }
    
    constructor() {
        // Owner is automatically authorized
        authorizedOracles[msg.sender] = true;
    }
    
    /**
     * @dev Updates the Credo Score for a specific user
     * @param user The address of the user whose score will be updated
     * @param score The new Credo Score (0-1000)
     * @param version The algorithm version used to calculate the score
     */
    function updateScore(
        address user, 
        uint256 score, 
        uint256 version
    ) 
        external 
        onlyAuthorizedOracle 
        validScore(score) 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        
        scores[user] = ScoreData({
            score: score,
            lastUpdated: block.timestamp,
            version: version,
            isActive: true
        });
        
        emit ScoreUpdated(user, score, version, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Batch update scores for multiple users (gas efficient)
     * @param users Array of user addresses
     * @param _scores Array of scores corresponding to users
     * @param version Algorithm version used
     */
    function batchUpdateScores(
        address[] calldata users,
        uint256[] calldata _scores,
        uint256 version
    ) 
        external 
        onlyAuthorizedOracle 
        nonReentrant 
    {
        require(users.length == _scores.length, "Arrays length mismatch");
        require(users.length <= 100, "Batch size too large");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            require(_scores[i] <= 1000, "Score must be <= 1000");
            
            scores[users[i]] = ScoreData({
                score: _scores[i],
                lastUpdated: block.timestamp,
                version: version,
                isActive: true
            });
            
            emit ScoreUpdated(users[i], _scores[i], version, block.timestamp, msg.sender);
        }
    }
    
    /**
     * @dev Retrieves the Credo Score data for a specific user
     * @param user The address of the user to query
     * @return score The user's Credo Score
     * @return lastUpdated Timestamp of last update
     * @return version Algorithm version
     * @return isActive Whether the score is active
     */
    function getScoreData(address user) 
        external 
        view 
        returns (
            uint256 score, 
            uint256 lastUpdated, 
            uint256 version, 
            bool isActive
        ) 
    {
        ScoreData memory data = scores[user];
        return (data.score, data.lastUpdated, data.version, data.isActive);
    }
    
    /**
     * @dev Retrieves just the score for a specific user (backward compatibility)
     * @param user The address of the user to query
     * @return The user's Credo Score (0 if not set or inactive)
     */
    function getScore(address user) external view returns (uint256) {
        ScoreData memory data = scores[user];
        return data.isActive ? data.score : 0;
    }
    
    /**
     * @dev Deactivates a user's score (doesn't delete, just marks inactive)
     * @param user The address of the user whose score to deactivate
     */
    function deactivateScore(address user) external onlyAuthorizedOracle {
        require(scores[user].isActive, "Score already inactive");
        scores[user].isActive = false;
        emit ScoreDeactivated(user);
    }
    
    /**
     * @dev Authorizes or deauthorizes an oracle
     * @param oracle The address of the oracle
     * @param authorized Whether to authorize or deauthorize
     */
    function setOracleAuthorization(address oracle, bool authorized) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }
    
    /**
     * @dev Checks if a score is stale (older than specified time)
     * @param user The user address to check
     * @param maxAge Maximum age in seconds
     * @return Whether the score is stale
     */
    function isScoreStale(address user, uint256 maxAge) external view returns (bool) {
        ScoreData memory data = scores[user];
        if (!data.isActive || data.lastUpdated == 0) {
            return true;
        }
        return (block.timestamp - data.lastUpdated) > maxAge;
    }
    
    /**
     * @dev Gets the total number of active scores (for analytics)
     * @param users Array of addresses to check
     * @return count Number of active scores
     */
    function getActiveScoreCount(address[] calldata users) external view returns (uint256 count) {
        for (uint256 i = 0; i < users.length; i++) {
            if (scores[users[i]].isActive) {
                count++;
            }
        }
    }
}