# Automated Weekly Executive KPI Digest Mailer

Aggregate weekly department revenue, cost, gross margin, and task completion KPIs across Google Sheets tabs, render a responsive HTML executive summary email, dispatch it to your configured stakeholder list via `MailApp`, and log a SHA-256 run hash to prevent duplicate weekly sends.

Interactive demo: https://sheetautomate.com/?flow=weekly-kpi-digest-mailer

## Features

- **Cross-Tab Aggregation**: Rolls up `Weekly_KPI_Data` (and an optional `Tasks_Log` tab if present) for the latest reporting week.
- **Responsive HTML Email**: Formats top-level KPI cards (Revenue, Cost, Gross Margin %, Task Completion %) alongside a department breakdown table with HTML-escaped values.
- **Run-Hash Idempotency**: Computes a SHA-256 digest of the week, metrics, and recipient list and logs it to `Digest_Audit` so identical digests are never emailed twice.
- **Configured Recipients**: Stores stakeholder addresses in `STAKEHOLDER_EMAILS` Script Properties instead of hardcoding emails.

## Sheet Schema (`Weekly_KPI_Data`)

| Column | Header | Description |
| --- | --- | --- |
| A | `Week_Label` | ISO week identifier (e.g. `2026-W46`) |
| B | `Department` | Business unit or team name |
| C | `Revenue` | Weekly revenue numeric amount |
| D | `Cost` | Weekly cost numeric amount |
| E | `Tasks_Completed` | Count of completed weekly tasks |
| F | `Tasks_Planned` | Count of planned weekly tasks |
| G | `Row_Status` | `READY` or `NEEDS_CORRECTION` |

## Setup Guide

1. Create a Google Sheet with a `Weekly_KPI_Data` tab matching the 7 columns above.
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json`, and save.
3. Reload the spreadsheet, run **SheetAutomate -> Configure Stakeholder Recipients**, and click **Send Weekly KPI Digest Now** or **Install Weekly Monday 8 AM Trigger**.

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads KPI/task tabs and writes run-hash audit records in the active spreadsheet only. |
| `https://www.googleapis.com/auth/script.send_mail` | Dispatches the weekly executive KPI digest email via `MailApp`. |
| `https://www.googleapis.com/auth/script.scriptapp` | Installs and manages the weekly Monday trigger via `ScriptApp`. |
