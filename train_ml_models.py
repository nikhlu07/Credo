#!/usr/bin/env python3
"""
Training script for Credo ML models
Run this to initialize and train the machine learning models
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Add services to path
sys.path.append(str(Path(__file__).parent))

from services.ml_scoring_service import ml_scorer, initialize_ml_models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """
    Main training function
    """
    logger.info("Starting Credo ML model training...")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    try:
        # Initialize and train models
        await initialize_ml_models()
        
        logger.info("✅ ML model training completed successfully!")
        logger.info("Models saved to: models/credo_ml_models.joblib")
        
        # Test the models with a sample
        logger.info("Testing trained models...")
        
        sample_features = {
            'wallet_age_days': 365,
            'transaction_count': 150,
            'eth_balance': 2.5,
            'liquidation_count': 0,
            'stablecoin_percentage': 30.0,
            'balance_stability_score': 75.0,
            'total_portfolio_value_usd': 5000.0
        }
        
        # Extract advanced features
        advanced_features = ml_scorer.extract_advanced_features("test", sample_features)
        
        # Get prediction
        prediction = ml_scorer.predict_score(advanced_features)
        
        logger.info(f"Sample prediction: {prediction['ensemble_score']}")
        logger.info(f"Model confidence: {prediction['confidence']:.2f}")
        logger.info(f"Model type: {prediction['model_type']}")
        
        # Show feature importance
        if prediction['feature_importance']:
            logger.info("Top 5 most important features:")
            sorted_features = sorted(
                prediction['feature_importance'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            
            for feature, importance in sorted_features:
                logger.info(f"  {feature}: {importance:.3f}")
        
        logger.info("🚀 Credo ML models are ready for production!")
        
    except Exception as e:
        logger.error(f"❌ Error during training: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())