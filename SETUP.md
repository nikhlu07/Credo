# Credo Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend API
```bash
# In one terminal
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Start Frontend
```bash
# In another terminal
npm run dev
```

## 🔧 Configuration

### Backend (.env file)
Create a `.env` file in the root directory:
```env
# Morph Holesky Configuration
MORPH_RPC_URL=https://rpc-holesky.morphl2.io
BLOCKSCOUT_API_URL=https://explorer-holesky.morphl2.io/api

# Smart Contract Addresses (update after deployment)
SCORE_REGISTRY_ADDRESS=0x...
SCORE_ORACLE_ADDRESS=0x...

# Oracle Configuration (for production)
ORACLE_PRIVATE_KEY=0x...

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

### Frontend (WalletConnect)
Get your own WalletConnect Project ID:
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy the Project ID
4. Replace the demo ID in `src/App.jsx`

## 🛠️ Smart Contract Deployment

### 1. Install Hardhat Dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Deploy Contracts
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Morph Holesky
npx hardhat run scripts/deploy.js --network morphHolesky
```

## 🧪 Testing

### Test the API
```bash
# Test score calculation
curl "http://localhost:8000/score/0x742d35Cc6634C0532925a3b8D319c75C9B7e5888"

# Test enhanced scoring with oracle
curl -X POST "http://localhost:8000/score/update" \
     -H "Content-Type: application/json" \
     -d '{"address": "0x742d35Cc6634C0532925a3b8D319c75C9B7e5888", "submit_to_oracle": true}'
```

## 🎯 Features

### Enhanced Scoring (5 Signals)
- ✅ Wallet Age (days active)
- ✅ Transaction Count (activity level)
- ✅ Liquidation History (risk assessment)
- ✅ Asset Mix (stablecoin percentage)
- ✅ Balance Stability (transaction patterns)

### Oracle Integration
- ✅ Cryptographically signed score updates
- ✅ On-chain score storage
- ✅ Batch processing capabilities
- ✅ Replay attack prevention

### Web Interface
- ✅ Modern React UI with Tailwind CSS
- ✅ Web3 wallet integration (RainbowKit)
- ✅ Real-time score calculation
- ✅ Interactive charts and visualizations
- ✅ Oracle submission tracking

## 🔍 Troubleshooting

### Common Issues

1. **RainbowKit Theme Error**
   - Fixed: Theme is now properly configured as an object

2. **Missing Logo Error**
   - Fixed: Using emoji favicon instead of missing SVG

3. **WalletConnect Unauthorized**
   - Solution: Replace demo Project ID with your own

4. **Node.js Module Errors**
   - Fixed: Vite config updated to handle buffer/process modules

5. **API Connection Issues**
   - Ensure backend is running on port 8000
   - Check CORS settings if needed

## 📱 Usage

1. **Connect Wallet** - Use RainbowKit to connect your Web3 wallet
2. **Enter Address** - Or manually enter any Ethereum address
3. **Calculate Score** - Get enhanced 5-signal reputation score
4. **Submit to Oracle** - Store score on-chain via oracle system
5. **View Results** - Interactive charts and detailed metrics

## 🌐 Networks

- **Primary**: Morph Holesky Testnet
- **Fallback**: Sepolia, Mainnet (for wallet compatibility)

## 📊 API Endpoints

- `GET /score/{address}` - Calculate reputation score
- `POST /score/update` - Calculate and optionally submit to oracle
- `POST /score/batch` - Batch process multiple addresses
- `GET /health` - Health check

Your Credo reputation protocol is now ready to use! 🎉