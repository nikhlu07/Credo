// Test contract integration - run with: node test-contracts.js
const { ethers } = require("ethers");
require("dotenv").config();

async function testContracts() {
  console.log("🧪 Testing Contract Integration...\n");

  if (!process.env.SCORE_ORACLE_ADDRESS || !process.env.SCORE_REGISTRY_ADDRESS) {
    console.log("❌ Please deploy contracts first and update .env");
    console.log("📋 Required: SCORE_ORACLE_ADDRESS and SCORE_REGISTRY_ADDRESS");
    process.exit(1);
  }

  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://rpc-holesky.morphl2.io");
    const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);

    // Contract ABIs (simplified)
    const oracleABI = [
      "function getCurrentNonce(address user) view returns (uint256)",
      "function authorizedSigners(address) view returns (bool)"
    ];

    const registryABI = [
      "function getScore(address user) view returns (uint256)",
      "function scores(address) view returns (uint256)"
    ];

    // Contract instances
    const oracle = new ethers.Contract(process.env.SCORE_ORACLE_ADDRESS, oracleABI, provider);
    const registry = new ethers.Contract(process.env.SCORE_REGISTRY_ADDRESS, registryABI, provider);

    console.log("📋 Registry Address:", process.env.SCORE_REGISTRY_ADDRESS);
    console.log("🔮 Oracle Address:", process.env.SCORE_ORACLE_ADDRESS);
    console.log("👤 Wallet Address:", wallet.address);

    // Test oracle
    console.log("\n🔮 Testing Oracle...");
    const nonce = await oracle.getCurrentNonce(wallet.address);
    console.log("✅ Current nonce:", nonce.toString());

    const isAuthorized = await oracle.authorizedSigners(wallet.address);
    console.log("✅ Is authorized signer:", isAuthorized);

    // Test registry
    console.log("\n📋 Testing Registry...");
    const score = await registry.getScore(wallet.address);
    console.log("✅ Current score:", score.toString());

    console.log("\n🎉 Contract integration test complete!");
    console.log("🔗 View contracts on explorer:");
    console.log("Registry:", `https://explorer-holesky.morphl2.io/address/${process.env.SCORE_REGISTRY_ADDRESS}`);
    console.log("Oracle:", `https://explorer-holesky.morphl2.io/address/${process.env.SCORE_ORACLE_ADDRESS}`);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Common issues:");
    console.log("- Contracts not deployed yet");
    console.log("- Wrong network or RPC");
    console.log("- Invalid private key format");
  }
}

testContracts();