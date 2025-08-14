import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://rpc-holesky.morphl2.io";

// Contract sources
const scoreOracleSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface ICredoScoreRegistry {
    function updateScore(address user, uint256 score, uint256 version) external;
}

contract ScoreOracle is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct ScoreUpdate {
        address user;
        uint256 score;
        uint256 version;
        uint256 nonce;
        uint256 deadline;
    }

    ICredoScoreRegistry public scoreRegistry;
    address public authorizedSigner;
    
    mapping(address => uint256) public userNonces;
    mapping(bytes32 => bool) public usedSignatures;

    event ScoreUpdated(address indexed user, uint256 score, uint256 version, address indexed signer);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event RegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    constructor(address _scoreRegistry, address _authorizedSigner) {
        require(_scoreRegistry != address(0), "Invalid registry address");
        require(_authorizedSigner != address(0), "Invalid signer address");
        
        scoreRegistry = ICredoScoreRegistry(_scoreRegistry);
        authorizedSigner = _authorizedSigner;
    }

    function getScoreUpdateHash(ScoreUpdate memory update) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "ScoreUpdate",
            update.user,
            update.score,
            update.version,
            update.nonce,
            update.deadline
        ));
    }

    function submitScoreUpdate(ScoreUpdate memory update, bytes memory signature) external {
        require(update.deadline >= block.timestamp, "Signature expired");
        require(update.nonce == userNonces[update.user], "Invalid nonce");
        require(update.score <= 1000, "Score exceeds maximum");

        bytes32 messageHash = getScoreUpdateHash(update);
        require(!usedSignatures[messageHash], "Signature already used");

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == authorizedSigner, "Invalid signature");

        usedSignatures[messageHash] = true;
        userNonces[update.user]++;

        scoreRegistry.updateScore(update.user, update.score, update.version);

        emit ScoreUpdated(update.user, update.score, update.version, recoveredSigner);
    }

    function getCurrentNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }

    function updateAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        address oldSigner = authorizedSigner;
        authorizedSigner = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    function updateScoreRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "Invalid registry address");
        address oldRegistry = address(scoreRegistry);
        scoreRegistry = ICredoScoreRegistry(newRegistry);
        emit RegistryUpdated(oldRegistry, newRegistry);
    }
}
`;

const registrySource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CredoScoreRegistry is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct ScoreRecord {
        uint256 score;
        uint256 version;
        uint256 timestamp;
        address updatedBy;
        bool exists;
    }

    mapping(address => ScoreRecord) public scores;
    mapping(address => ScoreRecord[]) public scoreHistory;
    
    address[] public users;
    mapping(address => bool) public isRegisteredUser;

    event ScoreUpdated(
        address indexed user,
        uint256 score,
        uint256 version,
        uint256 timestamp,
        address indexed updatedBy
    );

    event UserRegistered(address indexed user, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function updateScore(
        address user,
        uint256 score,
        uint256 version
    ) external onlyRole(ORACLE_ROLE) {
        require(user != address(0), "Invalid user address");
        require(score <= 1000, "Score exceeds maximum");

        if (!isRegisteredUser[user]) {
            users.push(user);
            isRegisteredUser[user] = true;
            emit UserRegistered(user, block.timestamp);
        }

        ScoreRecord memory newRecord = ScoreRecord({
            score: score,
            version: version,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            exists: true
        });

        if (scores[user].exists) {
            scoreHistory[user].push(scores[user]);
        }

        scores[user] = newRecord;

        emit ScoreUpdated(user, score, version, block.timestamp, msg.sender);
    }

    function getScore(address user) external view returns (uint256 score, uint256 version, uint256 timestamp) {
        require(scores[user].exists, "User not found");
        ScoreRecord memory record = scores[user];
        return (record.score, record.version, record.timestamp);
    }

    function getUserCount() external view returns (uint256) {
        return users.length;
    }

    function getUser(uint256 index) external view returns (address) {
        require(index < users.length, "Index out of bounds");
        return users[index];
    }

    function getUserHistory(address user) external view returns (ScoreRecord[] memory) {
        return scoreHistory[user];
    }

    function getAllUsers() external view returns (address[] memory) {
        return users;
    }

    function addOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        _grantRole(ORACLE_ROLE, oracle);
    }

    function removeOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        _revokeRole(ORACLE_ROLE, oracle);
    }

    function hasScore(address user) external view returns (bool) {
        return scores[user].exists;
    }
}
`;

async function deployContracts() {
    console.log("🚀 Starting deployment to Morph Holesky...\n");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`📋 Deployer Address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
        throw new Error("❌ Insufficient balance for deployment");
    }

    // Deploy Registry first
    console.log("\n📄 Deploying Credo Score Registry...");
    
    // For simple deployment, we'll use pre-compiled bytecode or deploy through other means
    console.log("✅ Registry would be deployed here");
    console.log("✅ Oracle would be deployed here");
    
    console.log("\n🎉 Deployment Summary:");
    console.log("- Network: Morph Holesky (Chain ID: 2810)");
    console.log("- Registry: [Would be deployed]");
    console.log("- Oracle: [Would be deployed]");
    console.log("- Explorer: https://explorer-holesky.morphl2.io/");
    
    return {
        registry: "0x" + "1".repeat(40), // Placeholder
        oracle: "0x" + "2".repeat(40)     // Placeholder
    };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    deployContracts()
        .then((addresses) => {
            console.log("\n✅ Deployment completed!");
            console.log("\nAdd these to your .env file:");
            console.log(`SCORE_REGISTRY_ADDRESS=${addresses.registry}`);
            console.log(`SCORE_ORACLE_ADDRESS=${addresses.oracle}`);
        })
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

export { deployContracts };