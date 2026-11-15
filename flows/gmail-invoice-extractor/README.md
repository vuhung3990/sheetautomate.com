# Gmail Billing & Receipt Scanner to Sheets

Scan Gmail threads matching a configurable billing query (`label:billing OR subject:invoice`), save attached PDFs into Google Drive, and append structured records into a Google Sheet while skipping already-processed Gmail message IDs.

**Interactive Demo:** [https://sheetautomate.com/?flow=gmail-invoice-extractor](https://sheetautomate.com/?flow=gmail-invoice-extractor)

## Key Features

- **Message-ID Idempotency:** Reads existing `Message_ID` values from `Billing_Log` into a `Set` before scanning so hourly triggers never log or archive duplicates.
- **Read-Only Gmail Access:** Uses `gmail.readonly` instead of broad mailbox scopes—never modifies, labels, or deletes your emails.
- **Concurrency Safety:** Protected by `LockService.getScriptLock()` across both manual menu runs and hourly triggers.
- **Automatic Folder Provisioning:** Automatically creates `SheetAutomate_Gmail_Invoices` in Drive on first run if no custom folder ID is configured.

## Sheet Schema (`Billing_Log` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Logged_At` | ISO-8601 timestamp when the attachment was archived |
| B | `Message_ID` | Unique Gmail message ID used for deduplication |
| C | `Sender` | Email `From` header |
| D | `Subject` | Email subject line |
| E | `Attachment_Name` | Sanitized PDF filename saved in Drive |
| F | `Drive_PDF_Link` | Direct Google Drive file URL |
| G | `Audit_Status` | Set to `COMPLETED` upon successful archive |

## Setup Guide

1. **Install the Script:** Open **Extensions > Apps Script** in your Google Sheet, paste `Code.gs`, and paste `appsscript.json` into the manifest editor.
2. **Initialize & Configure:** Reload your sheet, run **SheetAutomate > Initialize Billing_Log Sheet**, and optionally customize your Gmail search filter via **SheetAutomate > Configure Gmail Query & Folder**.
3. **Run or Schedule:** Run **SheetAutomate > Scan Gmail for PDF Invoices** to test immediately, then click **SheetAutomate > Install Hourly Trigger** for automated runs.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Appends rows only inside the active spreadsheet.
- `https://www.googleapis.com/auth/gmail.readonly` — Searches matching threads and reads PDF attachments without write/delete access to Gmail.
- `https://www.googleapis.com/auth/drive.file` — Creates and writes archived PDFs strictly within app-created or user-specified Drive folders.
- `https://www.googleapis.com/auth/script.scriptapp` — Installs the optional hourly time-driven trigger via `ScriptApp.newTrigger()`.
