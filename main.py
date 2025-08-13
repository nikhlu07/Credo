from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from services.morph_service import calculate_score
from services.oracle_service import submit_score_to_oracle, batch_submit_scores_to_oracle
import logging
from typing import List
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="Credo Reputation API",
    description="API for calculating reputation scores based on blockchain activity",
    version="1.0.0"
)

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint providing API information"""
    return {
        "message": "Credo Reputation API",
        "version": "1.0.0",
        "endpoints": {
            "score": "/score/{address} - Get reputation score for a wallet address"
        }
    }

@app.get("/score/{address}")
async def get_reputation_score(address: str):
    """
    Calculate and return the reputation score for a given wallet address
    
    Args:
        address: Ethereum wallet address to analyze
        
    Returns:
        JSON response containing the reputation score and metrics breakdown
    """
    try:
        # Validate address format (basic check)
        if not address.startswith('0x') or len(address) != 42:
            raise HTTPException(
                status_code=400, 
                detail="Invalid Ethereum address format. Address must start with '0x' and be 42 characters long."
            )
        
        logger.info(f"Calculating reputation score for address: {address}")
        
        # Calculate the reputation score using the morph service
        result = await calculate_score(address)
        
        logger.info(f"Successfully calculated score for {address}: {result['score']}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "address": address,
                "score": result["score"],
                "metrics": result["metrics"],
                "timestamp": result.get("timestamp")
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error calculating score for {address}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while calculating reputation score: {str(e)}"
        )

# Pydantic models for request/response
class ScoreUpdateRequest(BaseModel):
    address: str
    submit_to_oracle: bool = False

class BatchScoreRequest(BaseModel):
    addresses: List[str]
    submit_to_oracle: bool = False

@app.post("/score/update")
async def update_score_with_oracle(request: ScoreUpdateRequest):
    """
    Calculate score and optionally submit to oracle
    
    Args:
        request: Contains address and oracle submission flag
        
    Returns:
        Score calculation result and oracle submission status
    """
    try:
        # Validate address format
        if not request.address.startswith('0x') or len(request.address) != 42:
            raise HTTPException(
                status_code=400, 
                detail="Invalid Ethereum address format"
            )
        
        logger.info(f"Calculating and updating score for address: {request.address}")
        
        # Calculate the score
        result = await calculate_score(request.address)
        
        response_data = {
            "success": True,
            "address": request.address,
            "score": result["score"],
            "metrics": result["metrics"],
            "timestamp": result.get("timestamp"),
            "version": result.get("version", "2.0")
        }
        
        # Submit to oracle if requested
        if request.submit_to_oracle:
            oracle_result = await submit_score_to_oracle(
                request.address, 
                result["score"], 
                version=2
            )
            response_data["oracle_submission"] = oracle_result
        
        return JSONResponse(status_code=200, content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating score for {request.address}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/score/batch")
async def batch_update_scores(request: BatchScoreRequest):
    """
    Calculate scores for multiple addresses and optionally submit to oracle
    
    Args:
        request: Contains list of addresses and oracle submission flag
        
    Returns:
        Batch processing results
    """
    try:
        if len(request.addresses) > 50:
            raise HTTPException(
                status_code=400,
                detail="Batch size too large. Maximum 50 addresses per request."
            )
        
        # Validate all addresses
        for addr in request.addresses:
            if not addr.startswith('0x') or len(addr) != 42:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid address format: {addr}"
                )
        
        logger.info(f"Batch processing {len(request.addresses)} addresses")
        
        # Calculate scores for all addresses
        results = []
        oracle_updates = []
        
        for address in request.addresses:
            try:
                score_result = await calculate_score(address)
                
                result_data = {
                    "address": address,
                    "success": True,
                    "score": score_result["score"],
                    "metrics": score_result["metrics"],
                    "timestamp": score_result.get("timestamp"),
                    "version": score_result.get("version", "2.0")
                }
                
                results.append(result_data)
                
                # Prepare for oracle submission if requested
                if request.submit_to_oracle:
                    oracle_updates.append({
                        "user": address,
                        "score": score_result["score"]
                    })
                    
            except Exception as e:
                logger.error(f"Error calculating score for {address}: {str(e)}")
                results.append({
                    "address": address,
                    "success": False,
                    "error": str(e)
                })
        
        response_data = {
            "success": True,
            "total_addresses": len(request.addresses),
            "successful_calculations": len([r for r in results if r.get("success")]),
            "results": results
        }
        
        # Submit to oracle if requested
        if request.submit_to_oracle and oracle_updates:
            oracle_result = await batch_submit_scores_to_oracle(oracle_updates)
            response_data["oracle_submission"] = oracle_result
        
        return JSONResponse(status_code=200, content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch score update: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "credo-api",
        "version": "2.0",
        "features": [
            "enhanced_scoring",
            "oracle_integration", 
            "batch_processing"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)