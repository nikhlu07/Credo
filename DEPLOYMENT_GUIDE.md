# 🚀 Complete Smart Contract Deployment Guide

## 📋 **Prerequisites**

### 1. **Morph Holesky Testnet Setup**
- **Network Name**: Morph Holesky Testnet
- **RPC URL**: `https://rpc-holesky.morphl2.io`
- **Chain ID**: `2810`
- **Currency**: ETH
- **Explorer**: `https://explorer-holesky.morphl2.io`

### 2. **Get Testnet ETH**
- Get Ethereum Holesky ETH from faucet: `https://holesky-faucet.pk910.de/`
- Bridge to Morph Holesky: `https://bridge-holesky.morphl2.io/`
- You need ~0.01 ETH for deployment

### 3. **Private Key Setup**
⚠️ **SECURITY**: Use a test wallet, never use mainnet private keys!

## 🛠️ **Deployment Steps**

### **Step 1: Environment Setup**
Create `.env` file in project root:
```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here_without_0x

# Network configuration
MORPH_RPC_URL=https://rpc-holesky.morphl2.io
BLOCKSCOUT_API_URL=https://explorer-holesky.morphl2.io/api

# These will be filled after deployment
SCORE_REGISTRY_ADDRESS=
SCORE_ORACLE_ADDRESS=
ORACLE_PRIVATE_KEY=your_private_key_here_without_0x
```

### **Step 2: Install Dependencies**
```bash
# In project root
npm install --legacy-peer-deps

# If you get errors, try:
npm install --force
```

### **Step 3: Compile Contracts**
```bash
npx hardhat compile
```

### **Step 4: Deploy Contracts**
```bash
npx hardhat run scripts/deploy.js --network morphHolesky
```

**Expected Output:**
```
🚀 Starting Credo Contract Deployment on Morph Holesky...

📝 Deploying contracts with account: 0x742d35Cc...
💰 Account balance: 0.05 ETH

📋 Deploying CredoScoreRegistry...
✅ CredoScoreRegistry deployed to: 0x1234...

🔮 Deploying ScoreOracle...
✅ ScoreOracle deployed to: 0x5678...

🎉 DEPLOYMENT COMPLETE! 🎉
=====================================
📋 CredoScoreRegistry: 0x1234...
🔮 ScoreOracle: 0x5678...
👤 Deployer/Signer: 0x742d35Cc...
=====================================
```

### **Step 5: Update Environment**
Copy the contract addresses from deployment output to your `.env`:
```env
SCORE_REGISTRY_ADDRESS=0x1234...  # From deployment output
SCORE_ORACLE_ADDRESS=0x5678...    # From deployment output
ORACLE_PRIVATE_KEY=your_private_key_here_without_0x
```

### **Step 6: Verify Contracts (Optional)**
```bash
npx hardhat run scripts/verify.js --network morphHolesky
```

## ✅ **Test Full System**

### **Step 1: Start Backend**
```bash
python main.py
```
- Backend will now connect to deployed contracts
- Check logs for "Oracle service initialized" message

### **Step 2: Start Frontend**
```bash
cd credo-frontend
npm run dev
```

### **Step 3: Test Integration**
1. Connect wallet in frontend
2. Calculate credit score
3. Check backend logs for contract interactions
4. Verify score stored on blockchain: `https://explorer-holesky.morphl2.io/address/YOUR_REGISTRY_ADDRESS`

## 🎯 **Full System Architecture**

```
User Wallet ←→ Frontend ←→ Backend ←→ Smart Contracts ←→ Morph L2
     ↓              ↓           ↓            ↓
  MetaMask    Apple-style   FastAPI +   ScoreOracle +
              Next.js UI    ML Scoring  CredoRegistry
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Insufficient funds"**
   - Get more Holesky ETH and bridge to Morph

2. **"Network not found"**
   - Add Morph Holesky to MetaMask manually

3. **"Contract deployment failed"**
   - Check gas price and network connection
   - Ensure private key has ETH

4. **"Backend can't connect to contracts"**
   - Verify `.env` has correct contract addresses
   - Check private key format (no 0x prefix)

### **Contract Verification:**
Visit the explorer links to see your contracts:
- Registry: `https://explorer-holesky.morphl2.io/address/YOUR_REGISTRY_ADDRESS`
- Oracle: `https://explorer-holesky.morphl2.io/address/YOUR_ORACLE_ADDRESS`

## 🚀 **Production Checklist**

- [ ] Contracts compiled successfully
- [ ] Deployed to Morph Holesky
- [ ] Environment variables updated
- [ ] Backend connects to contracts
- [ ] Frontend shows contract integration
- [ ] Scores stored on-chain
- [ ] Explorer verification works

## 🎉 **Success Indicators**

You'll know everything works when:
1. ✅ Backend logs show "Oracle service initialized"
2. ✅ Frontend displays contract status
3. ✅ Credit scores appear on Morph explorer
4. ✅ Oracle signatures verified on-chain

**Your DeFi credit scoring platform is now fully decentralized!** 🌟