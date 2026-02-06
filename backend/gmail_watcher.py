"""
ORC Gmail Watcher
OAuth2-based Gmail integration for automated invoice intake.

Features:
- OAuth2 authentication flow with token refresh
- Inbox polling for unread emails with PDF attachments
- Auto-submission to ORC extraction pipeline

Setup:
1. Create OAuth2 credentials in Google Cloud Console
2. Download credentials.json to this directory
3. Run: python gmail_watcher.py --auth (first time only)
4. Run: python gmail_watcher.py --poll (production mode)

Required scopes:
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/gmail.modify (for marking as read)
"""

import os
import sys
import json
import base64
import argparse
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

# Google API imports
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_LIBS_AVAILABLE = True
except ImportError:
    GOOGLE_LIBS_AVAILABLE = False
    print("⚠️  Google API libraries not installed. Run: pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client")

# Configuration
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify"
]
CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"
TOKEN_FILE = Path(__file__).parent / "token.json"
ORC_API_URL = "http://localhost:8000/extract"


class GmailWatcher:
    """
    Watches Gmail inbox for invoices and auto-processes them.
    """
    
    def __init__(self):
        self.service = None
        self.creds = None
    
    def authenticate(self) -> bool:
        """
        Perform OAuth2 authentication flow.
        Returns True if successful.
        """
        if not GOOGLE_LIBS_AVAILABLE:
            print("❌ Google API libraries not available")
            return False
        
        if not CREDENTIALS_FILE.exists():
            print(f"❌ credentials.json not found at {CREDENTIALS_FILE}")
            print("   Download from Google Cloud Console > APIs & Services > Credentials")
            return False
        
        # Check for existing token
        if TOKEN_FILE.exists():
            self.creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
        
        # Refresh or create new credentials
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                print("🔄 Refreshing expired token...")
                self.creds.refresh(Request())
            else:
                print("🔐 Starting OAuth2 flow...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(CREDENTIALS_FILE), SCOPES
                )
                self.creds = flow.run_local_server(port=8080)
            
            # Save token for future use
            with open(TOKEN_FILE, "w") as token:
                token.write(self.creds.to_json())
            print(f"✅ Token saved to {TOKEN_FILE}")
        
        # Build Gmail service
        self.service = build("gmail", "v1", credentials=self.creds)
        print("✅ Gmail API authenticated successfully")
        return True
    
    def fetch_unread_with_attachments(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch unread emails with PDF attachments.
        
        Returns list of email metadata with attachment info.
        """
        if not self.service:
            print("❌ Not authenticated. Run authenticate() first.")
            return []
        
        # Search for unread emails with attachments
        query = "is:unread has:attachment filename:pdf"
        
        try:
            results = self.service.users().messages().list(
                userId="me",
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get("messages", [])
            print(f"📬 Found {len(messages)} unread emails with PDF attachments")
            
            emails = []
            for msg in messages:
                email_data = self._get_email_details(msg["id"])
                if email_data:
                    emails.append(email_data)
            
            return emails
            
        except Exception as e:
            print(f"❌ Error fetching emails: {e}")
            return []
    
    def _get_email_details(self, message_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full email details including attachments.
        """
        try:
            message = self.service.users().messages().get(
                userId="me",
                id=message_id,
                format="full"
            ).execute()
            
            # Extract headers
            headers = {h["name"]: h["value"] for h in message["payload"]["headers"]}
            
            # Find PDF attachments
            attachments = []
            self._find_attachments(message["payload"], attachments)
            
            return {
                "id": message_id,
                "threadId": message["threadId"],
                "subject": headers.get("Subject", "(No Subject)"),
                "from": headers.get("From", "Unknown"),
                "date": headers.get("Date"),
                "attachments": [a for a in attachments if a["filename"].lower().endswith(".pdf")]
            }
            
        except Exception as e:
            print(f"❌ Error getting email {message_id}: {e}")
            return None
    
    def _find_attachments(self, payload: dict, attachments: list):
        """
        Recursively find attachments in email payload.
        """
        if "parts" in payload:
            for part in payload["parts"]:
                self._find_attachments(part, attachments)
        
        if payload.get("filename") and payload.get("body", {}).get("attachmentId"):
            attachments.append({
                "filename": payload["filename"],
                "attachmentId": payload["body"]["attachmentId"],
                "mimeType": payload.get("mimeType", "application/pdf"),
                "size": payload.get("body", {}).get("size", 0)
            })
    
    def download_attachment(self, message_id: str, attachment_id: str) -> Optional[bytes]:
        """
        Download attachment content.
        """
        try:
            attachment = self.service.users().messages().attachments().get(
                userId="me",
                messageId=message_id,
                id=attachment_id
            ).execute()
            
            data = attachment.get("data", "")
            return base64.urlsafe_b64decode(data)
            
        except Exception as e:
            print(f"❌ Error downloading attachment: {e}")
            return None
    
    def process_email(self, email: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Process an email: download attachments and submit to ORC.
        """
        results = []
        
        for attachment in email.get("attachments", []):
            print(f"  📎 Processing: {attachment['filename']}")
            
            # Download PDF
            pdf_data = self.download_attachment(email["id"], attachment["attachmentId"])
            if not pdf_data:
                continue
            
            # Submit to ORC API
            try:
                response = requests.post(
                    ORC_API_URL,
                    files={"file": (attachment["filename"], pdf_data, "application/pdf")}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    result["source"] = {
                        "email_id": email["id"],
                        "subject": email["subject"],
                        "from": email["from"],
                        "filename": attachment["filename"]
                    }
                    results.append(result)
                    print(f"    ✅ Extracted: {len(result.get('analyst', {}).get('line_items', []))} line items")
                else:
                    print(f"    ❌ API error: {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                print(f"    ❌ ORC API not available at {ORC_API_URL}")
            except Exception as e:
                print(f"    ❌ Error: {e}")
        
        return results
    
    def mark_as_read(self, message_id: str):
        """
        Mark email as read after processing.
        """
        try:
            self.service.users().messages().modify(
                userId="me",
                id=message_id,
                body={"removeLabelIds": ["UNREAD"]}
            ).execute()
            print(f"    ✓ Marked as read")
        except Exception as e:
            print(f"    ⚠️ Could not mark as read: {e}")
    
    def poll_inbox(self, mark_read: bool = True):
        """
        Poll inbox and process all unread PDF emails.
        """
        print(f"\n🔍 Polling inbox at {datetime.now().isoformat()}")
        
        emails = self.fetch_unread_with_attachments()
        
        if not emails:
            print("📭 No unread emails with PDF attachments")
            return []
        
        all_results = []
        for email in emails:
            print(f"\n📧 {email['subject']}")
            print(f"   From: {email['from']}")
            
            results = self.process_email(email)
            all_results.extend(results)
            
            if mark_read and results:
                self.mark_as_read(email["id"])
        
        print(f"\n✅ Processed {len(all_results)} PDFs from {len(emails)} emails")
        return all_results


def check_oauth_status() -> Dict[str, Any]:
    """
    Check OAuth configuration status (used by API).
    """
    return {
        "credentials_exists": CREDENTIALS_FILE.exists(),
        "token_exists": TOKEN_FILE.exists(),
        "google_libs_available": GOOGLE_LIBS_AVAILABLE,
        "ready": CREDENTIALS_FILE.exists() and TOKEN_FILE.exists() and GOOGLE_LIBS_AVAILABLE
    }


# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ORC Gmail Watcher")
    parser.add_argument("--auth", action="store_true", help="Run OAuth2 authentication flow")
    parser.add_argument("--poll", action="store_true", help="Poll inbox for PDFs")
    parser.add_argument("--status", action="store_true", help="Check OAuth status")
    args = parser.parse_args()
    
    if args.status:
        status = check_oauth_status()
        print(json.dumps(status, indent=2))
        sys.exit(0)
    
    watcher = GmailWatcher()
    
    if args.auth:
        if watcher.authenticate():
            print("\n🎉 Authentication successful! You can now use --poll")
        else:
            sys.exit(1)
    
    elif args.poll:
        if watcher.authenticate():
            watcher.poll_inbox()
    
    else:
        parser.print_help()
