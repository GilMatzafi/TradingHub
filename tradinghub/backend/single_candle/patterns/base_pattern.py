from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any

class BasePattern(ABC):
    """Base class for all pattern detectors"""
    
    @abstractmethod
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
            
        Returns:
            pd.DataFrame: DataFrame with pattern detection results
        """
        pass
    
    @abstractmethod
    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates pattern presence
        
        Returns:
            str: Name of the pattern column
        """
        pass 