# ⚡ ORC: Google Colab Training Guide

Since local training is CPU-bound and slow, we use **Google Colab (Free Tier)** to access a GPU (T4). This reduces training time from **48 hours** to **~15 minutes**.

## Step 1: Open Google Colab
1.  Go to [colab.research.google.com](https://colab.research.google.com/).
2.  Click **New Notebook**.
3.  **IMPORTANT:** Go to `Runtime` -> `Change runtime type` -> Select **T4 GPU** -> Save.

## Step 2: Clone & Install (Copy-Paste this Cell)
Copy the code below into the first cell and run it (Shift + Enter).

```python
# 1. Clone the ORC Repository
!git clone https://github.com/delatorrecj/orc.git
%cd orc

# 2. Install Training Dependencies
!pip install -r ml_engine/requirements_training.txt
```

## Step 3: Run Training
Copy this into the second cell.

```python
# 3. Start Training (LayoutLMv3)
# It will use the GPU automatically.
!python ml_engine/train.py
```

## Step 4: Download the Model
Once training finishes (`Step 1000/1000`), run this to zip and download your model.

```python
# 4. Zip the trained model
!zip -r layoutlmv3-finetuned.zip ml_engine/models/layoutlmv3-finetuned

# 5. Download (or move to Drive)
from google.colab import files
files.download('layoutlmv3-finetuned.zip')
```

## Step 5: "Go Hybrid" (Back to Local)
1.  Take the `layoutlmv3-finetuned.zip` you downloaded.
2.  Unzip it on your local machine into: `orc/ml_engine/models/layoutlmv3-finetuned`.
3.  Your local `serve.py` will now automatically use this smart model! 🧠
