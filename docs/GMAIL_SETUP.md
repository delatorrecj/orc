# Gmail OAuth Setup Guide

## Step 1: Create Google Cloud Project (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `ORC-Invoice-Processor`
4. Click **Create**

---

## Step 2: Enable Gmail API (2 min)

1. In the sidebar: **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click **Gmail API** → **Enable**

---

## Step 3: Configure OAuth Consent Screen (5 min)

1. **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `ORC Invoice Intake`
   - Support email: (your email)
   - Developer email: (your email)
4. Click **Save and Continue**
5. On **Scopes** page: Click **Add or Remove Scopes**
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - Add: `https://www.googleapis.com/auth/gmail.modify`
6. Click **Save and Continue**
7. On **Test users** page: Add your email
8. Click **Save and Continue** → **Back to Dashboard**

---

## Step 4: Create OAuth Credentials (3 min)

1. **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: `ORC Desktop Client`
5. Click **Create**
6. Click **Download JSON** (save as `credentials.json`)

---

## Step 5: Activate in ORC (1 min)

1. Move the downloaded `credentials.json` to:
   ```
   c:\Users\delat\OneDrive\Desktop\orc\scripts\credentials.json
   ```

2. Open terminal in `orc/scripts` folder and run:
   ```powershell
   python gmail_watcher.py --auth
   ```

3. Browser opens → Sign in with your Google account
4. Allow the requested permissions
5. Success! Token saved. Run this to test:
   ```powershell
   python gmail_watcher.py --poll
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access blocked" | Add yourself as test user in OAuth consent screen |
| "Invalid credentials" | Re-download credentials.json |
| No emails found | Send yourself a test email with a PDF attachment |

---

## What Happens After Setup

When you run `--poll`:
1. Checks inbox for unread emails with PDF attachments
2. Downloads each PDF
3. Submits to ORC extraction API (localhost:8000)
4. Marks emails as read
5. Returns extraction results
