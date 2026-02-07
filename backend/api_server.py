"""
ORC API Server
FastAPI server exposing the full extraction pipeline:
- Gatekeeper: Document classification
- Analyst: Table extraction + header mapping
- Guardian: Compliance validation

Run with: uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import json
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sys

# Ensure backend directory is in python path for local imports
sys.path.append(str(Path(__file__).parent))

# Local imports
from pdf_extractor import (
    extract_tables, find_line_items_table, extract_text, 
    parse_number, extract_with_grounding
)
from header_mapper import HeaderMapper
from fraud_detector import FraudDetector

# Gemini setup
# Gemini setup
try:
    import google.generativeai as genai
    from dotenv import load_dotenv
    import itertools
    
    # Load environment variables
    load_dotenv(Path(__file__).parent.parent / ".env")
    
    # Parse keys
    keys_str = os.environ.get("GEMINI_API_KEYS") or os.environ.get("GEMINI_API_KEY")
    API_KEYS = [k.strip() for k in keys_str.split(",")] if keys_str else []
    
    # Create valid key cycle
    KEY_CYCLE = itertools.cycle(API_KEYS) if API_KEYS else None
    
    print(f"Loaded {len(API_KEYS)} Gemini API keys.")
    
except ImportError:
    genai = None
    KEY_CYCLE = None


# --- PYDANTIC MODELS ---

class LineItem(BaseModel):
    sku: Optional[str] = None
    desc: Optional[str] = None
    qty: float = 0
    unit_price: float = 0
    total: float = 0


class GatekeeperResult(BaseModel):
    doc_type: str
    vendor_name: Optional[str] = None
    confidence_score: float
    summary: str


class AnalystResult(BaseModel):
    po_number: Optional[str] = None
    invoice_date: Optional[str] = None
    vendor_details: Optional[Dict[str, str]] = None
    line_items: List[LineItem] = []
    subtotal: float = 0
    tax_amount: float = 0
    total_amount: float = 0
    currency: str = "USD"
    extraction_method: str = "pdfplumber"


class GuardianResult(BaseModel):
    status: str  # PASS, REVIEW, REJECT
    flags: List[str] = []
    reasoning: str
    pii_detected: bool = False
    requires_human_review: bool = False


class GroundingItem(BaseModel):
    text: str
    bbox: List[float]  # [x0, y0, x1, y1]
    page: int
    type: str  # "header", "cell", "total"


class GroundingData(BaseModel):
    items: List[GroundingItem] = []
    page_dimensions: Dict[int, Dict[str, float]] = {}


class FraudFlag(BaseModel):
    rule: str
    severity: str
    confidence: float
    message: str
    affected_items: List[int] = []


class FraudResult(BaseModel):
    flags: List[FraudFlag] = []
    risk_score: int = 0
    summary: str = "No analysis performed"


class ExtractionResponse(BaseModel):
    gatekeeper: GatekeeperResult
    analyst: Optional[AnalystResult] = None
    guardian: Optional[GuardianResult] = None
    grounding: Optional[GroundingData] = None
    fraud: Optional[FraudResult] = None
    processing_time_ms: int
    extracted_at: str


# --- FASTAPI APP ---

app = FastAPI(
    title="ORC Extraction API",
    description="AI-powered document extraction with pdfplumber and Gemini",
    version="1.0.0"
)

# CORS for Next.js frontend (configurable for production)
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"CRITICAL UNHANDLED ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": f"Internal Server Error: {str(exc)}", "detail": str(exc)}
    )


# --- AGENT FUNCTIONS ---

def get_model():
    """Get Gemini model instance with key rotation."""
    if not KEY_CYCLE or not genai:
        return None
    
    # Rotate key
    current_key = next(KEY_CYCLE)
    genai.configure(api_key=current_key)
    
    return genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config={
            "temperature": 0.1,
            "response_mime_type": "application/json"
        }
    )


def run_gatekeeper(text: str) -> GatekeeperResult:
    """
    Classify document type and extract basic metadata.
    """
    model = get_model()
    
    prompt = """
You are the Gatekeeper. Classify this document and extract metadata.

DOCUMENT TEXT:
{text}

Return JSON:
{{
    "doc_type": "Invoice" | "Purchase_Order" | "Chat_Log" | "Email" | "Unknown",
    "vendor_name": "Best guess of vendor name or null",
    "confidence_score": 0.0-1.0,
    "summary": "One sentence summary"
}}
""".format(text=text[:5000])  # Limit text length
    
    if model:
        try:
            response = model.generate_content(prompt)
            data = json.loads(response.text)
            return GatekeeperResult(**data)
        except Exception as e:
            print(f"[Gatekeeper] Error: {e}")
    
    # Fallback: basic classification
    text_lower = text.lower()
    if "invoice" in text_lower:
        doc_type = "Invoice"
    elif "purchase order" in text_lower or "p.o." in text_lower:
        doc_type = "Purchase_Order"
    else:
        doc_type = "Unknown"
    
    return GatekeeperResult(
        doc_type=doc_type,
        vendor_name=None,
        confidence_score=0.7,
        summary="Document classified via fallback rules"
    )


def _ai_refine_extraction(text: str, previous_result: AnalystResult, feedback: str) -> AnalystResult:
    """
    Refine extraction based on Guardian feedback.
    """
    model = get_model()
    if not model:
        return previous_result
    
    prev_json = previous_result.model_dump_json()
    
    prompt = f"""
You are a senior data analyst. Your previous extraction contained errors.
Refine the extraction based on the feedback.

DOCUMENT TEXT:
{text[:10000]}

PREVIOUS EXTRACTION:
{prev_json}

FEEDBACK (ERRORS TO FIX):
{feedback}

Return corrections as JSON with keys: line_items (array of objects with qty, desc, unit_price, total, sku), subtotal, tax, total, currency.
 Ensure all math is consistent (qty * unit_price = total).
"""
    try:
        response = model.generate_content(prompt)
        # Parse response (handle potential markdown blocks)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        
        line_items = [LineItem(**item) for item in data.get("line_items", [])]
        
        return AnalystResult(
            line_items=line_items,
            subtotal=data.get("subtotal", 0.0),
            tax_amount=data.get("tax", 0.0),
            total_amount=data.get("total", 0.0),
            currency=data.get("currency", "USD"),
            extraction_method="ai_refinement"
        )
    except Exception as e:
        print(f"[Analyst] Refinement failed: {e}")
        return previous_result

def run_analyst(pdf_path: Path, text: str, feedback: Optional[str] = None, previous_result: Optional[AnalystResult] = None) -> AnalystResult:
    """
    Extract structured data from document using pdfplumber + AI.
    Supports self-correction if feedback is provided.
    """
    if feedback and previous_result:
        print(f"⚡ Analyst running in correction mode. Feedback: {feedback}")
        return _ai_refine_extraction(text, previous_result, feedback)

    # Step 1: Extract tables with pdfplumber
    tables = extract_tables(pdf_path)
    line_items_table = find_line_items_table(tables)
    
    line_items = []
    extraction_method = "pdfplumber"
    
    if line_items_table:
        # Step 2: Map headers using AI
        mapper = HeaderMapper()
        mapping = mapper.map_columns(
            line_items_table["headers"],
            line_items_table["rows"][0] if line_items_table["rows"] else None
        )
        
        # Step 3: Apply mapping to rows
        raw_items = mapper.apply_mapping(
            mapping,
            line_items_table["headers"],
            line_items_table["rows"]
        )
        
        # Step 4: Convert to LineItem objects
        for item in raw_items:
            qty = parse_number(item.get("qty") or "0")
            unit_price = parse_number(item.get("unit_price") or "0")
            total = parse_number(item.get("total") or "0")
            
            # Calculate total if not provided
            if total == 0 and qty > 0 and unit_price > 0:
                total = qty * unit_price
            
            line_items.append(LineItem(
                sku=item.get("sku"),
                desc=item.get("desc"),
                qty=qty,
                unit_price=unit_price,
                total=total
            ))
    else:
        extraction_method = "ai_fallback"
        # Fallback: try AI extraction
        line_items = _ai_extract_line_items(text)
    
    # Calculate totals
    subtotal = sum(item.total for item in line_items)
    
    # Try to extract totals from text using AI
    totals = _extract_totals(text)
    
    return AnalystResult(
        line_items=line_items,
        subtotal=totals.get("subtotal", subtotal),
        tax_amount=totals.get("tax", 0),
        total_amount=totals.get("total", subtotal),
        currency=totals.get("currency", "USD"),
        extraction_method=extraction_method
    )


def _ai_extract_line_items(text: str) -> List[LineItem]:
    """
    Fallback: Use AI to extract line items when pdfplumber fails.
    """
    model = get_model()
    if not model:
        return []
    
    prompt = """
Extract line items from this document text.

DOCUMENT:
{text}

Return JSON array:
[
    {{"sku": "ABC123", "desc": "Product name", "qty": 10, "unit_price": 25.00, "total": 250.00}},
    ...
]
""".format(text=text[:8000])
    
    try:
        response = model.generate_content(prompt)
        items = json.loads(response.text)
        return [LineItem(**item) for item in items]
    except Exception as e:
        print(f"[Analyst] AI extraction failed: {e}")
        return []


def _extract_totals(text: str) -> Dict[str, Any]:
    """
    Extract total, subtotal, tax from document text.
    """
    model = get_model()
    if not model:
        return {}
    
    prompt = """
Extract financial totals from this document.

DOCUMENT:
{text}

Return JSON:
{{"subtotal": 0.00, "tax": 0.00, "total": 0.00, "currency": "USD"}}
""".format(text=text[:5000])
    
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"[Analyst] Totals extraction failed: {e}")
        return {}


def run_guardian(gatekeeper: GatekeeperResult, analyst: AnalystResult) -> tuple:
    """
    Validate extraction results for compliance and accuracy.
    Returns (GuardianResult, FraudResult)
    """
    flags = []
    status = "PASS"
    
    # Check 1: Math validation
    calculated_total = sum(item.total for item in analyst.line_items)
    if analyst.total_amount > 0 and abs(calculated_total - analyst.total_amount) > 1.0:
        flags.append(f"Math discrepancy: Line items sum to {calculated_total:.2f}, document total is {analyst.total_amount:.2f}")
        status = "REVIEW"
    
    # Check 2: Empty line items
    if len(analyst.line_items) == 0:
        flags.append("No line items extracted - manual review recommended")
        status = "REVIEW"
    
    # Check 3: Confidence check
    if gatekeeper.confidence_score < 0.9:
        flags.append(f"Low classification confidence: {gatekeeper.confidence_score:.0%}")
        status = "REVIEW"
    
    # Check 4: Zero values
    zero_totals = sum(1 for item in analyst.line_items if item.total == 0)
    if zero_totals > 0:
        flags.append(f"{zero_totals} line item(s) have zero total")
        status = "REVIEW"
    
    # Check 5: Fraud Detection
    fraud_detector = FraudDetector()
    line_items_dicts = [
        {"sku": item.sku, "desc": item.desc, "qty": item.qty, "unit_price": item.unit_price, "total": item.total}
        for item in analyst.line_items
    ]
    fraud_result = fraud_detector.analyze(line_items_dicts, analyst.total_amount)
    
    # Elevate status based on fraud risk
    if fraud_result["risk_score"] >= 60:
        status = "REVIEW"
        flags.append(f"High fraud risk score: {fraud_result['risk_score']}")
    elif fraud_result["risk_score"] >= 30:
        if status == "PASS":
            status = "REVIEW"
        flags.append(f"Medium fraud risk score: {fraud_result['risk_score']}")
    
    requires_review = status != "PASS"
    reasoning = "All checks passed." if not flags else f"Issues detected: {'; '.join(flags)}"
    
    guardian = GuardianResult(
        status=status,
        flags=flags,
        reasoning=reasoning,
        pii_detected=False,
        requires_human_review=requires_review
    )
    
    fraud = FraudResult(
        flags=[FraudFlag(**f) for f in fraud_result.get("flags", [])],
        risk_score=fraud_result.get("risk_score", 0),
        summary=fraud_result.get("summary", "No analysis performed")
    )
    
    return guardian, fraud


# --- API ENDPOINTS ---

@app.get("/")
def root():
    return {"status": "ok", "service": "ORC Extraction API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_configured": KEY_CYCLE is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/gmail/status")
def gmail_status():
    """
    Check Gmail OAuth configuration status.
    Used by frontend to determine if Automated mode is available.
    """
    try:
        from gmail_watcher import check_oauth_status
        status = check_oauth_status()
        return {
            "available": status["ready"],
            "credentials_configured": status["credentials_exists"],
            "authenticated": status["token_exists"],
            "message": "Ready for automated mode" if status["ready"] else "OAuth setup required"
        }
    except ImportError:
        return {
            "available": False,
            "credentials_configured": False,
            "authenticated": False,
            "message": "gmail_watcher module not found"
        }


@app.post("/extract", response_model=ExtractionResponse)
async def extract_document(file: UploadFile = File(...)):
    """
    Full extraction pipeline: Gatekeeper → Analyst → Guardian
    """
    import time
    import traceback
    start_time = time.time()
    
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    
    try:
        # Extract text
        text = extract_text(tmp_path)
        
        # Run pipeline
        gatekeeper_result = run_gatekeeper(text)
        
        analyst_result = None
        guardian_result = None
        
        # Only run analyst for invoices/POs
        grounding_data = None
        fraud_data = None
        if gatekeeper_result.doc_type in ["Invoice", "Purchase_Order"]:
            # Extract with grounding for Glass Box transparency
            grounding_result = extract_with_grounding(tmp_path)
            grounding_data = GroundingData(
                items=[GroundingItem(**item) for item in grounding_result.get("grounding", [])],
                page_dimensions=grounding_result.get("page_dimensions", {})
            )
            
            analyst_result = run_analyst(tmp_path, text)
            guardian_result, fraud_data = run_guardian(gatekeeper_result, analyst_result)

            # --- Self-Correction Loop ---
            MAX_RETRIES = 2
            retries = 0
            while guardian_result.status == "REJECT" and retries < MAX_RETRIES:
                retries += 1
                print(f"↺ [Orchestrator] Self-Correction Attempt {retries}/{MAX_RETRIES}")
                
                # Format feedback
                issues = []
                if guardian_result.flags:
                    issues.append(f"Flags: {', '.join(guardian_result.flags)}")
                if fraud_data and fraud_data.flags:
                    issues.append(f"Fraud Flags: {', '.join([f.message for f in fraud_data.flags])}")
                    
                feedback = ". ".join(issues)
                
                if not feedback:
                    break
                
                # Retry Analyst with feedback
                analyst_result = run_analyst(tmp_path, text, feedback=feedback, previous_result=analyst_result)
                
                # Re-evaluate with Guardian
                guardian_result, fraud_data = run_guardian(gatekeeper_result, analyst_result)
                
                if guardian_result.status == "PASS":
                    print("✅ [Orchestrator] Correction Successful!")
                    break
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return ExtractionResponse(
            gatekeeper=gatekeeper_result,
            analyst=analyst_result,
            guardian=guardian_result,
            grounding=grounding_data,
            fraud=fraud_data,
            processing_time_ms=processing_time,
            extracted_at=datetime.now().isoformat()
        )

    except Exception as e:
        print("CRITICAL FAILURE: Server Error during extraction:")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": f"Server Error: {str(e)}", "detail": str(e)}
        )
    
    finally:
        # Cleanup temp file
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


# --- RUN ---
if __name__ == "__main__":
    import uvicorn
    print("Starting ORC Extraction API...")
    print(f"Gemini API Keys: {'Configured' if KEY_CYCLE else 'NOT SET'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
