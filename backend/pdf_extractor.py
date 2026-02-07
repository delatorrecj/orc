"""
ORC PDF Table Extractor
Uses pdfplumber for reliable table extraction from invoices/POs.
"""

import pdfplumber
from pathlib import Path
from typing import List, Dict, Any, Optional, Union

def extract_tables(pdf_path: Union[str, Path]) -> List[Dict[str, Any]]:
    """
    Extract all tables from a PDF file.
    
    Returns a list of table objects with:
    - headers: List of column headers
    - rows: List of data rows
    - page: Page number where table was found
    """
    tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            page_tables = page.extract_tables()
            
            for table_idx, table in enumerate(page_tables):
                if not table or len(table) < 2:
                    continue  # Skip empty or header-only tables
                
                # First row is typically headers
                headers = [str(h).strip() if h else "" for h in table[0]]
                rows = []
                
                for row in table[1:]:
                    cleaned_row = [str(cell).strip() if cell else "" for cell in row]
                    if any(cleaned_row):  # Skip empty rows
                        rows.append(cleaned_row)
                
                if rows:
                    tables.append({
                        "headers": headers,
                        "rows": rows,
                        "page": page_num,
                        "table_index": table_idx
                    })
    
    return tables


def extract_with_grounding(pdf_path: str | Path) -> Dict[str, Any]:
    """
    Extract tables with bounding box coordinates for grounding map.
    
    Returns:
    - tables: List of tables with cell-level bounding boxes
    - page_dimensions: Dict mapping page numbers to (width, height)
    
    Each cell includes: value, bbox (x0, y0, x1, y1), page
    """
    result = {
        "tables": [],
        "page_dimensions": {},
        "grounding": []  # Flat list of all grounded values
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            # Store page dimensions for rendering
            result["page_dimensions"][page_num] = {
                "width": float(page.width),
                "height": float(page.height)
            }
            
            # Find tables with bounding boxes
            table_finder = page.find_tables()
            
            for table_idx, table in enumerate(table_finder):
                bbox = table.bbox  # (x0, y0, x1, y1)
                cells = table.cells  # List of cell bboxes
                
                # Extract table content
                extracted = table.extract()
                if not extracted or len(extracted) < 2:
                    continue
                
                headers = [str(h).strip() if h else "" for h in extracted[0]]
                rows_with_grounding = []
                
                # Map each cell to its bounding box
                cell_idx = 0
                for row_idx, row in enumerate(extracted):
                    row_data = []
                    for col_idx, cell_value in enumerate(row):
                        cell_bbox = cells[cell_idx] if cell_idx < len(cells) else None
                        cell_data = {
                            "value": str(cell_value).strip() if cell_value else "",
                            "bbox": list(cell_bbox) if cell_bbox else None,
                            "page": page_num,
                            "row": row_idx,
                            "col": col_idx
                        }
                        row_data.append(cell_data)
                        
                        # Add to flat grounding list (skip empty cells)
                        if cell_data["value"] and cell_bbox:
                            result["grounding"].append({
                                "text": cell_data["value"],
                                "bbox": list(cell_bbox),
                                "page": page_num,
                                "type": "header" if row_idx == 0 else "cell"
                            })
                        
                        cell_idx += 1
                    
                    if row_idx == 0:
                        continue  # Skip header row for rows_with_grounding
                    rows_with_grounding.append(row_data)
                
                result["tables"].append({
                    "headers": headers,
                    "rows": rows_with_grounding,
                    "page": page_num,
                    "table_bbox": list(bbox),
                    "table_index": table_idx
                })
    
    return result


def find_text_bbox(pdf_path: Union[str, Path], search_text: str) -> List[Dict[str, Any]]:
    """
    Find bounding boxes for specific text in the PDF.
    Useful for grounding extracted values like totals, dates.
    
    Returns list of matches with: text, bbox, page
    """
    matches = []
    search_lower = search_text.lower()
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            words = page.extract_words()
            
            for word in words:
                if search_lower in word["text"].lower():
                    matches.append({
                        "text": word["text"],
                        "bbox": [word["x0"], word["top"], word["x1"], word["bottom"]],
                        "page": page_num
                    })
    
    return matches


def find_line_items_table(tables: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Identify which table contains line items based on header patterns.
    
    Looks for tables with headers matching common invoice patterns:
    - Quantity/Qty, Description/Item, Price/Rate/Amount, Total, SKU/Part#
    """
    # Common header patterns (case-insensitive)
    line_item_patterns = [
        r"qty|quantity|units?",
        r"desc|description|item|product|service",
        r"price|rate|unit\s*price|cost",
        r"total|amount|extended|line\s*total",
    ]
    
    best_match = None
    best_score = 0
    
    for table in tables:
        headers_lower = [h.lower() for h in table["headers"]]
        score = 0
        
        for pattern in line_item_patterns:
            for header in headers_lower:
                if re.search(pattern, header):
                    score += 1
                    break
        
        # Prefer tables with more matching patterns and more rows
        if score > best_score or (score == best_score and best_match and len(table["rows"]) > len(best_match["rows"])):
            best_score = score
            best_match = table
    
    return best_match if best_score >= 2 else None  # Require at least 2 matching patterns


def extract_text(pdf_path: str | Path) -> str:
    """
    Extract all text from a PDF (for classification/summary).
    """
    text_parts = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    
    return "\n\n".join(text_parts)


def extract_metadata(pdf_path: str | Path) -> Dict[str, Any]:
    """
    Extract PDF metadata (author, creation date, etc.)
    """
    with pdfplumber.open(pdf_path) as pdf:
        return dict(pdf.metadata) if pdf.metadata else {}


def parse_number(value: str) -> float:
    """
    Parse a string to a number, handling currency symbols and commas.
    """
    if not value:
        return 0.0
    
    # Remove currency symbols, commas, spaces
    cleaned = re.sub(r"[^\d.\-]", "", value)
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


# --- MAIN TEST FUNCTION ---
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python pdf_extractor.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    print(f"Extracting from: {pdf_path}\n")
    
    # Extract tables
    tables = extract_tables(pdf_path)
    print(f"Found {len(tables)} table(s)\n")
    
    for i, table in enumerate(tables):
        print(f"--- Table {i+1} (Page {table['page']}) ---")
        print(f"Headers: {table['headers']}")
        print(f"Rows: {len(table['rows'])}")
        for row in table['rows'][:3]:  # Show first 3 rows
            print(f"  {row}")
        if len(table['rows']) > 3:
            print(f"  ... and {len(table['rows']) - 3} more rows")
        print()
    
    # Find line items table
    line_items = find_line_items_table(tables)
    if line_items:
        print("=== LINE ITEMS TABLE DETECTED ===")
        print(f"Headers: {line_items['headers']}")
        print(f"Total rows: {len(line_items['rows'])}")
    else:
        print("No line items table detected.")
