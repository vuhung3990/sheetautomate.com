# Training & Course Certificate Batch Issuer

Batch-generate polished course completion certificate PDFs from Google Sheets for trainees whose status is `Approved` and whose score meets your configurable passing threshold, with built-in duplicate prevention via `LockService` and existing-link checks.

**Interactive Demo:** [https://sheetautomate.com/?flow=completion-certificate-batch](https://sheetautomate.com/?flow=completion-certificate-batch)

## Key Features

- **Passing Score Gate:** Evaluates `Score_Pct` against your configured passing threshold (default `80%`) and clearly marks non-passing rows in `Audit_Status`.
- **Duplicate Prevention:** Guarded by `LockService.getScriptLock()` and skips any row with `Audit_Status === 'COMPLETED'` or an existing `PDF_Link`.
- **Clean Date & Score Formatting:** Automatically formats Sheets date cells to `yyyy-MM-dd` and appends `%` to numeric scores inside the certificate template.
- **Zero-Telemetry Security:** Runs strictly inside your Google Workspace account with least-privilege OAuth scopes.

## Sheet Schema (`Certificates` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Certificate_ID` | Unique credential ID (e.g., `CERT-2026-881`) |
| B | `Trainee_Name` | Full name printed on the certificate |
| C | `Course_Title` | Completed course or program name |
| D | `Score_Pct` | Numeric assessment score (`0-100`) |
| E | `Completion_Date` | Date of completion (`YYYY-MM-DD`) |
| F | `Status` | Set to `Approved` to authorize issuance |
| G | `PDF_Link` | Populated with the Drive certificate PDF URL |
| H | `Audit_Status` | Set to `COMPLETED`, `SKIPPED`, or `NEEDS_CORRECTION` |

## Setup Guide

1. **Design Certificate Template:** Create a Google Doc containing placeholders `{{Certificate_ID}}`, `{{Trainee_Name}}`, `{{Course_Title}}`, `{{Score_Pct}}`, and `{{Completion_Date}}`.
2. **Install the Script:** Open **Extensions > Apps Script**, paste `Code.gs`, and paste `appsscript.json` into the manifest file.
3. **Configure & Issue:** Reload your spreadsheet, run **SheetAutomate > Initialize Certificates Sheet**, configure your IDs and passing score via **SheetAutomate > Configure Template, Folder & Passing Score**, and run **SheetAutomate > Issue Approved Certificate PDFs**.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Reads and updates only the active spreadsheet (`@OnlyCurrentDoc`).
- `https://www.googleapis.com/auth/documents` — Merges trainee details into a temporary copy of your certificate template.
- `https://www.googleapis.com/auth/drive.file` — Exports certificate PDFs into your selected Drive folder without requesting full Drive access.
