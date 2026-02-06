# ⚡ ORC: Google Colab Training Guide (Public Repo)

Since your repo is **Public**, we can use the fast `git clone` method. This is the cleanest way to train.

## Step 1: Open Google Colab
1.  Go to [colab.research.google.com](https://colab.research.google.com/).
2.  Click **New Notebook**.
3.  **IMPORTANT:** Go to `Runtime` -> `Change runtime type` -> Select **T4 GPU** -> Save.

## Step 2: Clone & Install
Copy this into the first cell and run it (Shift + Enter).
*This automatically pulls the latest fixes (including the rename of `evaluate.py`).*

```python
# 1. Clone the ORC Repository
!git clone https://github.com/delatorrecj/orc.git
%cd orc

# 2. Install Dependencies
!pip install -r ml_engine/requirements_training.txt
```

## Step 3: Run Training
```python
# 3. Start Training (GPU Powered) 🚀
!python ml_engine/train.py
```

## Step 4: Download the Model
Once training finishes (`Step 1000/1000`):

```python
# 4. Zip the trained model
!zip -r layoutlmv3-finetuned.zip ml_engine/models/layoutlmv3-finetuned

# 5. Download
from google.colab import files
files.download('layoutlmv3-finetuned.zip')
```

## Step 5: "Go Hybrid" (Back to Local)
1.  Unzip `layoutlmv3-finetuned.zip` on your local machine into: `orc/ml_engine/models/layoutlmv3-finetuned`.
2.  Your local system will now use this high-accuracy trained model!
