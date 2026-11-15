# Dynamic Multi-Row Sales Quote & Proposal PDF

Group multiple line-item rows sharing the same `Quote_ID` in Google Sheets into a formatted multi-row table inside a Google Docs quote template, compute the grand total, export a clean PDF to Google Drive, and sync the PDF link back to every matching row.

**Interactive Demo:** [https://sheetautomate.com/?flow=multi-item-sales-quote](https://sheetautomate.com/?flow=multi-item-sales-quote)

## Key Features

- **Multi-Row Grouping:** Aggregates all rows sharing a `Quote_ID` into a single quote PDF without manual copy-pasting.
- **Dynamic Docs Table:** Replaces `{{LINE_ITEMS_TABLE}}` with a styled `DocumentApp` table (`Item Description`, `Qty`, `Unit Price`, `Line Total`) and calculates `{{Grand_Total}}`.
- **Group-Level Idempotency & Locking:** Guarded by `LockService.getScriptLock()` and skips any `Quote_ID` group whose rows are already marked `COMPLETED` or linked.
- **Line-Item Validation:** Validates positive numeric quantities and non-negative unit prices, flagging invalid rows with `NEEDS_CORRECTION`.

## Sheet Schema (`Quote_Line_Items` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Quote_ID` | Shared quote identifier grouping multiple rows (e.g., `QT-2026-301`) |
| B | `Client_Name` | Customer company name |
| C | `Item_Description` | Product or service line-item description |
| D | `Quantity` | Positive numeric quantity |
| E | `Unit_Price_USD` | Numeric unit price in USD |
| F | `Status` | Set all rows for a `Quote_ID` to `Approved` when ready |
| G | `PDF_Link` | Populated across all rows in the quote with the Drive PDF URL |
| H | `Audit_Status` | Set to `COMPLETED` or `NEEDS_CORRECTION` |

## Setup Guide

1. **Prepare Quote Template:** Create a Google Doc with placeholders `{{Quote_ID}}`, `{{Client_Name}}`, `{{Quote_Date}}`, `{{Grand_Total}}`, and `{{LINE_ITEMS_TABLE}}` on its own paragraph line.
2. **Install the Script:** Open **Extensions > Apps Script**, paste `Code.gs`, and paste `appsscript.json` into the manifest editor.
3. **Configure & Generate:** Reload your sheet, run **SheetAutomate > Initialize Quote_Line_Items Sheet**, save your IDs via **SheetAutomate > Configure Quote Template & Folder**, and run **SheetAutomate > Generate Multi-Item Quote PDFs**.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Reads line items and updates PDF links only in the active spreadsheet (`@OnlyCurrentDoc`).
- `https://www.googleapis.com/auth/documents` — Inserts the formatted multi-row table and quote totals into a temporary copy of your Docs template.
- `https://www.googleapis.com/auth/drive.file` — Exports the quote PDF to your Drive folder and trashes the temporary Docs copy.
