# 🚀 Credo API Documentation

## Overview
The Credo API provides enterprise-grade credit scoring for DeFi applications. Built on FastAPI with async architecture for maximum performance.

**Base URL**: `http://localhost:8000`  
**API Version**: `v1`  
**Response Format**: `JSON`

---

## 🔐 Authentication
Currently in open beta - no authentication required. Production will use API keys.

---

## 📊 Core Endpoints

### 1. Get Credit Score
**Endpoint**: `GET /score/{address}`

**Description**: Calculate comprehensive credit score for any Ethereum wallet.

**Parameters**:
- `address` (path, required): Ethereum wallet address (0x...)

**Response**:
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
  "score": 925,
  "metrics": {
    "wallet_age_days": 1825,
    "transaction_count": 4250,
    "eth_balance": 25.8,
    "liquidation_count": 0,
    "stablecoin_percentage": 28.5,
    "balance_stability_score": 94.2,
    "total_portfolio_value_usd": 89750.0
  },
  "timestamp": "2024-08-14T15:30:00Z",
  "version": "2.1-ML"
}
```

**Example**:
```bash
curl http://localhost:8000/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

---

### 2. Submit Score to Morph
**Endpoint**: `POST /submit-to-morph`

**Description**: Submit calculated credit score to Morph network for on-chain storage.

**Request Body**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
  "submit_to_oracle": true
}
```

**Response**:
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
  "score": 925,
  "oracle_submission": {
    "transaction_hash": "0xabc123...",
    "gas_used": 45000,
    "cost_usd": 0.01
  }
}
```

---

### 3. Batch Score Analysis
**Endpoint**: `POST /score/batch`

**Description**: Analyze multiple addresses simultaneously (up to 50).

**Request Body**:
```json
{
  "addresses": [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
  ],
  "submit_to_oracle": false
}
```

**Response**:
```json
{
  "success": true,
  "total_addresses": 2,
  "successful_calculations": 2,
  "results": [
    {
      "address": "0x742d35...",
      "success": true,
      "score": 925
    },
    {
      "address": "0xd8dA6B...",
      "success": true,
      "score": 847
    }
  ]
}
```

---

### 4. Health Check
**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "credo-api",
  "version": "2.0",
  "features": [
    "enhanced_scoring",
    "oracle_integration",
    "batch_processing"
  ]
}
```

---

### 5. Contract Status
**Endpoint**: `GET /contract-status`

**Response**:
```json
{
  "oracle_address": "0x1234567890123456789012345678901234567890",
  "registry_address": "0x0987654321098765432109876543210987654321",
  "oracle_deployed": true,
  "registry_deployed": true,
  "analysis_network": "Ethereum Mainnet",
  "contract_network": "Morph Holesky",
  "value_proposition": "Cross-chain credit scoring for Morph DeFi",
  "morph_benefits": ["Low gas fees", "Fast transactions", "Ethereum security"],
  "chain_id": 2810
}
```

---

## 📈 Score Interpretation

### Score Ranges
- **900-1000**: Platinum (50% collateral, premium rates)
- **800-899**: Diamond (65% collateral, excellent rates)
- **700-799**: Gold (75% collateral, good rates)
- **600-699**: Silver (90% collateral, standard rates)
- **500-599**: Bronze (110% collateral, basic rates)

### Key Metrics Explained
- **wallet_age_days**: Days since first transaction
- **transaction_count**: Total number of transactions
- **liquidation_count**: Number of liquidation events (lower is better)
- **stablecoin_percentage**: Portfolio diversification indicator
- **balance_stability_score**: Consistency of wallet behavior (0-100)

---

## ⚡ Performance

### Rate Limits
- **Free Tier**: 1000 requests/hour
- **Response Time**: <200ms average
- **Batch Limit**: 50 addresses per request
- **Uptime**: 99.9% SLA

### Error Handling
```json
{
  "success": false,
  "error": "Invalid Ethereum address format",
  "code": 400,
  "timestamp": "2024-08-14T15:30:00Z"
}
```

---

## 🔧 Integration Examples

### JavaScript/TypeScript
```typescript
const getCredoScore = async (address: string) => {
  const response = await fetch(`http://localhost:8000/score/${address}`);
  const data = await response.json();
  return data.score;
};
```

### Python
```python
import requests

def get_credo_score(address: str) -> int:
    response = requests.get(f"http://localhost:8000/score/{address}")
    return response.json()["score"]
```

### cURL
```bash
# Get score
curl -X GET "http://localhost:8000/score/0xYourAddress"

# Submit to Morph
curl -X POST "http://localhost:8000/submit-to-morph" \
  -H "Content-Type: application/json" \
  -d '{"address": "0xYourAddress", "submit_to_oracle": true}'
```

---

## 🚀 Coming Soon

### v2.2 Features
- Historical score tracking
- Confidence intervals
- Multi-chain analysis
- Webhook notifications
- GraphQL endpoint

### Enterprise Features
- Custom scoring models
- White-label solutions
- Dedicated infrastructure
- SLA guarantees
- Priority support

---

**Need help?** Contact: api-support@credo.finance