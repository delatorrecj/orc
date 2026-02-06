# ⚡ ORC: Google Colab Training Guide (Private Repo Edition)

Since your repo is private, the easiest way to train is to verify the **"Drag & Drop"** method.

## Step 0: Get the Files
1.  I have created a valid zip file for you on your Desktop: `orc/orc_training_pack.zip`.
2.  Locate this file on your machine.

## Step 1: Open Google Colab
1.  Go to [colab.research.google.com](https://colab.research.google.com/).
2.  Click **New Notebook**.
3.  **IMPORTANT:** Go to `Runtime` -> `Change runtime type` -> Select **T4 GPU** -> Save.

## Step 2: Upload Files
1.  Click the **Folder Icon** 📁 on the left sidebar.
2.  Drag and drop your `orc_training_pack.zip` into that area.
3.  Wait for the upload circle to finish.

## Step 3: Install & Train
Copy and run this cell:

```python
# 1. Unzip the package
!unzip -o orc_training_pack.zip

# 2. Install Dependencies
!pip install -r ml_engine/requirements_training.txt

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
