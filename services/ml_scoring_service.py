"""
Enhanced ML-based Credit Scoring Service for Credo
Combines rule-based scoring with machine learning models
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import logging
from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
import asyncio
import httpx
from web3 import Web3

logger = logging.getLogger(__name__)

class MLCredoScorer:
    """
    Machine Learning-based Credo Score calculator
    Uses ensemble methods to predict creditworthiness
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.is_trained = False
        
        # Initialize models
        self.models['rf'] = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.models['gb'] = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        self.scalers['standard'] = StandardScaler()
        self.scalers['robust'] = RobustScaler()
    
    def extract_advanced_features(self, address: str, basic_metrics: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract advanced features for ML model
        
        Args:
            address: Wallet address
            basic_metrics: Basic metrics from existing system
            
        Returns:
            Dictionary of advanced features
        """
        features = {}
        
        # Basic features from existing system
        features['wallet_age_days'] = float(basic_metrics.get('wallet_age_days', 0))
        features['transaction_count'] = float(basic_metrics.get('transaction_count', 0))
        features['eth_balance'] = float(basic_metrics.get('eth_balance', 0))
        features['liquidation_count'] = float(basic_metrics.get('liquidation_count', 0))
        features['stablecoin_percentage'] = float(basic_metrics.get('stablecoin_percentage', 0))
        features['balance_stability_score'] = float(basic_metrics.get('balance_stability_score', 0))
        features['total_portfolio_value_usd'] = float(basic_metrics.get('total_portfolio_value_usd', 0))
        
        # Advanced derived features
        
        # 1. Activity Ratios
        if features['wallet_age_days'] > 0:
            features['tx_per_day'] = features['transaction_count'] / features['wallet_age_days']
            features['value_per_day'] = features['total_portfolio_value_usd'] / features['wallet_age_days']
        else:
            features['tx_per_day'] = 0
            features['value_per_day'] = 0
        
        # 2. Risk Indicators
        features['liquidation_rate'] = features['liquidation_count'] / max(1, features['transaction_count'])
        features['portfolio_concentration'] = 100 - features['stablecoin_percentage']  # Higher = more concentrated in volatile assets
        
        # 3. Wealth Indicators
        features['eth_dominance'] = (features['eth_balance'] * 2000) / max(1, features['total_portfolio_value_usd']) * 100
        features['log_portfolio_value'] = np.log1p(features['total_portfolio_value_usd'])
        
        # 4. Behavioral Patterns
        features['is_whale'] = 1.0 if features['total_portfolio_value_usd'] > 100000 else 0.0
        features['is_active_trader'] = 1.0 if features['tx_per_day'] > 1.0 else 0.0
        features['is_hodler'] = 1.0 if features['tx_per_day'] < 0.1 and features['wallet_age_days'] > 365 else 0.0
        
        # 5. Stability Metrics
        features['stability_age_ratio'] = features['balance_stability_score'] * features['wallet_age_days'] / 365
        features['diversification_score'] = min(features['stablecoin_percentage'], 100 - features['stablecoin_percentage'])
        
        return features
    
    def create_synthetic_training_data(self, n_samples: int = 10000) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Create synthetic training data based on DeFi patterns
        In production, this would be replaced with real historical data
        
        Args:
            n_samples: Number of synthetic samples to generate
            
        Returns:
            Tuple of (features_df, target_scores)
        """
        np.random.seed(42)
        
        # Generate synthetic wallet data
        data = []
        
        for _ in range(n_samples):
            # Generate correlated features that make sense for DeFi
            wallet_age = np.random.exponential(200)  # Most wallets are newer
            wallet_age = min(wallet_age, 2000)  # Cap at ~5.5 years
            
            # Transaction count correlated with age
            base_tx_rate = np.random.lognormal(0, 1)  # Log-normal distribution
            tx_count = int(wallet_age * base_tx_rate / 30)  # Transactions per month
            tx_count = max(0, min(tx_count, 10000))
            
            # Portfolio value - power law distribution (few whales, many small wallets)
            portfolio_value = np.random.pareto(1.16) * 1000  # Pareto distribution
            portfolio_value = min(portfolio_value, 10000000)  # Cap at $10M
            
            # ETH balance correlated with portfolio value
            eth_balance = portfolio_value * np.random.beta(2, 5) / 2000  # Beta distribution for allocation
            
            # Stablecoin percentage - preference for stability
            stablecoin_pct = np.random.beta(2, 3) * 100  # Skewed towards lower percentages
            
            # Liquidation events - rare but impactful
            liquidation_prob = 0.05 + (0.1 if portfolio_value > 50000 else 0)  # Whales more likely to get liquidated
            liquidation_count = np.random.poisson(liquidation_prob * tx_count / 100)
            
            # Balance stability - correlated with experience and portfolio size
            stability_base = 50 + (wallet_age / 10) + (np.log1p(portfolio_value) * 2)
            stability_noise = np.random.normal(0, 15)
            balance_stability = max(0, min(100, stability_base + stability_noise))
            
            sample = {
                'wallet_age_days': wallet_age,
                'transaction_count': tx_count,
                'eth_balance': eth_balance,
                'liquidation_count': liquidation_count,
                'stablecoin_percentage': stablecoin_pct,
                'balance_stability_score': balance_stability,
                'total_portfolio_value_usd': portfolio_value
            }
            
            data.append(sample)
        
        # Convert to DataFrame and extract features
        df = pd.DataFrame(data)
        
        # Extract advanced features for each sample
        feature_rows = []
        for _, row in df.iterrows():
            features = self.extract_advanced_features("synthetic", row.to_dict())
            feature_rows.append(features)
        
        features_df = pd.DataFrame(feature_rows)
        
        # Generate target scores based on realistic credit scoring logic
        target_scores = []
        for _, row in features_df.iterrows():
            score = self.calculate_synthetic_target_score(row.to_dict())
            target_scores.append(score)
        
        return features_df, np.array(target_scores)
    
    def calculate_synthetic_target_score(self, features: Dict[str, float]) -> float:
        """
        Calculate synthetic target scores for training
        Based on realistic DeFi credit scoring principles
        """
        score = 500  # Base score
        
        # Wallet maturity (0-150 points)
        age_score = min(150, features['wallet_age_days'] * 150 / 730)  # 2 years for max
        score += age_score
        
        # Activity level (0-100 points)
        activity_score = min(100, features['tx_per_day'] * 100)
        score += activity_score
        
        # Portfolio size (0-100 points) - log scale
        wealth_score = min(100, features['log_portfolio_value'] * 10)
        score += wealth_score
        
        # Stability (0-100 points)
        stability_score = features['balance_stability_score']
        score += stability_score
        
        # Diversification (0-75 points)
        diversification_score = features['diversification_score'] * 0.75
        score += diversification_score
        
        # Penalties
        # Liquidation penalty (-50 points per liquidation)
        liquidation_penalty = features['liquidation_count'] * 50
        score -= liquidation_penalty
        
        # Extreme concentration penalty
        if features['portfolio_concentration'] > 90:
            score -= 50
        
        # Inactivity penalty
        if features['tx_per_day'] < 0.01 and features['wallet_age_days'] > 30:
            score -= 25
        
        # Bonuses
        # Whale bonus (if managed well)
        if features['is_whale'] and features['liquidation_count'] == 0:
            score += 25
        
        # Long-term holder bonus
        if features['is_hodler'] and features['balance_stability_score'] > 70:
            score += 25
        
        # Ensure score is in valid range
        score = max(0, min(1000, score))
        
        # Add some noise to make it more realistic
        noise = np.random.normal(0, 10)
        score = max(0, min(1000, score + noise))
        
        return score
    
    def train_models(self, features_df: pd.DataFrame, target_scores: np.ndarray):
        """
        Train the ML models on the provided data
        
        Args:
            features_df: DataFrame with features
            target_scores: Array of target scores
        """
        logger.info("Training ML models for credit scoring...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features_df, target_scores, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scalers['standard'].fit_transform(X_train)
        X_test_scaled = self.scalers['standard'].transform(X_test)
        
        # Train models
        for name, model in self.models.items():
            logger.info(f"Training {name} model...")
            
            if name == 'rf':
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                self.feature_importance[name] = dict(zip(features_df.columns, model.feature_importances_))
            else:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
            
            # Evaluate
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            logger.info(f"{name} model - MSE: {mse:.2f}, R2: {r2:.3f}")
        
        self.is_trained = True
        logger.info("ML model training completed!")
    
    def predict_score(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict credit score using trained ML models
        
        Args:
            features: Dictionary of extracted features
            
        Returns:
            Dictionary with predictions and confidence metrics
        """
        if not self.is_trained:
            logger.warning("Models not trained, using rule-based fallback")
            return self.rule_based_fallback(features)
        
        # Convert to DataFrame
        feature_df = pd.DataFrame([features])
        
        # Make predictions with each model
        predictions = {}
        
        # Random Forest (uses raw features)
        rf_pred = self.models['rf'].predict(feature_df)[0]
        predictions['random_forest'] = max(0, min(1000, rf_pred))
        
        # Gradient Boosting (uses scaled features)
        feature_scaled = self.scalers['standard'].transform(feature_df)
        gb_pred = self.models['gb'].predict(feature_scaled)[0]
        predictions['gradient_boosting'] = max(0, min(1000, gb_pred))
        
        # Ensemble prediction (weighted average)
        ensemble_score = (predictions['random_forest'] * 0.6 + 
                         predictions['gradient_boosting'] * 0.4)
        
        # Calculate confidence based on agreement between models
        model_agreement = 1 - abs(predictions['random_forest'] - predictions['gradient_boosting']) / 1000
        confidence = max(0.5, model_agreement)  # Minimum 50% confidence
        
        return {
            'ensemble_score': int(ensemble_score),
            'individual_predictions': predictions,
            'confidence': confidence,
            'feature_importance': self.feature_importance.get('rf', {}),
            'model_type': 'ml_ensemble'
        }
    
    def rule_based_fallback(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Fallback to rule-based scoring if ML models aren't available
        Enhanced version of the original algorithm
        """
        # Use the original algorithm logic but with advanced features
        wallet_age = features.get('wallet_age_days', 0)
        tx_count = features.get('transaction_count', 0)
        liquidation_count = features.get('liquidation_count', 0)
        stablecoin_pct = features.get('stablecoin_percentage', 0)
        stability_score = features.get('balance_stability_score', 0)
        
        # Enhanced scoring with new features
        tx_per_day = features.get('tx_per_day', 0)
        portfolio_value = features.get('total_portfolio_value_usd', 0)
        
        # Age score (0-200)
        if wallet_age >= 730:  # 2+ years
            age_score = 200
        elif wallet_age >= 365:  # 1+ year
            age_score = 150 + (wallet_age - 365) * 50 / 365
        else:
            age_score = wallet_age * 150 / 365
        
        # Activity score (0-200) - now considers rate
        if tx_per_day >= 1.0:  # Very active
            activity_score = 200
        elif tx_per_day >= 0.5:  # Active
            activity_score = 150 + (tx_per_day - 0.5) * 100
        elif tx_per_day >= 0.1:  # Moderate
            activity_score = 100 + (tx_per_day - 0.1) * 125
        else:
            activity_score = tx_per_day * 1000  # Scale up small values
        
        # Liquidation score (0-200)
        liquidation_score = max(0, 200 - liquidation_count * 50)
        
        # Asset mix score (0-200)
        if 20 <= stablecoin_pct <= 60:
            asset_score = 200
        elif 10 <= stablecoin_pct <= 80:
            asset_score = 150
        else:
            asset_score = 100
        
        # Stability score (0-200)
        stability_points = stability_score * 2
        
        total_score = age_score + activity_score + liquidation_score + asset_score + stability_points
        final_score = max(0, min(1000, int(total_score)))
        
        return {
            'ensemble_score': final_score,
            'individual_predictions': {'rule_based': final_score},
            'confidence': 0.7,  # Moderate confidence for rule-based
            'feature_importance': {},
            'model_type': 'rule_based_enhanced'
        }
    
    def save_models(self, filepath: str):
        """Save trained models to disk"""
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'feature_importance': self.feature_importance,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Models saved to {filepath}")
    
    def load_models(self, filepath: str):
        """Load trained models from disk"""
        try:
            model_data = joblib.load(filepath)
            self.models = model_data['models']
            self.scalers = model_data['scalers']
            self.feature_importance = model_data['feature_importance']
            self.is_trained = model_data['is_trained']
            logger.info(f"Models loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.is_trained = False

# Global ML scorer instance
ml_scorer = MLCredoScorer()

async def calculate_ml_enhanced_score(address: str, basic_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate ML-enhanced credit score
    
    Args:
        address: Wallet address
        basic_metrics: Basic metrics from existing system
        
    Returns:
        Enhanced score with ML predictions
    """
    try:
        # Extract advanced features
        features = ml_scorer.extract_advanced_features(address, basic_metrics)
        
        # Get ML prediction
        ml_result = ml_scorer.predict_score(features)
        
        # Combine with rule-based score for comparison
        rule_based_score = calculate_rule_based_score(basic_metrics)
        
        # Final ensemble (70% ML, 30% rule-based for safety)
        if ml_result['model_type'] == 'ml_ensemble':
            final_score = int(ml_result['ensemble_score'] * 0.7 + rule_based_score * 0.3)
        else:
            final_score = ml_result['ensemble_score']
        
        return {
            'score': final_score,
            'ml_score': ml_result['ensemble_score'],
            'rule_based_score': rule_based_score,
            'confidence': ml_result['confidence'],
            'model_predictions': ml_result['individual_predictions'],
            'feature_importance': ml_result['feature_importance'],
            'advanced_features': features,
            'model_type': ml_result['model_type']
        }
        
    except Exception as e:
        logger.error(f"Error in ML-enhanced scoring: {str(e)}")
        # Fallback to rule-based
        return {
            'score': calculate_rule_based_score(basic_metrics),
            'error': str(e),
            'model_type': 'fallback'
        }

def calculate_rule_based_score(metrics: Dict[str, Any]) -> int:
    """
    Original rule-based scoring for comparison/fallback
    """
    wallet_age = metrics.get("wallet_age_days", 0)
    tx_count = metrics.get("transaction_count", 0)
    liquidation_count = metrics.get("liquidation_count", 0)
    stablecoin_pct = metrics.get("stablecoin_percentage", 0.0)
    stability_score = metrics.get("balance_stability_score", 0)
    
    # Original algorithm
    if wallet_age >= 365:
        age_score = 200
    elif wallet_age >= 180:
        age_score = 150 + (wallet_age - 180) * 50 / 185
    else:
        age_score = wallet_age * 150 / 365
    
    if tx_count >= 100:
        tx_score = 200
    elif tx_count >= 50:
        tx_score = 150 + (tx_count - 50) * 50 / 50
    else:
        tx_score = tx_count * 150 / 50
    
    liquidation_score = max(0, 200 - liquidation_count * 50)
    
    if 20 <= stablecoin_pct <= 60:
        asset_score = 200
    else:
        asset_score = 100
    
    stability_points = stability_score * 2
    
    total_score = age_score + tx_score + liquidation_score + asset_score + stability_points
    return max(0, min(1000, int(total_score)))

def initialize_ml_models():
    """
    Initialize and train ML models with synthetic data
    In production, this would use real historical data
    """
    logger.info("Initializing ML models...")
    
    # Generate synthetic training data
    features_df, target_scores = ml_scorer.create_synthetic_training_data(10000)
    
    # Train models
    ml_scorer.train_models(features_df, target_scores)
    
    # Save models
    ml_scorer.save_models('models/credo_ml_models.joblib')
    
    logger.info("ML models initialized and ready!")

# Initialize models when module is imported
# asyncio.create_task(initialize_ml_models())