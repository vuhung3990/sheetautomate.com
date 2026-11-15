# Low-Stock Threshold & Reorder Alert Dispatcher

Automatically monitor inventory quantities against reorder points in Google Sheets, flag `LOW_STOCK` items, compute suggested reorder quantities, and dispatch a summary digest email plus an optional HTTPS JSON webhook alert.

Interactive demo: https://sheetautomate.com/?flow=inventory-low-stock-alert

## Features

- **Threshold Monitoring & Reorder Math**: Compares `Stock_Qty` against `Reorder_Point` and computes `Suggested_Reorder = Target_Stock - Stock_Qty`.
- **Daily Deduplication**: Records `Last_Alert_Date` so flagged SKUs are not alerted repeatedly on the same day.
- **Zero Hardcoded URLs or Emails**: Reads `ALERT_RECIPIENT_EMAIL` and optional `ALERT_WEBHOOK_URL` strictly from `PropertiesService.getScriptProperties()`.
- **Dual Delivery**: Sends an HTML-escaped table digest via `MailApp` and optionally POSTs structured JSON to your Slack, Google Chat, or custom HTTPS endpoint.

## Sheet Schema (`Inventory`)

| Column | Header | Description |
| --- | --- | --- |
| A | `SKU` | Unique stock-keeping unit code |
| B | `Item_Name` | Product or supply description |
| C | `Stock_Qty` | Current on-hand unit count |
| D | `Reorder_Point` | Minimum threshold before triggering an alert |
| E | `Target_Stock` | Ideal post-restock inventory level |
| F | `Suggested_Reorder` | Auto-calculated units to order |
| G | `Alert_Status` | `OK`, `LOW_STOCK`, or `NEEDS_CORRECTION` |
| H | `Last_Alert_Date` | `YYYY-MM-DD` date of the most recent alert sent |

## Setup Guide

1. Create a Google Sheet with an `Inventory` tab matching the columns above.
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json`, and save.
3. Reload the spreadsheet, run **SheetAutomate -> Configure Alert Recipient & Webhook** to store your email and optional `https://` webhook URL in Script Properties, then run **Check Stock Levels & Alert** or install the daily trigger.

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads stock levels and updates status/reorder columns in the active spreadsheet only. |
| `https://www.googleapis.com/auth/script.send_mail` | Sends low-stock summary digest emails via `MailApp`. |
| `https://www.googleapis.com/auth/script.external_request` | Enables `UrlFetchApp.fetch` exclusively when you configure `ALERT_WEBHOOK_URL` in Script Properties. |
| `https://www.googleapis.com/auth/script.scriptapp` | Installs and manages the daily stock-check trigger via `ScriptApp`. |
