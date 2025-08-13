"""
Oracle service for submitting signed score updates to the ScoreOracle contract
"""

import asyncio
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Contract configuration
MORPH_HOLESKY_RPC = "https://rpc-holesky.morphl2.io"
SCORE_ORACLE_ADDRESS = os.getenv("SCORE_ORACLE_ADDRESS", "")
SCORE_REGISTRY_ADDRESS = os.getenv("SCORE_REGISTRY_ADDRESS", "")
ORACLE_PRIVATE_KEY = os.getenv("ORACLE_PRIVATE_KEY", "")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(MORPH_HOLESKY_RPC))

# Contract ABIs (simplified for key functions)
SCORE_ORACLE_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"name": "user", "type": "address"},
                    {"name": "score", "type": "uint256"},
                    {"name": "version", "type": "uint256"},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "deadline", "type": "uint256"}
                ],
                "name": "update",
                "type": "tuple"
            },
            {"name": "signature", "type": "bytes"}
        ],
        "name": "submitScoreUpdate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getCurrentNonce",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {"name": "user", "type": "address"},
                    {"name": "score", "type": "uint256"},
                    {"name": "version", "type": "uint256"},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "deadline", "type": "uint256"}
                ],
                "name": "update",
                "type": "tuple"
            }
        ],
        "name": "getScoreUpdateHash",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "pure",
        "type": "function"
    }
]

class OracleService:
    """Service for interacting with the ScoreOracle contract"""
    
    def __init__(self):
        self.w3 = w3
        self.account = None
        self.oracle_contract = None
        
        if ORACLE_PRIVATE_KEY:
            self.account = Account.from_key(ORACLE_PRIVATE_KEY)
            logger.info(f"Oracle account initialized: {self.account.address}")
        
        if SCORE_ORACLE_ADDRESS:
            self.oracle_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(SCORE_ORACLE_ADDRESS),
                abi=SCORE_ORACLE_ABI
            )
            logger.info(f"Oracle contract initialized: {SCORE_ORACLE_ADDRESS}")
    
    def _create_score_update_message(self, user: str, score: int, version: int, nonce: int, deadline: int) -> str:
        """Create the message to be signed for score updates"""
        # This should match the contract's message format
        message_parts = [
            "ScoreUpdate",
            user,
            str(score),
            str(version), 
            str(nonce),
            str(deadline)
        ]
        message = "".join(message_parts)
        return message
    
    def sign_score_update(self, user: str, score: int, version: int = 2, deadline_minutes: int = 60) -> Dict[str, Any]:
        """
        Sign a score update for submission to the oracle
        
        Args:
            user: User address to update score for
            score: Credo score (0-1000)
            version: Algorithm version
            deadline_minutes: How many minutes until signature expires
            
        Returns:
            Dictionary containing signed update data
        """
        if not self.account or not self.oracle_contract:
            raise ValueError("Oracle service not properly initialized")
        
        try:
            # Get current nonce for the user
            nonce = self.oracle_contract.functions.getCurrentNonce(user).call()
            
            # Calculate deadline timestamp
            deadline = int(datetime.now(timezone.utc).timestamp()) + (deadline_minutes * 60)
            
            # Create the message hash (matching contract logic)
            message_data = Web3.solidity_keccak(
                ['string', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
                ['ScoreUpdate', user, score, version, nonce, deadline]
            )
            
            # Sign the message
            signature = self.account.sign_message(encode_defunct(message_data))
            
            update_data = {
                "user": user,
                "score": score,
                "version": version,
                "nonce": nonce,
                "deadline": deadline
            }
            
            return {
                "update": update_data,
                "signature": signature.signature.hex(),
                "signer": self.account.address
            }
            
        except Exception as e:
            logger.error(f"Error signing score update: {str(e)}")
            raise
    
    async def submit_score_update(self, user: str, score: int, version: int = 2) -> Dict[str, Any]:
        """
        Sign and submit a score update to the oracle contract
        
        Args:
            user: User address to update
            score: Credo score (0-1000)
            version: Algorithm version
            
        Returns:
            Transaction receipt
        """
        try:
            # Sign the update
            signed_update = self.sign_score_update(user, score, version)
            
            # Prepare transaction
            update_tuple = (
                signed_update["update"]["user"],
                signed_update["update"]["score"],
                signed_update["update"]["version"],
                signed_update["update"]["nonce"],
                signed_update["update"]["deadline"]
            )
            
            # Build transaction
            transaction = self.oracle_contract.functions.submitScoreUpdate(
                update_tuple,
                bytes.fromhex(signed_update["signature"][2:])  # Remove 0x prefix
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.account.sign_transaction(transaction)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"Score update submitted for {user}: score={score}, tx={tx_hash.hex()}")
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "gas_used": receipt.gasUsed,
                "user": user,
                "score": score
            }
            
        except Exception as e:
            logger.error(f"Error submitting score update: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user": user,
                "score": score
            }
    
    async def batch_submit_scores(self, score_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Submit multiple score updates in batch
        
        Args:
            score_updates: List of dicts with 'user' and 'score' keys
            
        Returns:
            Batch submission result
        """
        try:
            results = []
            
            # Process in batches of 10 to avoid gas limits
            batch_size = 10
            for i in range(0, len(score_updates), batch_size):
                batch = score_updates[i:i + batch_size]
                
                # Submit each update in the batch
                batch_results = await asyncio.gather(*[
                    self.submit_score_update(update["user"], update["score"])
                    for update in batch
                ], return_exceptions=True)
                
                results.extend(batch_results)
                
                # Small delay between batches to avoid overwhelming the network
                if i + batch_size < len(score_updates):
                    await asyncio.sleep(2)
            
            successful = sum(1 for r in results if isinstance(r, dict) and r.get("success"))
            
            return {
                "success": True,
                "total_updates": len(score_updates),
                "successful_updates": successful,
                "failed_updates": len(score_updates) - successful,
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error in batch score submission: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_updates": len(score_updates)
            }

# Global oracle service instance
oracle_service = OracleService()

async def submit_score_to_oracle(user: str, score: int, version: int = 2) -> Dict[str, Any]:
    """
    Convenience function to submit a score update to the oracle
    
    Args:
        user: User address
        score: Credo score (0-1000)
        version: Algorithm version
        
    Returns:
        Submission result
    """
    return await oracle_service.submit_score_update(user, score, version)

async def batch_submit_scores_to_oracle(score_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convenience function for batch score submissions
    
    Args:
        score_updates: List of score update dictionaries
        
    Returns:
        Batch submission result
    """
    return await oracle_service.batch_submit_scores(score_updates)