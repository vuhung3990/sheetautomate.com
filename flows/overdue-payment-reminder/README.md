# Automated Overdue Invoice Follow-Up Mailer

Automatically scan unpaid invoices in Google Sheets each day, classify overdue balances into staged follow-up tiers (`STAGE_3`, `STAGE_7`, `STAGE_14`), send polite HTML payment reminders via `MailApp`, and record the sent stage and timestamp so clients are never emailed twice for the same tier.

Interactive demo: https://sheetautomate.com/?flow=overdue-payment-reminder

## Features

- **Staged Follow-Up Logic**: Sends escalating reminders at **3+ days**, **7+ days**, and **14+ days** past `Due_Date`.
- **Idempotency & Lock Protection**: Uses `LockService.getScriptLock()` and checks `Last_Reminder_Stage` so each tier is sent at most once per invoice.
- **Input Validation**: Skips `PAID` / `VOID` / `CANCELLED` rows and flags incomplete or invalid rows with `NEEDS_CORRECTION`.
- **Zero Telemetry**: Runs 100% inside your Google account with HTML-escaped email templates.

## Sheet Schema (`Invoices`)

| Column | Header | Description |
| --- | --- | --- |
| A | `Invoice_ID` | Unique invoice identifier (e.g. `INV-2026-201`) |
| B | `Client_Name` | Client or billing company name |
| C | `Client_Email` | Recipient accounts-payable email address |
| D | `Amount_Due` | Numeric amount due (e.g. `4850.00`) |
| E | `Due_Date` | Invoice due date (`YYYY-MM-DD` or Sheets Date) |
| F | `Payment_Status` | `UNPAID`, `PAID`, `VOID`, or `CANCELLED` |
| G | `Last_Reminder_Stage` | Written automatically (`STAGE_3`, `STAGE_7`, `STAGE_14`, or `NEEDS_CORRECTION`) |
| H | `Sent_Timestamp` | ISO-8601 UTC timestamp of the last reminder sent |

## Setup Guide

1. Create a Google Sheet with a tab named `Invoices` using the columns above (or run **SheetAutomate -> Initialize Invoices Sheet** after pasting the code).
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json` (enable showing `appsscript.json` in Project Settings).
3. Reload the spreadsheet, authorize the script once, and use **SheetAutomate -> Send Overdue Reminders Now** or **Install Daily 9 AM Trigger**.

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads invoice rows and writes reminder stage/timestamp audit columns in the active spreadsheet only. |
| `https://www.googleapis.com/auth/script.send_mail` | Dispatches reminder emails via `MailApp.sendEmail` without requesting full Gmail mailbox read access. |
| `https://www.googleapis.com/auth/script.scriptapp` | Installs and manages the daily time-driven trigger via `ScriptApp`. |
