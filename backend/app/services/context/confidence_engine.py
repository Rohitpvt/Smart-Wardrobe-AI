class ConfidenceEngine:
    """
    Standardizes confidence scoring across all context and intelligence engines.
    """
    def calculate_confidence(
        self,
        data_volume: float,
        recency: float,
        consistency: float,
        signal_strength: float
    ) -> float:
        """
        Calculates a standardized confidence score (0-100).
        
        Args:
            data_volume (float): 0.0 to 1.0 (How much data supports this insight?)
            recency (float): 0.0 to 1.0 (How recent is the supporting data?)
            consistency (float): 0.0 to 1.0 (How consistently does this pattern appear?)
            signal_strength (float): 0.0 to 1.0 (How strong is the correlation/event?)
            
        Returns:
            float: Confidence score clamped between 0 and 100.
        """
        # Base weightings
        WEIGHT_VOLUME = 0.20
        WEIGHT_RECENCY = 0.20
        WEIGHT_CONSISTENCY = 0.30
        WEIGHT_STRENGTH = 0.30
        
        score = (
            (data_volume * WEIGHT_VOLUME) +
            (recency * WEIGHT_RECENCY) +
            (consistency * WEIGHT_CONSISTENCY) +
            (signal_strength * WEIGHT_STRENGTH)
        ) * 100.0
        
        return max(0.0, min(100.0, score))

confidence_engine = ConfidenceEngine()
