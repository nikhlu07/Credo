const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying Credo Contracts on Morph Holesky...\n");

  // Get contract addresses from environment or prompt
  const registryAddress = process.env.SCORE_REGISTRY_ADDRESS;
  const oracleAddress = process.env.SCORE_ORACLE_ADDRESS;

  if (!registryAddress || !oracleAddress) {
    console.log("❌ Please set SCORE_REGISTRY_ADDRESS and SCORE_ORACLE_ADDRESS in .env");
    process.exit(1);
  }

  try {
    console.log("📋 Registry Address:", registryAddress);
    console.log("🔮 Oracle Address:", oracleAddress);

    // Verify CredoScoreRegistry
    console.log("\n📋 Verifying CredoScoreRegistry...");
    await hre.run("verify:verify", {
      address: registryAddress,
      constructorArguments: [],
    });
    console.log("✅ CredoScoreRegistry verified!");

    // Verify ScoreOracle
    console.log("\n🔮 Verifying ScoreOracle...");
    await hre.run("verify:verify", {
      address: oracleAddress,
      constructorArguments: [registryAddress],
    });
    console.log("✅ ScoreOracle verified!");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("🔗 View on Explorer:");
    console.log("Registry:", `https://explorer-holesky.morphl2.io/address/${registryAddress}`);
    console.log("Oracle:", `https://explorer-holesky.morphl2.io/address/${oracleAddress}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
    if (error.message.includes("already verified")) {
      console.log("ℹ️ Contracts may already be verified");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });