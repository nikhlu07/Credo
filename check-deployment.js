// Quick deployment status checker - run with: node check-deployment.js
require("dotenv").config();

async function checkDeployment() {
  console.log("🔍 Checking Deployment Status...\n");

  // Check environment variables
  console.log("📋 Environment Configuration:");
  console.log("- Private Key:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Missing");
  console.log("- Oracle Address:", process.env.SCORE_ORACLE_ADDRESS || "❌ Not deployed");
  console.log("- Registry Address:", process.env.SCORE_REGISTRY_ADDRESS || "❌ Not deployed");
  console.log("- Network:", "Morph Holesky (Chain ID: 2810)");

  // Check backend API
  console.log("\n🖥️ Backend Status:");
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      console.log("- API Server: ✅ Running");
      
      // Check contract status endpoint
      try {
        const contractResponse = await fetch('http://localhost:8000/contract-status');
        if (contractResponse.ok) {
          const contractData = await contractResponse.json();
          console.log("- Contract Status Endpoint: ✅ Available");
          console.log(`- Oracle Configured: ${contractData.oracle_deployed ? '✅' : '❌'}`);
          console.log(`- Registry Configured: ${contractData.registry_deployed ? '✅' : '❌'}`);
        }
      } catch (error) {
        console.log("- Contract Status: ❌ Endpoint not available");
      }
    } else {
      console.log("- API Server: ❌ Not responding");
    }
  } catch (error) {
    console.log("- API Server: ❌ Not running");
    console.log("  💡 Start with: python main.py");
  }

  // Deployment readiness
  console.log("\n🚀 Deployment Readiness:");
  const hasPrivateKey = !!process.env.PRIVATE_KEY;
  const hasOracle = !!process.env.SCORE_ORACLE_ADDRESS;
  const hasRegistry = !!process.env.SCORE_REGISTRY_ADDRESS;

  if (!hasPrivateKey) {
    console.log("❌ Missing private key in .env");
    console.log("   Add: PRIVATE_KEY=your_key_without_0x");
  }

  if (!hasOracle || !hasRegistry) {
    console.log("⏳ Contracts not deployed yet");
    console.log("   Run: npx hardhat run scripts/deploy.js --network morphHolesky");
    console.log("   Then update .env with contract addresses");
  }

  if (hasPrivateKey && hasOracle && hasRegistry) {
    console.log("✅ Fully deployed and configured!");
    console.log("🎉 Your DeFi credit platform is ready!");
  }

  // Next steps
  console.log("\n📝 Next Steps:");
  if (!hasPrivateKey) {
    console.log("1. Add private key to .env file");
  }
  if (!hasOracle || !hasRegistry) {
    console.log("2. Deploy contracts to Morph Holesky");
  }
  if (hasPrivateKey && (hasOracle || hasRegistry)) {
    console.log("3. Test full integration");
    console.log("4. Frontend at: http://localhost:3000");
    console.log("5. Backend at: http://localhost:8000");
  }

  console.log("\n🔗 Useful Links:");
  console.log("- Morph Explorer: https://explorer-holesky.morphl2.io/");
  console.log("- Bridge: https://bridge-holesky.morphl2.io/");
  console.log("- Frontend: http://localhost:3000");
  console.log("- API Docs: http://localhost:8000/docs");
}

checkDeployment().catch(console.error);