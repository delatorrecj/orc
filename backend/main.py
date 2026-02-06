import os
import json
import base64
import time
from pathlib import Path
import textwrap

# Try importing the Gemini SDK
try:
    import google.generativeai as genai
except ImportError:
    print("CRITICAL: google-generativeai library not found.")
    print("Please run: pip install google-generativeai")
    exit(1)

# --- CONFIGURATION ---
DATASET_DIR = Path("golden_dataset")
PROMPT_ENGINE_PATH = Path("orc_prompt_engine.json")
OUTPUT_LOG_DIR = Path("agent_logs")
os.makedirs(OUTPUT_LOG_DIR, exist_ok=True)

# Load Prompt Engine
try:
    with open(PROMPT_ENGINE_PATH, "r") as f:
        PROMPT_ENGINE = json.load(f)
except FileNotFoundError:
    print(f"CRITICAL: {PROMPT_ENGINE_PATH} not found.")
    exit(1)

# --- API SETUP ---
# --- API SETUP ---
API_KEYS_RAW = os.environ.get("GEMINI_API_KEYS") or os.environ.get("GEMINI_API_KEY") or ""
API_KEYS = [k.strip() for k in API_KEYS_RAW.split(",") if k.strip()]

if not API_KEYS:
    print("WARNING: GEMINI_API_KEYS environment variable not set.")
    print("The agents will run in MOCK MODE unless you set the key.")

# Global Key Index
_key_index = 0

def rotate_key():
    global _key_index
    if not API_KEYS: return None
    key = API_KEYS[_key_index]
    _key_index = (_key_index + 1) % len(API_KEYS)
    genai.configure(api_key=key)
    return key

# Initial config
if API_KEYS:
    rotate_key()

# --- MODEL INITIALIZATION ---
MODEL_NAME = PROMPT_ENGINE["system_meta"]["model"]
GENERATION_CONFIG = {
    "temperature": PROMPT_ENGINE["system_meta"]["temperature"],
    "top_p": PROMPT_ENGINE["system_meta"]["top_p"],
    "response_mime_type": "application/json"
}

def get_model():
    if not API_KEYS:
        return None
    # Rotate key for every new model instance request (or per call if we rebuilt)
    # For robust rotation, we call rotate_key() here.
    rotate_key()
    return genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config=GENERATION_CONFIG
    )

# --- AGENT CLASSES ---

class BaseAgent:
    def __init__(self, agent_name):
        self.name = agent_name
        self.config = PROMPT_ENGINE["agents"].get(agent_name)
        if not self.config:
            raise ValueError(f"Agent {agent_name} not defined in prompt engine.")
        self.model = get_model()

    def _build_prompt(self, context_text, additional_instructions=""):
        return f"""
        ROLE: {self.config['role']}
        INSTRUCTION: {self.config['instruction']}
        
        {additional_instructions}

        INPUT CONTEXT:
        {context_text}
        
        OUTPUT SCHEMA:
        {json.dumps(self.config.get('output_schema') or self.config.get('fields_to_extract'), indent=2)}
        """

    def process(self, content, mime_type="text/plain"):
        print(f"[{self.name}] Processing...")
        
        prompt = self._build_prompt(
            context_text="[See attached content]" if mime_type != "text/plain" else content
        )

        if not self.model:
            # MOCK RESPONSE for testing without API Key
            print(f"[{self.name}] ** MOCK RESPONSE (No API Key) **")
            return self._mock_response()

        try:
            # Handle Multimodal (Images/PDFs) vs Text
            if mime_type == "text/plain":
                response = self.model.generate_content(prompt)
            else:
                # For simplicity in scaffolding, we assume content is already prepared/loaded
                # In a real implementation, we pass the data blob.
                response = self.model.generate_content([prompt, content])
                
            return json.loads(response.text)
        except Exception as e:
            print(f"[{self.name}] ERROR: {e}")
            return {"error": str(e)}

    def _mock_response(self):
        # Return dummy JSON based on schema
        if self.name == "GATEKEEPER":
            return {"doc_type": "Invoice", "vendor_name": "Mock Vendor", "confidence_score": 0.99, "summary": "Mock summary"}
        elif self.name == "ANALYST":
            return {"po_number": "PO-MOCK", "total_amount": 1000.0, "math_validation": True}
        elif self.name == "GUARDIAN":
            return {"status": "PASS", "flags": [], "reasoning": "Mock pass."}
        return {}


class Gatekeeper(BaseAgent):
    def __init__(self):
        super().__init__("GATEKEEPER")

class Analyst(BaseAgent):
    def __init__(self):
        super().__init__("ANALYST")

class Guardian(BaseAgent):
    def __init__(self):
        super().__init__("GUARDIAN")

# --- ORCHESTRATOR ---

def run_orchestrator():
    print("--- ORC INITIATED ---")
    print(f"Scanning directory: {DATASET_DIR}")
    
    files = list(DATASET_DIR.glob("*"))
    print(f"Found {len(files)} files.")

    gatekeeper = Gatekeeper()
    analyst = Analyst()
    guardian = Guardian()

    results_summary = []

    for file_path in files:
        if file_path.name.startswith("."): continue # Skip hidden
        
        print(f"\n>>> PROCESSING: {file_path.name}")
        
        # 1. READ FILE
        mime_type = "text/plain"
        content = ""
        
        try:
            if file_path.suffix.lower() in ['.json', '.txt', '.csv', '.xml']:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            elif file_path.suffix.lower() in ['.pdf', '.jpg', '.png']:
                # For PDF/Images, we would technically load bytes.
                # For this scaffolding, we'll implement a simple text placeholder or 
                # use the actual part creation if we were fully implementing.
                # Let's load bytes for the 'content' to pass to Gemini (if supported in this simplified script)
                import mimetypes
                mime_type, _ = mimetypes.guess_type(file_path)
                with open(file_path, "rb") as f:
                    # Construct a Part object if using genai, but for now let's keep it simple
                    # We will pass the raw data object if using the SDK usually requires specific object wrapper
                    # For this scaffold, we'll placeholder the binary handling.
                    content = {
                        "mime_type": mime_type,
                        "data": f.read()
                    }
            else:
                print(f"Skipping unsupported file type: {file_path.suffix}")
                continue
                
        except Exception as e:
            print(f"Error reading file: {e}")
            continue

        # 2. GATEKEEPER (Classify)
        gk_result = gatekeeper.process(content, mime_type=mime_type)
        print(f"   [Gate] Identified: {gk_result.get('doc_type')} ({gk_result.get('confidence_score')})")

        # 3. ANALYST (Extract)
        # Only proceed if it's an Invoice or PO (skip chat logs for deep extraction unless configured)
        doc_type = gk_result.get('doc_type', 'Unknown').lower()
        if "invoice" in doc_type or "purchase" in doc_type or "order" in doc_type:
            analyst_result = analyst.process(content, mime_type=mime_type)
            print(f"   [Analyst] Extracted: {analyst_result.get('total_amount')} {analyst_result.get('currency')}")
        else:
            analyst_result = {"skipped": True, "reason": "Not an Invoice/PO"}
            print("   [Analyst] Skipped (Doc Type not relevant for full extraction)")

        # 4. GUARDIAN (Validate)
        if not analyst_result.get("skipped"):
            # Combine context for Guardian: Metadata + Extracted Data
            guardian_input = json.dumps({
                "meta": gk_result,
                "data": analyst_result
            }, indent=2)
            
            guardian_result = guardian.process(guardian_input, mime_type="text/plain")
            status = guardian_result.get('status', 'UNKNOWN')
            color = "\033[92m" if status == "PASS" else "\033[91m"
            reset = "\033[0m"
            print(f"   [Guardian] Verdict: {color}{status}{reset} | Reason: {guardian_result.get('reasoning')}")
        else:
            guardian_result = {"status": "SKIPPED"}

        # 5. LOG RESULT
        log_entry = {
            "file": file_path.name,
            "gatekeeper": gk_result,
            "analyst": analyst_result,
            "guardian": guardian_result
        }
        results_summary.append(log_entry)
        
        # Save individual log
        with open(OUTPUT_LOG_DIR / f"{file_path.name}.json", "w") as f:
            json.dump(log_entry, f, indent=2)

    # FINAL REPORT
    print("\n--- RUN COMPLETE ---")
    print(f"Processed {len(files)} files.")
    print(f"Logs saved to {OUTPUT_LOG_DIR}")

if __name__ == "__main__":
    run_orchestrator()
