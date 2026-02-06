
# Use Python 3.10 slim image (Lightweight)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for EasyOCR/OpenCV
# libgl1-mesa-glx is needed for cv2
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Caching layer)
COPY requirements_serving.txt .

# Install Python dependencies
# We use --no-cache-dir to keep image small
RUN pip install --no-cache-dir -r requirements_serving.txt

# Copy the app code
COPY serve.py .
# Copy models directory (This will be populated by the user/training)
# Note: For HF Spaces, we might fetch model from Hub, but for now copying local
# COPY models/ ./models/ 

# Expose port (HF Spaces defaults to 7860, but we can config)
EXPOSE 7860

# Command to run the app
# Use 0.0.0.0 for external access
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "7860"]
