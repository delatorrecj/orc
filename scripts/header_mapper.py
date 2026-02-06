"""
ORC Header Mapper
Uses Gemini AI to map raw table headers to standardized fields.
"""

import os
import json
from typing import Dict, List, Optional, Any

try:
    import google.generativeai as genai
except ImportError:
    print("WARNING: google-generativeai not installed. Run: pip install google-generativeai")
    genai = None


# Standard field names we want to map to
STANDARD_FIELDS = {
    "sku": "SKU, Part Number, Item Code, Product ID",
    "desc": "Description, Item, Product, Service, Name",
    "qty": "Quantity, Qty, Units, Count, Amount",
    "unit_price": "Unit Price, Price, Rate, Cost, Unit Cost",
    "total": "Total, Amount, Extended, Line Total, Subtotal"
}


class HeaderMapper:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.model = None
        
        if self.api_key and genai:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                generation_config={
                    "temperature": 0.1,
                    "response_mime_type": "application/json"
                }
            )
    
    def map_columns(self, headers: List[str], sample_row: Optional[List[str]] = None) -> Dict[str, str]:
        """
        Map raw column headers to standard field names.
        
        Args:
            headers: List of raw column headers from the PDF table
            sample_row: Optional sample data row to help with mapping
        
        Returns:
            Mapping dict like {"sku": "Part #", "desc": "Description", ...}
        """
        if not self.model:
            # Fallback to rule-based mapping if no API
            return self._rule_based_mapping(headers)
        
        prompt = f"""
You are a data mapping assistant. Map these raw column headers to our standard field names.

RAW HEADERS: {json.dumps(headers)}
{"SAMPLE DATA ROW: " + json.dumps(sample_row) if sample_row else ""}

STANDARD FIELDS TO MAP TO:
- sku: SKU, Part Number, Item Code, Product ID (alphanumeric identifier)
- desc: Description, Item, Product, Service, Name (text describing the item)
- qty: Quantity, Qty, Units, Count (number of items)
- unit_price: Unit Price, Price, Rate, Cost (price per unit)
- total: Total, Amount, Extended, Line Total (qty × unit_price)

Return a JSON object mapping each standard field to the matching raw header.
If a field has no match, set it to null.

Example response:
{{"sku": "Part #", "desc": "Description", "qty": "Qty", "unit_price": "Rate", "total": "Amount"}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            mapping = json.loads(response.text)
            return mapping
        except Exception as e:
            print(f"[HeaderMapper] AI mapping failed: {e}")
            return self._rule_based_mapping(headers)
    
    def _rule_based_mapping(self, headers: List[str]) -> Dict[str, str]:
        """
        Fallback rule-based mapping when AI is unavailable.
        """
        import re
        
        mapping = {
            "sku": None,
            "desc": None,
            "qty": None,
            "unit_price": None,
            "total": None
        }
        
        patterns = {
            "sku": r"sku|part\s*#?|item\s*#?|code|product\s*id",
            "desc": r"desc|description|item(?!\s*#)|product(?!\s*id)|service|name",
            "qty": r"qty|quantity|units?|count|amount(?!\s*due)",
            "unit_price": r"unit\s*price|price|rate|cost|unit\s*cost",
            "total": r"total|amount|extended|line\s*total|subtotal"
        }
        
        for header in headers:
            header_lower = header.lower().strip()
            for field, pattern in patterns.items():
                if mapping[field] is None and re.search(pattern, header_lower):
                    mapping[field] = header
                    break
        
        return mapping
    
    def apply_mapping(self, mapping: Dict[str, str], headers: List[str], rows: List[List[str]]) -> List[Dict[str, Any]]:
        """
        Apply column mapping to convert raw rows to standardized objects.
        """
        # Create header index lookup
        header_to_idx = {h: i for i, h in enumerate(headers)}
        
        result = []
        for row in rows:
            item = {}
            for field, header in mapping.items():
                if header and header in header_to_idx:
                    idx = header_to_idx[header]
                    if idx < len(row):
                        item[field] = row[idx]
                    else:
                        item[field] = None
                else:
                    item[field] = None
            result.append(item)
        
        return result


# --- MAIN TEST ---
if __name__ == "__main__":
    mapper = HeaderMapper()
    
    # Test with sample headers
    test_headers = ["Part #", "Description", "Qty", "Rate", "Amount"]
    test_row = ["ABC-123", "Industrial Widget", "10", "25.00", "250.00"]
    
    print("Testing Header Mapper...")
    print(f"Raw headers: {test_headers}")
    print(f"Sample row: {test_row}")
    
    mapping = mapper.map_columns(test_headers, test_row)
    print(f"\nMapping result: {json.dumps(mapping, indent=2)}")
    
    # Apply mapping
    rows = [test_row, ["DEF-456", "Steel Component", "5", "50.00", "250.00"]]
    normalized = mapper.apply_mapping(mapping, test_headers, rows)
    print(f"\nNormalized items: {json.dumps(normalized, indent=2)}")
