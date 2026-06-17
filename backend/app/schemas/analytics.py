from enum import Enum

class AnalyticsWindow(str, Enum):
    DAYS_30 = "30D"
    DAYS_90 = "90D"
    DAYS_365 = "365D"
    ALL = "ALL"
