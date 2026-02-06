import os
import sys
import json
import time
import argparse
import base64
import random
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: google-generativeai not installed.")
    print("Run: pip install google-generativeai")
    sys.exit(1)

try:
    from tqdm import tqdm
except ImportError:
    # Fallback if tqdm not installed
    def tqdm(iterable, **kwargs):
        return iterable

# --- CONFIGURATION ---
KAGGLE_DATA_DIR = Path(r"c:\Users\delat\Downloads\kaggle_datasets\batch_1")
OUTPUT_DIR = Path(__file__).parent / "ground_truth"
CHECKPOINT_FILE = OUTPUT_DIR / "_checkpoint.json"
DATASET_FILE = OUTPUT_DIR / "dataset.jsonl"

# Load API keys from .env
ENV_PATH = Path(__file__).parent.parent / ".env"

def load_api_keys():
    """Load API keys from .env file with rotation support."""
    keys = []
    if ENV_PATH.exists():
        with open(ENV_PATH, "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEYS="):
                    keys = line.strip().split("=", 1)[1].split(",")
                    break
    if not keys:
        # Fallback to environment variable
        env_keys = os.environ.get("GEMINI_API_KEYS", "")
        if env_keys:
            keys = env_keys.split(",")
    return keys

API_KEYS = load_api_keys()
current_key_index = 0

def get_next_api_key():
    """Rotate to next API key."""
    global current_key_index
    if not API_KEYS:
        raise ValueError("No API keys found! Check .env file.")
    key = API_KEYS[current_key_index]
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    return key

# --- EXTRACTION SCHEMA ---
EXTRACTION_PROMPT = """You are an expert invoice data extractor. Analyze this invoice image and extract ALL information.

Return a JSON object with this EXACT structure:
{
    "vendor_name": "Company name on the invoice",
    "vendor_address": "Full address if visible",
    "invoice_number": "Invoice ID/Number",
    "invoice_date": "Date in YYYY-MM-DD format",
    "due_date": "Due date in YYYY-MM-DD format or null",
    "po_number": "Purchase order number or null",
    "currency": "USD, EUR, etc.",
    "subtotal": 0.00,
    "tax_amount": 0.00,
    "total_amount": 0.00,
    "line_items": [
        {
            "description": "Item description",
            "quantity": 1,
            "unit_price": 0.00,
            "total": 0.00
        }
    ],
    "confidence": 0.95,
    "notes": "Any additional observations"
}

IMPORTANT:
- Extract ALL line items visible
- Use null for fields not visible
- Confidence should reflect your certainty (0.0-1.0)
- Dates must be YYYY-MM-DD format
- All monetary values as numbers, not strings
"""

def encode_image(image_path: Path) -> tuple[str, str]:
    """Encode image to base64 with MIME type."""
    suffix = image_path.suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }
    mime_type = mime_types.get(suffix, "image/jpeg")
    
    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    
    return data, mime_type

def extract_invoice_data(image_path: Path, dry_run: bool = False, max_retries: int = 5) -> dict:
    """Extract structured data from invoice image using Gemini with retry logic."""
    if dry_run:
        return {
            "vendor_name": "DRY_RUN_VENDOR",
            "invoice_number": "DRY-001",
            "total_amount": 100.00,
            "confidence": 1.0,
            "_dry_run": True
        }
    
    # Encode image once
    image_data, mime_type = encode_image(image_path)
    
    for attempt in range(max_retries):
        try:
            # Get next API key (rotation)
            api_key = get_next_api_key()
            genai.configure(api_key=api_key)
            
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.95,
                    "response_mime_type": "application/json"
                }
            )
            
            # Create content with image
            content = [
                EXTRACTION_PROMPT,
                {
                    "mime_type": mime_type,
                    "data": image_data
                }
            ]
            
            response = model.generate_content(content)
            result = json.loads(response.text)
            result["_source_file"] = image_path.name
            result["_extracted_at"] = datetime.now().isoformat()
            return result
            
        except Exception as e:
            error_str = str(e)
            
            # Check if rate limited (429)
            if "429" in error_str or "quota" in error_str.lower():
                # Exponential backoff with jitter
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                print(f"\n  Rate limited, waiting {wait_time:.1f}s (attempt {attempt+1}/{max_retries})")
                time.sleep(wait_time)
                continue
            
            # Other errors - return error result
            return {
                "error": error_str,
                "_source_file": image_path.name,
                "_extracted_at": datetime.now().isoformat()
            }
    
    # All retries exhausted
    return {
        "error": f"Max retries ({max_retries}) exhausted due to rate limiting",
        "_source_file": image_path.name,
        "_extracted_at": datetime.now().isoformat()
    }

def get_all_images() -> list[Path]:
    """Collect all invoice images from Kaggle dataset."""
    images = []
    
    # Scan all batch subdirectories
    for subdir in KAGGLE_DATA_DIR.iterdir():
        if subdir.is_dir():
            for img in subdir.glob("*.jpg"):
                images.append(img)
            for img in subdir.glob("*.png"):
                images.append(img)
    
    return sorted(images)

def load_checkpoint() -> set:
    """Load set of already processed files."""
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE, "r") as f:
            data = json.load(f)
            return set(data.get("processed", []))
    return set()

def save_checkpoint(processed: set):
    """Save checkpoint of processed files."""
    with open(CHECKPOINT_FILE, "w") as f:
        json.dump({"processed": list(processed), "updated": datetime.now().isoformat()}, f)

def run_labeler(limit: int = None, dry_run: bool = False, resume: bool = True):
    """Main labeling loop."""
    print("=" * 60)
    print("ORC Auto-Labeler v1.0")
    print("=" * 60)
    print(f"API Keys loaded: {len(API_KEYS)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Dry run: {dry_run}")
    print(f"Limit: {limit or 'None'}")
    print()
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get all images
    all_images = get_all_images()
    print(f"Found {len(all_images)} invoice images")
    
    # Load checkpoint if resuming
    processed = load_checkpoint() if resume else set()
    if processed:
        print(f"Resuming: {len(processed)} already processed")
    
    # Filter out already processed
    images_to_process = [img for img in all_images if img.name not in processed]
    
    # Apply limit
    if limit:
        images_to_process = images_to_process[:limit]
    
    print(f"Processing: {len(images_to_process)} images")
    print("-" * 60)
    
    results = []
    errors = 0
    
    for img_path in tqdm(images_to_process, desc="Labeling"):
        try:
            # Extract data
            result = extract_invoice_data(img_path, dry_run=dry_run)
            
            # Save individual JSON
            output_file = OUTPUT_DIR / f"{img_path.stem}.json"
            with open(output_file, "w") as f:
                json.dump(result, f, indent=2)
            
            # Track for JSONL
            results.append(result)
            
            # Update checkpoint
            processed.add(img_path.name)
            
            # Rate limiting (be nice to API)
            if not dry_run:
                time.sleep(0.5)  # 500ms between calls
                
        except Exception as e:
            print(f"\nError processing {img_path.name}: {e}")
            errors += 1
            
        # Periodic checkpoint save
        if len(results) % 10 == 0:
            save_checkpoint(processed)
    
    # Final checkpoint save
    save_checkpoint(processed)
    
    # Generate JSONL dataset
    with open(DATASET_FILE, "w") as f:
        for result in results:
            f.write(json.dumps(result) + "\n")
    
    print()
    print("=" * 60)
    print("COMPLETE")
    print(f"Processed: {len(results)} images")
    print(f"Errors: {errors}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Dataset: {DATASET_FILE}")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="ORC Auto-Labeler")
    parser.add_argument("--limit", type=int, help="Max images to process")
    parser.add_argument("--dry-run", action="store_true", help="Test without API calls")
    parser.add_argument("--no-resume", action="store_true", help="Start fresh, ignore checkpoint")
    
    args = parser.parse_args()
    
    run_labeler(
        limit=args.limit,
        dry_run=args.dry_run,
        resume=not args.no_resume
    )

if __name__ == "__main__":
    main()
