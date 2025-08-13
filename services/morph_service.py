import asyncio
import httpx
from web3 import Web3
from typing import Dict, Any, List
import logging
from datetime import datetime, timezone
import time
import json
from decimal import Decimal

# Import ML scoring service
try:
    from .ml_scoring_service import calculate_ml_enhanced_score, ml_scorer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logger.warning("ML scoring service not available, using rule-based only")

logger = logging.getLogger(__name__)

# Morph Holesky testnet configuration
MORPH_HOLESKY_RPC = "https://rpc-holesky.morphl2.io"
BLOCKSCOUT_API_BASE = "https://explorer-holesky.morphl2.io/api"

# Initialize Web3 connection
w3 = Web3(Web3.HTTPProvider(MORPH_HOLESKY_RPC))

# Common stablecoin addresses (checksummed)
STABLECOINS = {
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "USDC": "0xA0b86a33E6441b8435b662303c0f479c7e1d5916", 
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "BUSD": "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    "FRAX": "0x853d955aCEf822Db058eb8505911ED77F175b99e"
}

# ERC20 ABI for balance checking
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
]

async def calculate_score(address: str) -> Dict[str, Any]:
    """
    Enhanced Credo Score calculation with 5 key signals:
    1. Wallet age
    2. Number of transactions
    3. Liquidation history
    4. Asset mix (stablecoin percentage)
    5. Balance stability
    
    Args:
        address: Ethereum wallet address to analyze
        
    Returns:
        Dictionary containing score and detailed metrics breakdown
    """
    try:
        logger.info(f"Starting enhanced Credo Score calculation for address: {address}")
        
        # Initialize enhanced metrics
        metrics = {
            "wallet_age_days": 0,
            "transaction_count": 0,
            "eth_balance": 0.0,
            "liquidation_count": 0,
            "stablecoin_percentage": 0.0,
            "balance_stability_score": 0,
            "total_portfolio_value_usd": 0.0,
            "first_transaction_timestamp": None,
            "last_transaction_timestamp": None,
            "asset_breakdown": {}
        }
        
        # Fetch all metrics concurrently
        async with httpx.AsyncClient(timeout=45.0) as client:
            # Get current ETH balance
            balance_wei = w3.eth.get_balance(address)
            metrics["eth_balance"] = float(w3.from_wei(balance_wei, 'ether'))
            
            # Fetch enhanced data concurrently
            tasks = [
                fetch_transaction_data(client, address),
                fetch_asset_mix(address),
                fetch_liquidation_history(client, address),
                calculate_balance_stability(client, address)
            ]
            
            tx_data, asset_data, liquidation_data, stability_data = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process transaction data
            if isinstance(tx_data, dict):
                metrics.update(tx_data)
            
            # Process asset mix data
            if isinstance(asset_data, dict):
                metrics.update(asset_data)
            
            # Process liquidation data
            if isinstance(liquidation_data, dict):
                metrics.update(liquidation_data)
            
            # Process stability data
            if isinstance(stability_data, dict):
                metrics.update(stability_data)
            
            # Calculate wallet age if we have first transaction
            if metrics["first_transaction_timestamp"]:
                first_tx_time = datetime.fromtimestamp(
                    metrics["first_transaction_timestamp"], 
                    tz=timezone.utc
                )
                current_time = datetime.now(timezone.utc)
                wallet_age = (current_time - first_tx_time).days
                metrics["wallet_age_days"] = max(0, wallet_age)
        
        # Calculate enhanced Credo Score with ML if available
        if ML_AVAILABLE:
            ml_result = await calculate_ml_enhanced_score(address, metrics)
            score = ml_result['score']
            
            # Add ML-specific data to response
            result = {
                "score": score,
                "metrics": metrics,
                "ml_analysis": {
                    "ml_score": ml_result.get('ml_score'),
                    "rule_based_score": ml_result.get('rule_based_score'),
                    "confidence": ml_result.get('confidence'),
                    "model_type": ml_result.get('model_type'),
                    "feature_importance": ml_result.get('feature_importance', {}),
                    "advanced_features": ml_result.get('advanced_features', {})
                },
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "version": "2.1-ML"
            }
        else:
            # Fallback to rule-based scoring
            score = calculate_enhanced_credo_score(metrics)
            result = {
                "score": score,
                "metrics": metrics,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "version": "2.0"
            }
        
        logger.info(f"Enhanced Credo Score calculation completed for {address}: {score}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in enhanced calculate_score for {address}: {str(e)}")
        # Return default values on error
        return {
            "score": 0,
            "metrics": {
                "wallet_age_days": 0,
                "transaction_count": 0,
                "eth_balance": 0.0,
                "liquidation_count": 0,
                "stablecoin_percentage": 0.0,
                "balance_stability_score": 0,
                "error": str(e)
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "2.0"
        }

async def fetch_transaction_data(client: httpx.AsyncClient, address: str) -> Dict[str, Any]:
    """
    Fetch transaction data from Morph Blockscout API
    
    Args:
        client: HTTP client for making requests
        address: Wallet address to analyze
        
    Returns:
        Dictionary containing transaction metrics
    """
    try:
        # Get transaction list from Blockscout API
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 1000,
            "sort": "asc"
        }
        
        response = await client.get(f"{BLOCKSCOUT_API_BASE}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "1" and data.get("result"):
                transactions = data["result"]
                tx_count = len(transactions)
                
                if tx_count > 0:
                    # Get first and last transaction timestamps
                    first_tx = transactions[0]
                    last_tx = transactions[-1]
                    
                    return {
                        "transaction_count": tx_count,
                        "first_transaction_timestamp": int(first_tx.get("timeStamp", 0)),
                        "last_transaction_timestamp": int(last_tx.get("timeStamp", 0))
                    }
            
        # If API call fails or returns no data, try alternative approach
        logger.warning(f"Blockscout API failed for {address}, using Web3 fallback")
        return await fetch_transaction_data_web3(address)
        
    except Exception as e:
        logger.error(f"Error fetching transaction data from API: {str(e)}")
        return await fetch_transaction_data_web3(address)

async def fetch_transaction_data_web3(address: str) -> Dict[str, Any]:
    """
    Fallback method to estimate transaction data using Web3
    
    Args:
        address: Wallet address to analyze
        
    Returns:
        Dictionary containing estimated transaction metrics
    """
    try:
        # Get current nonce as transaction count estimate
        nonce = w3.eth.get_transaction_count(address)
        
        # For wallet age, we'll use a simple heuristic
        # If nonce > 0, estimate wallet age based on current block and average block time
        wallet_age_days = 0
        if nonce > 0:
            current_block = w3.eth.block_number
            # Estimate wallet created ~nonce blocks ago (very rough estimate)
            estimated_first_block = max(0, current_block - (nonce * 2))
            # Assume ~12 second block time for age estimation
            estimated_age_seconds = (current_block - estimated_first_block) * 12
            wallet_age_days = max(1, estimated_age_seconds // 86400)  # Convert to days
        
        return {
            "transaction_count": nonce,
            "first_transaction_timestamp": int(time.time() - (wallet_age_days * 86400)) if wallet_age_days > 0 else None,
            "last_transaction_timestamp": int(time.time()) if nonce > 0 else None
        }
        
    except Exception as e:
        logger.error(f"Error in Web3 fallback: {str(e)}")
        return {
            "transaction_count": 0,
            "first_transaction_timestamp": None,
            "last_transaction_timestamp": None
        }

async def fetch_asset_mix(address: str) -> Dict[str, Any]:
    """
    Analyze asset mix to calculate stablecoin percentage
    
    Args:
        address: Wallet address to analyze
        
    Returns:
        Dictionary containing asset mix data
    """
    try:
        total_value = 0.0
        stablecoin_value = 0.0
        asset_breakdown = {}
        
        # Get ETH balance
        eth_balance_wei = w3.eth.get_balance(address)
        eth_balance = float(w3.from_wei(eth_balance_wei, 'ether'))
        
        # Estimate ETH value (using rough $2000 per ETH for demo)
        eth_value_usd = eth_balance * 2000
        total_value += eth_value_usd
        asset_breakdown["ETH"] = {"balance": eth_balance, "value_usd": eth_value_usd}
        
        # Check stablecoin balances
        for symbol, contract_address in STABLECOINS.items():
            try:
                contract = w3.eth.contract(
                    address=Web3.to_checksum_address(contract_address),
                    abi=ERC20_ABI
                )
                
                balance = contract.functions.balanceOf(address).call()
                decimals = contract.functions.decimals().call()
                
                if balance > 0:
                    token_balance = balance / (10 ** decimals)
                    # Stablecoins are ~$1 each
                    token_value_usd = token_balance * 1.0
                    
                    total_value += token_value_usd
                    stablecoin_value += token_value_usd
                    asset_breakdown[symbol] = {
                        "balance": token_balance,
                        "value_usd": token_value_usd
                    }
                    
            except Exception as e:
                logger.warning(f"Error fetching {symbol} balance for {address}: {str(e)}")
                continue
        
        # Calculate stablecoin percentage
        stablecoin_percentage = (stablecoin_value / total_value * 100) if total_value > 0 else 0
        
        return {
            "stablecoin_percentage": round(stablecoin_percentage, 2),
            "total_portfolio_value_usd": round(total_value, 2),
            "asset_breakdown": asset_breakdown
        }
        
    except Exception as e:
        logger.error(f"Error fetching asset mix for {address}: {str(e)}")
        return {
            "stablecoin_percentage": 0.0,
            "total_portfolio_value_usd": 0.0,
            "asset_breakdown": {}
        }

async def fetch_liquidation_history(client: httpx.AsyncClient, address: str) -> Dict[str, Any]:
    """
    Check for liquidation events in transaction history
    
    Args:
        client: HTTP client for API requests
        address: Wallet address to analyze
        
    Returns:
        Dictionary containing liquidation data
    """
    try:
        # Look for common liquidation patterns in transaction data
        liquidation_count = 0
        
        # Get internal transactions which might show liquidations
        params = {
            "module": "account",
            "action": "txlistinternal",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 100,
            "sort": "desc"
        }
        
        response = await client.get(f"{BLOCKSCOUT_API_BASE}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "1" and data.get("result"):
                transactions = data["result"]
                
                # Look for patterns that might indicate liquidations
                for tx in transactions:
                    # Check for large outgoing transfers that might be liquidations
                    value = int(tx.get("value", 0))
                    if value > w3.to_wei(0.1, 'ether'):  # Significant value transfer
                        # Additional heuristics could be added here
                        # For now, we'll use a simple approach
                        pass
        
        # For demo purposes, we'll simulate liquidation detection
        # In production, this would integrate with lending protocol APIs
        
        return {
            "liquidation_count": liquidation_count
        }
        
    except Exception as e:
        logger.error(f"Error fetching liquidation history for {address}: {str(e)}")
        return {
            "liquidation_count": 0
        }

async def calculate_balance_stability(client: httpx.AsyncClient, address: str) -> Dict[str, Any]:
    """
    Calculate balance stability score based on transaction patterns
    
    Args:
        client: HTTP client for API requests
        address: Wallet address to analyze
        
    Returns:
        Dictionary containing stability metrics
    """
    try:
        stability_score = 50  # Default neutral score
        
        # Get recent transaction history
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 50,
            "sort": "desc"
        }
        
        response = await client.get(f"{BLOCKSCOUT_API_BASE}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "1" and data.get("result"):
                transactions = data["result"]
                
                if len(transactions) >= 5:
                    # Analyze transaction patterns for stability
                    values = []
                    for tx in transactions[:20]:  # Look at last 20 transactions
                        if tx.get("from", "").lower() == address.lower():
                            # Outgoing transaction
                            value = int(tx.get("value", 0))
                            values.append(value)
                    
                    if values:
                        # Calculate coefficient of variation for stability
                        if len(values) > 1:
                            mean_val = sum(values) / len(values)
                            if mean_val > 0:
                                variance = sum((x - mean_val) ** 2 for x in values) / len(values)
                                std_dev = variance ** 0.5
                                cv = std_dev / mean_val
                                
                                # Lower coefficient of variation = higher stability
                                stability_score = max(0, min(100, 100 - (cv * 50)))
        
        return {
            "balance_stability_score": round(stability_score, 2)
        }
        
    except Exception as e:
        logger.error(f"Error calculating balance stability for {address}: {str(e)}")
        return {
            "balance_stability_score": 50.0
        }

def calculate_enhanced_credo_score(metrics: Dict[str, Any]) -> int:
    """
    Calculate enhanced Credo Score using 5 key signals:
    1. Wallet Age (0-200 points)
    2. Transaction Count (0-200 points) 
    3. Liquidation History (0-200 points)
    4. Asset Mix - Stablecoin % (0-200 points)
    5. Balance Stability (0-200 points)
    
    Args:
        metrics: Dictionary containing all wallet metrics
        
    Returns:
        Integer Credo Score (0-1000)
    """
    try:
        # Extract metrics with defaults
        wallet_age = metrics.get("wallet_age_days", 0)
        tx_count = metrics.get("transaction_count", 0)
        liquidation_count = metrics.get("liquidation_count", 0)
        stablecoin_pct = metrics.get("stablecoin_percentage", 0.0)
        stability_score = metrics.get("balance_stability_score", 0)
        
        # 1. Wallet Age Score (0-200 points)
        # Mature wallets get higher scores
        if wallet_age >= 365:  # 1+ years
            age_score = 200
        elif wallet_age >= 180:  # 6+ months
            age_score = 150 + (wallet_age - 180) * 50 / 185
        elif wallet_age >= 90:   # 3+ months
            age_score = 100 + (wallet_age - 90) * 50 / 90
        elif wallet_age >= 30:   # 1+ month
            age_score = 50 + (wallet_age - 30) * 50 / 60
        else:
            age_score = wallet_age * 50 / 30
        
        # 2. Transaction Count Score (0-200 points)
        # More transactions indicate active usage
        if tx_count >= 100:
            tx_score = 200
        elif tx_count >= 50:
            tx_score = 150 + (tx_count - 50) * 50 / 50
        elif tx_count >= 20:
            tx_score = 100 + (tx_count - 20) * 50 / 30
        elif tx_count >= 5:
            tx_score = 50 + (tx_count - 5) * 50 / 15
        else:
            tx_score = tx_count * 50 / 5
        
        # 3. Liquidation History Score (0-200 points)
        # Fewer liquidations = higher score
        if liquidation_count == 0:
            liquidation_score = 200
        elif liquidation_count == 1:
            liquidation_score = 150
        elif liquidation_count == 2:
            liquidation_score = 100
        elif liquidation_count <= 5:
            liquidation_score = 50
        else:
            liquidation_score = 0
        
        # 4. Asset Mix Score (0-200 points)
        # Balanced mix with some stablecoins is preferred
        if 20 <= stablecoin_pct <= 60:  # Optimal range
            asset_score = 200
        elif 10 <= stablecoin_pct < 20 or 60 < stablecoin_pct <= 80:
            asset_score = 150
        elif 5 <= stablecoin_pct < 10 or 80 < stablecoin_pct <= 90:
            asset_score = 100
        elif stablecoin_pct > 0:
            asset_score = 50
        else:
            asset_score = 25  # No stablecoins might indicate higher risk tolerance
        
        # 5. Balance Stability Score (0-200 points)
        # Direct mapping from stability score
        stability_points = stability_score * 2  # Convert 0-100 to 0-200
        
        # Calculate final score
        total_score = age_score + tx_score + liquidation_score + asset_score + stability_points
        
        # Cap at 1000 and ensure minimum of 0
        final_score = max(0, min(1000, int(total_score)))
        
        logger.info(f"Enhanced Credo Score breakdown - Age: {age_score:.1f}, Tx: {tx_score:.1f}, "
                   f"Liquidations: {liquidation_score}, Assets: {asset_score:.1f}, "
                   f"Stability: {stability_points:.1f}, Total: {final_score}")
        
        return final_score
        
    except Exception as e:
        logger.error(f"Error calculating enhanced Credo Score: {str(e)}")
        return 0