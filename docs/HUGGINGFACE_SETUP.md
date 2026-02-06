# HUGGING FACE SETUP GUIDE 🚀

This guide will help you create a **Hugging Face** account and generate the **Access Token** needed to upload your trained "Brain" (Model) from Google Colab.

---

## 1. Create an Account
1.  Go to [huggingface.co/join](https://huggingface.co/join).
2.  Sign up with your email (it's free).
3.  Verify your email address.

## 2. Create an Access Token
1.  Once logged in, click your **Profile Picture** (top right) -> **Settings**.
2.  On the left menu, click **Access Tokens**.
3.  Click the **"Create new token"** button.
4.  **Token Type:** Select **"Write"** (Crucial! "Read" tokens cannot upload models).
5.  **Name:** `orc-colab-upload`.
6.  Click **Create token**.
7.  **Copy** the token string (starts with `hf_...`).

## 3. Add Token to Google Colab
1.  Go back to your **Google Colab** tab.
2.  Look at the **Left Sidebar** (where the file folder icon is).
3.  Click the **Key Icon** 🔑 (Secrets).
4.  Click **"Add new secret"**.
    *   **Name:** `HF_TOKEN`
    *   **Value:** *(Paste your `hf_...` token here)*
5.  **IMPORTANT:** Toggle the **"Notebook access"** switch to **ON** (Blue/Checked).
    *   *If you don't do this, the code cannot see the token!*

## 4. Run the Upload Code
Now, restart your Colab session ("Runtime" -> "Restart Session") and run the upload cell again:

```python
from huggingface_hub import login

# This will now automatically find the 'HF_TOKEN' valid in your secrets
login() 

# Upload
trainer.push_to_hub("your-username/orc-invoice-v1")
processor.push_to_hub("your-username/orc-invoice-v1")
```

---

## 5. Deployment (The Final Link)
Once the upload finishes:
1.  Go to **Railway**.
2.  Open your Project -> **Settings** -> **Variables**.
3.  Add:
    *   `HF_MODEL_ID` = `your-username/orc-invoice-v1`
4.  Railway will redeploy, identify the variable, download your model, and serve it! 
