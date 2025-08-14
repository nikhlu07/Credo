// Manual deployment script - run with: node deploy-manual.js
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function deploy() {
  console.log("🚀 Manual Deployment to Morph Holesky...\n");

  // Check environment
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ Please set PRIVATE_KEY in .env file");
    process.exit(1);
  }

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://rpc-holesky.morphl2.io");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("📝 Deploying with account:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      console.log("❌ Insufficient balance! Need at least 0.01 ETH");
      console.log("🔗 Get Holesky ETH: https://holesky-faucet.pk910.de/");
      console.log("🌉 Bridge to Morph: https://bridge-holesky.morphl2.io/");
      process.exit(1);
    }

    // Read and compile contracts
    const registrySource = fs.readFileSync("./contracts/CredoScoreRegistry.sol", "utf8");
    const oracleSource = fs.readFileSync("./contracts/ScoreOracle.sol", "utf8");

    console.log("📋 Contract sources loaded");
    console.log("⚠️  You need to compile these contracts using Remix or Hardhat");
    console.log("🔗 Use Remix IDE: https://remix.ethereum.org");
    console.log("\n📝 Manual deployment steps:");
    console.log("1. Copy contract code to Remix");
    console.log("2. Compile with Solidity 0.8.20");
    console.log("3. Deploy CredoScoreRegistry first");
    console.log("4. Deploy ScoreOracle with registry address");
    console.log("5. Call credoScoreRegistry.setScoreUpdater(oracleAddress, true)");
    console.log("\n🌐 Network Details:");
    console.log("- RPC URL: https://rpc-holesky.morphl2.io");
    console.log("- Chain ID: 2810");
    console.log("- Explorer: https://explorer-holesky.morphl2.io");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

deploy();