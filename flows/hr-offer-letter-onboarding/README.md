# Candidate Offer Letter & Onboarding Folder Pack

Automate HR offer pack creation from Google Sheets: merge candidate compensation and start dates into a Google Docs template, provision a dedicated candidate onboarding folder in Google Drive, export a clean PDF offer letter inside it, and log both links back to the Sheet.

Interactive demo: https://sheetautomate.com/?flow=hr-offer-letter-onboarding

## Features

- **One-Click Starter Template**: Generates a ready-to-use Google Docs offer template with `{{CANDIDATE_NAME}}`, `{{ROLE_TITLE}}`, `{{START_DATE}}`, and `{{BASE_SALARY}}` placeholders—or links your existing template ID.
- **Dedicated Candidate Drive Folder**: Automatically creates `<Candidate_ID> - <Candidate_Name> Onboarding` inside your onboarding root folder and stores the exported PDF inside it.
- **Idempotency & Lock Guard**: Uses `LockService.getScriptLock()` and skips rows already marked `COMPLETED` or having an existing `PDF_Link`.
- **Clean Cleanup**: Trashes the temporary merged Google Doc after exporting the PDF so Drive stays organized.

## Sheet Schema (`Offers`)

| Column | Header | Description |
| --- | --- | --- |
| A | `Candidate_ID` | Unique candidate or requisition ID |
| B | `Candidate_Name` | Candidate full legal name |
| C | `Role_Title` | Offered position title |
| D | `Start_Date` | Target onboarding date (`YYYY-MM-DD`) |
| E | `Base_Salary` | Compensation string (e.g. `$145,000 / yr`) |
| F | `Folder_Link` | Drive URL of the candidate onboarding folder |
| G | `PDF_Link` | Drive URL of the generated Offer Letter PDF |
| H | `Audit_Status` | `COMPLETED` or `NEEDS_CORRECTION` |

## Setup Guide

1. Create a Google Sheet with an `Offers` tab matching the columns above.
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json`, and save.
3. Reload the spreadsheet, run **SheetAutomate -> Create Starter Offer Template Doc** (or **Configure Template & Root Folder IDs**), then run **Generate Offer Packs**.

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads candidate offer rows and logs Drive links/status in the active spreadsheet only. |
| `https://www.googleapis.com/auth/documents` | Opens your offer letter Google Docs template and replaces merge placeholders. |
| `https://www.googleapis.com/auth/drive.file` | Creates candidate onboarding folders and PDFs managed by this script without broad Drive access. |
