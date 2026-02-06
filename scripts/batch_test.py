import os
import requests
import glob
import time
from pathlib import Path
from terminaltables import AsciiTable

# Configuration
API_URL = "http://localhost:8000/extract"
DATASET_DIR = Path("../data/golden_dataset")

def run_batch_test():
    print(f"STARTING Batch Verification on {DATASET_DIR}...")
    
    pdf_files = list(DATASET_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"NO PDF files found in {DATASET_DIR}")
        return

    results = []
    headers = ["Filename", "Status", "Time (ms)", "Grounding", "Fraud Score", "Flags"]
    table_data = [headers]

    stats = {
        "passed": 0,
        "failed": 0,
        "total_time": 0,
        "total_grounding": 0,
        "high_risk": 0
    }

    for pdf_path in pdf_files:
        print(f"Processing {pdf_path.name}...", end="\r")
        try:
            with open(pdf_path, "rb") as f:
                start_req = time.time()
                response = requests.post(API_URL, files={"file": f})
                req_time = int((time.time() - start_req) * 1000)

            if response.status_code == 200:
                data = response.json()
                
                # Extract metrics
                grounding_count = len(data.get("grounding", {}).get("items", [])) if data.get("grounding") else 0
                fraud_data = data.get("fraud", {})
                fraud_score = fraud_data.get("risk_score", 0)
                fraud_flags = len(fraud_data.get("flags", []))

                # Update stats
                stats["passed"] += 1
                stats["total_time"] += data.get("processing_time_ms", 0)
                stats["total_grounding"] += grounding_count
                if fraud_score >= 60:
                    stats["high_risk"] += 1

                row = [
                    pdf_path.name[:20],
                    "PASS",
                    f"{data.get('processing_time_ms')}ms",
                    grounding_count,
                    fraud_score,
                    fraud_flags
                ]
            else:
                stats["failed"] += 1
                row = [pdf_path.name[:20], f"FAIL {response.status_code}", "0ms", 0, 0, 0]
            
            table_data.append(row)

        except Exception as e:
            stats["failed"] += 1
            table_data.append([pdf_path.name[:20], "ERR", "0ms", 0, 0, 0])
    
    print("\n\n=== BATCH TEST RESULTS ===")
    table = AsciiTable(table_data)
    print(table.table)

    avg_time = stats["total_time"] / stats["passed"] if stats["passed"] > 0 else 0
    
    summary = [
        ["Metric", "Value"],
        ["Files Processed", len(pdf_files)],
        ["Success Rate", f"{(stats['passed']/len(pdf_files))*100:.1f}%"],
        ["Avg Processing Time", f"{avg_time:.0f}ms"],
        ["Avg Grounding Items", f"{stats['total_grounding']/stats['passed']:.1f}" if stats["passed"] else "0"],
        ["High Fraud Risk Docs", stats["high_risk"]]
    ]
    
    print("\n=== SUMMARY STATISTICS ===")
    print(AsciiTable(summary).table)

if __name__ == "__main__":
    try:
        import terminaltables
        run_batch_test()
    except ImportError:
        print("Installing dependencies...")
        os.system("pip install terminaltables requests")
        run_batch_test()
