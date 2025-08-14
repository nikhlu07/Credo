const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Credo Contract Deployment on Morph Holesky...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  try {
    // Deploy CredoScoreRegistry first
    console.log("📋 Deploying CredoScoreRegistry...");
    const CredoScoreRegistry = await ethers.getContractFactory("CredoScoreRegistry");
    const credoScoreRegistry = await CredoScoreRegistry.deploy();
    await credoScoreRegistry.waitForDeployment();
    const registryAddress = await credoScoreRegistry.getAddress();
    console.log("✅ CredoScoreRegistry deployed to:", registryAddress);

    // Deploy ScoreOracle with registry address
    console.log("\n🔮 Deploying ScoreOracle...");
    const ScoreOracle = await ethers.getContractFactory("ScoreOracle");
    const scoreOracle = await ScoreOracle.deploy(registryAddress);
    await scoreOracle.waitForDeployment();
    const oracleAddress = await scoreOracle.getAddress();
    console.log("✅ ScoreOracle deployed to:", oracleAddress);

    // Set ScoreOracle as authorized updater in registry
    console.log("\n🔗 Configuring registry permissions...");
    const setUpdaterTx = await credoScoreRegistry.setScoreUpdater(oracleAddress, true);
    await setUpdaterTx.wait();
    console.log("✅ ScoreOracle authorized as score updater");

    // Verify oracle is authorized signer
    console.log("\n🔐 Verifying oracle authorization...");
    const isAuthorized = await scoreOracle.authorizedSigners(deployer.address);
    console.log("✅ Deployer is authorized signer:", isAuthorized);

    console.log("\n🎉 DEPLOYMENT COMPLETE! 🎉");
    console.log("=====================================");
    console.log("📋 CredoScoreRegistry:", registryAddress);
    console.log("🔮 ScoreOracle:", oracleAddress);
    console.log("👤 Deployer/Signer:", deployer.address);
    console.log("🌐 Network: Morph Holesky (Chain ID: 2810)");
    console.log("📊 Explorer: https://explorer-holesky.morphl2.io/");
    console.log("=====================================");

    console.log("\n📝 Environment Variables for .env:");
    console.log("SCORE_ORACLE_ADDRESS=" + oracleAddress);
    console.log("SCORE_REGISTRY_ADDRESS=" + registryAddress);
    console.log("ORACLE_PRIVATE_KEY=" + process.env.PRIVATE_KEY);

    console.log("\n🔗 Contract Verification:");
    console.log("Registry:", `https://explorer-holesky.morphl2.io/address/${registryAddress}`);
    console.log("Oracle:", `https://explorer-holesky.morphl2.io/address/${oracleAddress}`);

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    const currentNonce = await scoreOracle.getCurrentNonce(deployer.address);
    console.log("✅ Current nonce for deployer:", currentNonce.toString());

    console.log("\n✨ Ready for production use! ✨");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });