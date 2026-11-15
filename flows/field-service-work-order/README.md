# Field Service & Inspection Work Order PDF

Generate standardized field technician service and inspection work order PDFs directly from scheduled rows in Google Sheets, store them in Google Drive, and automatically update each row's status and PDF link.

**Interactive Demo:** [https://sheetautomate.com/?flow=field-service-work-order](https://sheetautomate.com/?flow=field-service-work-order)

## Key Features

- **Status Transition:** Processes rows marked `Scheduled`, exports the PDF, updates `Status` to `Dispatched`, and writes the Drive URL to `PDF_Link`.
- **Idempotency & Locking:** Uses `LockService.getScriptLock()` and skips any row with `Audit_Status === 'COMPLETED'` or an existing `PDF_Link`.
- **Date Normalization:** Formats Google Sheets date objects cleanly into `yyyy-MM-dd` before merging into the Google Docs template.
- **Validation:** Flags missing technician, site, date, or scope details with `NEEDS_CORRECTION` in `Audit_Status`.

## Sheet Schema (`Work_Orders` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Work_Order_ID` | Unique job or ticket ID (e.g., `WO-2026-412`) |
| B | `Site_Name` | Customer facility or inspection site |
| C | `Technician_Name` | Assigned field technician |
| D | `Scheduled_Date` | Scheduled service date (`YYYY-MM-DD`) |
| E | `Scope_Of_Work` | Inspection checklist or repair instructions |
| F | `Status` | Set to `Scheduled` to queue; updated to `Dispatched` on export |
| G | `PDF_Link` | Populated with the exported Drive PDF URL |
| H | `Audit_Status` | Set to `COMPLETED` or `NEEDS_CORRECTION` |

## Setup Guide

1. **Create Work Order Template:** Build a Google Doc with placeholders `{{Work_Order_ID}}`, `{{Site_Name}}`, `{{Technician_Name}}`, `{{Scheduled_Date}}`, `{{Scope_Of_Work}}`, and `{{Generated_At}}`.
2. **Install the Script:** Open **Extensions > Apps Script**, paste `Code.gs`, and paste `appsscript.json` in the manifest editor.
3. **Configure & Dispatch:** Reload the sheet, run **SheetAutomate > Initialize Work_Orders Sheet**, set your IDs via **SheetAutomate > Configure Template & Output Folder**, and run **SheetAutomate > Generate Scheduled Work Order PDFs**.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Reads and updates only the active spreadsheet (`@OnlyCurrentDoc`).
- `https://www.googleapis.com/auth/documents` — Merges work order fields into a temporary copy of your Google Docs template.
- `https://www.googleapis.com/auth/drive.file` — Creates the temporary copy, exports the PDF to your chosen folder, and trashes the temp Doc.
