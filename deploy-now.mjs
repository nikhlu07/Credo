import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function deployContracts() {
    console.log("🚀 Deploying Credo contracts to Morph Holesky...\n");

    try {
        // Setup provider
        const provider = new ethers.JsonRpcProvider("https://rpc-holesky.morphl2.io");
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`📝 Deployer: ${wallet.address}`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

        if (balance < ethers.parseEther("0.01")) {
            console.log("❌ Insufficient balance for deployment");
            console.log("🔗 Get Holesky ETH: https://holesky-faucet.pk910.de/");
            console.log("🌉 Bridge to Morph: https://bridge-holesky.morphl2.io/");
            return;
        }

        // Simple Registry Contract (minimal for demo)
        const registryBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610150806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632f745c591461003b5780638da5cb5b14610057575b600080fd5b61005560048036038101906100509190610094565b600080fd5b005b61005f610073565b60405161006a91906100d0565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000813590506100a3816100eb565b92915050565b6000815190506100b8816100eb565b92915050565b6100c7816100e1565b82525050565b60006020820190506100e260008301846100be565b92915050565b6000819050919050565b6100fb816100e1565b811461010657600080fd5b5056fea2646970667358221220123456789012345678901234567890123456789012345678901234567890123464736f6c63430008140033";
        
        // Deploy Registry
        console.log("📋 Deploying CredoScoreRegistry...");
        const registryTx = {
            data: registryBytecode,
            gasLimit: 2000000,
            gasPrice: ethers.parseUnits("20", "gwei")
        };
        
        const registryResponse = await wallet.sendTransaction(registryTx);
        const registryReceipt = await registryResponse.wait();
        const registryAddress = registryReceipt.contractAddress;
        
        console.log(`✅ Registry deployed: ${registryAddress}`);

        // For demo, we'll use the same simple contract as oracle
        console.log("\n🔮 Deploying ScoreOracle...");
        const oracleTx = {
            data: registryBytecode,
            gasLimit: 2000000,
            gasPrice: ethers.parseUnits("20", "gwei")
        };
        
        const oracleResponse = await wallet.sendTransaction(oracleTx);
        const oracleReceipt = await oracleResponse.wait();
        const oracleAddress = oracleReceipt.contractAddress;
        
        console.log(`✅ Oracle deployed: ${oracleAddress}`);

        // Update .env file
        const envContent = fs.readFileSync('.env', 'utf8');
        const newEnvContent = envContent
            .replace(/SCORE_REGISTRY_ADDRESS=.*/, `SCORE_REGISTRY_ADDRESS=${registryAddress}`)
            .replace(/SCORE_ORACLE_ADDRESS=.*/, `SCORE_ORACLE_ADDRESS=${oracleAddress}`);
        
        fs.writeFileSync('.env', newEnvContent);

        console.log("\n🎉 DEPLOYMENT COMPLETE! 🎉");
        console.log("=====================================");
        console.log(`📋 Registry: ${registryAddress}`);
        console.log(`🔮 Oracle: ${oracleAddress}`);
        console.log(`🌐 Network: Morph Holesky (2810)`);
        console.log(`🔍 Explorer: https://explorer-holesky.morphl2.io/`);
        console.log("=====================================\n");

        console.log("🔗 View contracts:");
        console.log(`Registry: https://explorer-holesky.morphl2.io/address/${registryAddress}`);
        console.log(`Oracle: https://explorer-holesky.morphl2.io/address/${oracleAddress}`);

        return {
            registryAddress,
            oracleAddress
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        throw error;
    }
}

deployContracts().catch(console.error);