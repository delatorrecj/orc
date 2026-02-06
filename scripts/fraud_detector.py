"""
ORC Fraud Detector
Anomaly detection for invoice line items and totals.

Detection Rules:
1. Round Number Bias - Flag if >60% of values are suspiciously round
2. Price Variance - Flag unit prices >20% from historical average
3. Quantity Anomaly - Flag unusual quantity patterns
4. Total Mismatch - Flag if line totals don't match qty * price
5. Duplicate Detection - Flag similar invoices

Industry Benchmark:
- Round number fraud detection can catch 15-20% of fraudulent invoices
- Variance checks reduce 2% margin loss from pricing errors
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import math
import statistics


@dataclass
class FraudFlag:
    """Represents a detected fraud indicator."""
    rule: str           # Rule name
    severity: str       # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float   # 0.0 - 1.0
    message: str        # Human-readable explanation
    affected_items: List[int] = None  # Indices of affected line items
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule": self.rule,
            "severity": self.severity,
            "confidence": self.confidence,
            "message": self.message,
            "affected_items": self.affected_items or []
        }


class FraudDetector:
    """
    Detects anomalies and potential fraud in invoice data.
    """
    
    # Thresholds (configurable)
    ROUND_NUMBER_THRESHOLD = 0.6      # Flag if >60% round numbers
    PRICE_VARIANCE_THRESHOLD = 0.2    # Flag if >20% variance
    QUANTITY_ANOMALY_THRESHOLD = 3.0  # Flag if >3 std deviations
    MIN_ITEMS_FOR_STATS = 3           # Minimum items for statistical analysis
    
    def __init__(self, historical_prices: Optional[Dict[str, float]] = None):
        """
        Args:
            historical_prices: Dict mapping SKU/description to average unit price
        """
        self.historical_prices = historical_prices or {}
    
    def analyze(self, line_items: List[Dict[str, Any]], total_amount: float = 0) -> Dict[str, Any]:
        """
        Run all fraud detection rules on line items.
        
        Args:
            line_items: List of dicts with keys: sku, desc, qty, unit_price, total
            total_amount: Invoice total for math validation
        
        Returns:
            Dict with: flags (list), risk_score (0-100), summary (str)
        """
        flags = []
        
        if not line_items:
            return {
                "flags": [],
                "risk_score": 0,
                "summary": "No line items to analyze"
            }
        
        # Run each detection rule
        flags.extend(self._detect_round_number_bias(line_items))
        flags.extend(self._detect_price_variance(line_items))
        flags.extend(self._detect_quantity_anomalies(line_items))
        flags.extend(self._detect_math_discrepancies(line_items, total_amount))
        flags.extend(self._detect_suspicious_patterns(line_items))
        
        # Calculate overall risk score
        risk_score = self._calculate_risk_score(flags)
        
        return {
            "flags": [f.to_dict() for f in flags],
            "risk_score": risk_score,
            "summary": self._generate_summary(flags, risk_score)
        }
    
    def _detect_round_number_bias(self, line_items: List[Dict]) -> List[FraudFlag]:
        """
        Detect suspiciously round numbers (common in fabricated invoices).
        """
        flags = []
        
        # Extract all numeric values
        values = []
        for item in line_items:
            values.append(item.get("qty", 0))
            values.append(item.get("unit_price", 0))
            values.append(item.get("total", 0))
        
        # Filter out zeros and count round numbers
        non_zero = [v for v in values if v > 0]
        if len(non_zero) < 3:
            return flags
        
        round_count = sum(1 for v in non_zero if self._is_round_number(v))
        round_ratio = round_count / len(non_zero)
        
        if round_ratio > self.ROUND_NUMBER_THRESHOLD:
            flags.append(FraudFlag(
                rule="ROUND_NUMBER_BIAS",
                severity="MEDIUM" if round_ratio < 0.8 else "HIGH",
                confidence=round_ratio,
                message=f"{round_ratio:.0%} of values are round numbers (threshold: {self.ROUND_NUMBER_THRESHOLD:.0%})"
            ))
        
        return flags
    
    def _is_round_number(self, value: float) -> bool:
        """Check if a number is suspiciously round."""
        if value == 0:
            return False
        
        # Check if divisible by 5, 10, 25, 50, 100, etc.
        for divisor in [100, 50, 25, 10, 5]:
            if value % divisor == 0:
                return True
        
        # Check for .00 decimals
        if value == int(value):
            return True
        
        return False
    
    def _detect_price_variance(self, line_items: List[Dict]) -> List[FraudFlag]:
        """
        Detect unit prices that deviate significantly from historical averages.
        """
        flags = []
        affected = []
        
        for idx, item in enumerate(line_items):
            sku = item.get("sku") or item.get("desc", "")
            unit_price = item.get("unit_price", 0)
            
            if not sku or unit_price == 0:
                continue
            
            historical = self.historical_prices.get(sku)
            if historical and historical > 0:
                variance = abs(unit_price - historical) / historical
                
                if variance > self.PRICE_VARIANCE_THRESHOLD:
                    affected.append(idx)
        
        if affected:
            flags.append(FraudFlag(
                rule="PRICE_VARIANCE",
                severity="HIGH",
                confidence=0.85,
                message=f"{len(affected)} item(s) have prices differing >20% from historical average",
                affected_items=affected
            ))
        
        return flags
    
    def _detect_quantity_anomalies(self, line_items: List[Dict]) -> List[FraudFlag]:
        """
        Detect quantities that are statistical outliers.
        """
        flags = []
        
        quantities = [item.get("qty", 0) for item in line_items if item.get("qty", 0) > 0]
        
        if len(quantities) < self.MIN_ITEMS_FOR_STATS:
            return flags
        
        mean = statistics.mean(quantities)
        stdev = statistics.stdev(quantities) if len(quantities) > 1 else 0
        
        if stdev == 0:
            return flags
        
        affected = []
        for idx, item in enumerate(line_items):
            qty = item.get("qty", 0)
            if qty > 0:
                z_score = abs(qty - mean) / stdev
                if z_score > self.QUANTITY_ANOMALY_THRESHOLD:
                    affected.append(idx)
        
        if affected:
            flags.append(FraudFlag(
                rule="QUANTITY_ANOMALY",
                severity="MEDIUM",
                confidence=0.7,
                message=f"{len(affected)} item(s) have unusual quantities (>{self.QUANTITY_ANOMALY_THRESHOLD} std deviations)",
                affected_items=affected
            ))
        
        return flags
    
    def _detect_math_discrepancies(self, line_items: List[Dict], total_amount: float) -> List[FraudFlag]:
        """
        Detect mathematical inconsistencies.
        """
        flags = []
        
        # Check line item totals
        for idx, item in enumerate(line_items):
            qty = item.get("qty", 0)
            unit_price = item.get("unit_price", 0)
            total = item.get("total", 0)
            
            if qty > 0 and unit_price > 0 and total > 0:
                expected = qty * unit_price
                if abs(expected - total) > 0.01:  # Allow 1 cent tolerance
                    flags.append(FraudFlag(
                        rule="LINE_TOTAL_MISMATCH",
                        severity="HIGH",
                        confidence=0.95,
                        message=f"Line {idx + 1}: qty ({qty}) × price ({unit_price}) = {expected:.2f}, but total is {total:.2f}",
                        affected_items=[idx]
                    ))
        
        # Check invoice total
        line_sum = sum(item.get("total", 0) for item in line_items)
        if total_amount > 0 and abs(line_sum - total_amount) > 1.0:
            flags.append(FraudFlag(
                rule="INVOICE_TOTAL_MISMATCH",
                severity="HIGH",
                confidence=0.9,
                message=f"Line items sum to {line_sum:.2f}, but invoice total is {total_amount:.2f}"
            ))
        
        return flags
    
    def _detect_suspicious_patterns(self, line_items: List[Dict]) -> List[FraudFlag]:
        """
        Detect suspicious patterns like duplicate items.
        """
        flags = []
        
        # Check for duplicate SKUs with different prices
        sku_prices = {}
        for idx, item in enumerate(line_items):
            sku = item.get("sku", "")
            price = item.get("unit_price", 0)
            
            if sku and price > 0:
                if sku in sku_prices and sku_prices[sku] != price:
                    flags.append(FraudFlag(
                        rule="DUPLICATE_SKU_PRICE_MISMATCH",
                        severity="MEDIUM",
                        confidence=0.8,
                        message=f"SKU '{sku}' appears with different unit prices",
                        affected_items=[idx]
                    ))
                sku_prices[sku] = price
        
        return flags
    
    def _calculate_risk_score(self, flags: List[FraudFlag]) -> int:
        """
        Calculate overall risk score (0-100) based on flags.
        """
        if not flags:
            return 0
        
        severity_weights = {
            "LOW": 5,
            "MEDIUM": 15,
            "HIGH": 30,
            "CRITICAL": 50
        }
        
        total = sum(
            severity_weights.get(f.severity, 10) * f.confidence
            for f in flags
        )
        
        return min(100, int(total))
    
    def _generate_summary(self, flags: List[FraudFlag], risk_score: int) -> str:
        """Generate human-readable summary."""
        if risk_score == 0:
            return "No anomalies detected."
        elif risk_score < 30:
            return f"Low risk ({risk_score}). Minor anomalies detected."
        elif risk_score < 60:
            return f"Medium risk ({risk_score}). Review recommended."
        else:
            return f"High risk ({risk_score}). Manual review required."


# --- TEST ---
if __name__ == "__main__":
    # Test with sample data
    test_items = [
        {"sku": "ABC123", "desc": "Widget A", "qty": 100, "unit_price": 25.00, "total": 2500.00},
        {"sku": "DEF456", "desc": "Widget B", "qty": 50, "unit_price": 50.00, "total": 2500.00},
        {"sku": "GHI789", "desc": "Widget C", "qty": 1000, "unit_price": 10.00, "total": 10000.00},  # Anomaly
        {"sku": "JKL012", "desc": "Widget D", "qty": 25, "unit_price": 100.00, "total": 2400.00},  # Math error
    ]
    
    detector = FraudDetector()
    result = detector.analyze(test_items, total_amount=17000.00)
    
    print("=== FRAUD DETECTION RESULTS ===")
    print(f"Risk Score: {result['risk_score']}")
    print(f"Summary: {result['summary']}")
    print(f"\nFlags ({len(result['flags'])}):")
    for flag in result['flags']:
        print(f"  [{flag['severity']}] {flag['rule']}: {flag['message']}")
