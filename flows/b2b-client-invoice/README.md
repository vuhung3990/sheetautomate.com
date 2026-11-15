# B2B Client Invoice PDF Generator

Automatically merge approved invoice rows from Google Sheets into a branded Google Docs invoice template, export clean PDFs into a designated Google Drive folder, and write the PDF link and audit status back to your spreadsheet.

**Interactive Demo:** [https://sheetautomate.com/?flow=b2b-client-invoice](https://sheetautomate.com/?flow=b2b-client-invoice)

## Key Features

- **Idempotent Execution:** Automatically skips any row whose `Audit_Status` is `COMPLETED` or already has a `PDF_Link`.
- **Concurrency Safety:** Uses `LockService.getScriptLock()` with a `try/finally` release block so concurrent clicks never create duplicate invoices.
- **Input Validation:** Flags incomplete rows with `NEEDS_CORRECTION` in `Audit_Status` instead of generating broken PDFs.
- **Clean Drive Output:** Deletes the temporary merged Google Doc copy after exporting the final PDF.

## Sheet Schema (`Invoices` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Invoice_ID` | Unique invoice identifier (e.g., `INV-2026-104`) |
| B | `Client_Name` | Recipient company or client name |
| C | `Client_Email` | Client billing contact email |
| D | `Service_Description` | Line description merged into the invoice body |
| E | `Amount_USD` | Numeric invoice total (formatted to `$0.00`) |
| F | `Status` | Set to `Approved` to include in the next PDF batch |
| G | `PDF_Link` | Populated automatically with the Drive PDF URL |
| H | `Audit_Status` | Populated with `COMPLETED` or `NEEDS_CORRECTION` |

## Setup Guide

1. **Create your Docs Template:** Create a Google Doc containing placeholders `{{Invoice_ID}}`, `{{Client_Name}}`, `{{Client_Email}}`, `{{Service_Description}}`, `{{Amount_USD}}`, and `{{Issue_Date}}`.
2. **Install the Script:** Open **Extensions > Apps Script** in your Google Sheet, paste `Code.gs`, and enable `appsscript.json` in Project Settings to paste the manifest.
3. **Configure & Run:** Reload the sheet, run **SheetAutomate > Initialize Invoices Sheet**, then **SheetAutomate > Configure Template & Folder IDs**, and finally **SheetAutomate > Generate Approved Invoice PDFs**.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Reads and updates only the active spreadsheet (`@OnlyCurrentDoc`).
- `https://www.googleapis.com/auth/documents` — Opens the temporary copied Google Docs invoice template to replace placeholders.
- `https://www.googleapis.com/auth/drive.file` — Copies the template and saves exported PDF files without requesting full Google Drive access.
