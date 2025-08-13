// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title CredoRegistry
 * @dev A smart contract for managing user reputation scores on the Credo platform
 * @notice This contract allows the owner to update reputation scores for users
 */
contract CredoRegistry {
    /**
     * @dev The address of the contract owner who has permission to update scores
     */
    address public owner;

    /**
     * @dev Mapping from user address to their reputation score
     * @notice Each address can have a score ranging from 0 to max uint256
     */
    mapping(address => uint256) public scores;

    /**
     * @dev Emitted when a user's score is updated
     * @param user The address of the user whose score was updated
     * @param score The new score value assigned to the user
     */
    event ScoreUpdated(address indexed user, uint256 score);

    /**
     * @dev Modifier to restrict function access to only the contract owner
     * @notice Reverts if called by any account other than the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Constructor that sets the deployer as the owner
     * @notice The owner has exclusive rights to update user scores
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Updates the reputation score for a specific user
     * @param user The address of the user whose score will be updated
     * @param score The new reputation score to assign to the user
     * @notice Only the contract owner can call this function
     * @notice Emits a ScoreUpdated event when successful
     */
    function updateScore(address user, uint256 score) external onlyOwner {
        scores[user] = score;
        emit ScoreUpdated(user, score);
    }

    /**
     * @dev Retrieves the reputation score for a specific user
     * @param user The address of the user to query
     * @return The reputation score of the specified user (0 if not set)
     * @notice This is a view function that doesn't modify state
     */
    function getScore(address user) external view returns (uint256) {
        return scores[user];
    }
}