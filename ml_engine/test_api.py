
import requests
import os

# Create a dummy image if none exists
from PIL import Image
dummy_path = "test_invoice.jpg"
if not os.path.exists(dummy_path):
    img = Image.new('RGB', (1000, 1000), color = (255, 255, 255))
    img.save(dummy_path)

url = "http://localhost:8001/predict"
files = {"file": open(dummy_path, "rb")}

print(f"🚀 Sending request to {url}...")
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"❌ Failed: {e}")
