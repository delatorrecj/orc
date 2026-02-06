import requests
import json
from pathlib import Path

API_URL = "http://localhost:8000/extract"
SAMPLE_PDF = Path("../data/golden_dataset/Invoice 14 - Industrial Heavy.pdf")

def test_mesh():
    print(f"🚀 Testing Agentic Mesh with {SAMPLE_PDF.name}...")
    
    try:
        with open(SAMPLE_PDF, "rb") as f:
            response = requests.post(API_URL, files={"file": f})
            
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Extraction Successful!")
            print(f"Time: {data.get('processing_time_ms')}ms")
            print(f"Guardian Status: {data.get('guardian', {}).get('status')}")
            print(f"Guardian Flags: {data.get('guardian', {}).get('flags')}")
            print(f"Fraud Score: {data.get('fraud', {}).get('risk_score')}")
            print(f"Method: {data.get('analyst', {}).get('extraction_method')}")
            
            # Check if self-correction happened (we can't see server logs here directly, 
            # but we can infer if quality is high despite potential issues)
            
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_mesh()
