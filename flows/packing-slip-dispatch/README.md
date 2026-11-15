# Warehouse Packing Slip & Dispatch Manifest PDF

Batch-generate printable Packing Slip PDFs and a consolidated Carrier Dispatch Manifest PDF directly from Google Sheets orders marked `READY_TO_SHIP`, save them into Google Drive, and lock each order as `SHIPPED`.

Interactive demo: https://sheetautomate.com/?flow=packing-slip-dispatch

## Features

- **Per-Order Packing Slips**: Renders clean HTML-escaped packing slips to PDF via `Utilities.newBlob(..., MimeType.HTML).getAs(MimeType.PDF)` with zero external services.
- **Batch Dispatch Manifest**: Creates a single summary manifest PDF (`MAN-YYYYMMDD-HHMM`) listing every order and tracking number in the batch, and logs it to `Dispatch_Manifests`.
- **No Duplicate Shipments**: Guarded by `LockService.getScriptLock()`; skips any order already marked `SHIPPED` or having an existing `PDF_Link`.
- **Missing Field Guard**: Flags orders missing address, items, or carrier tracking with `NEEDS_CORRECTION`.

## Sheet Schema (`Dispatch_Orders`)

| Column | Header | Description |
| --- | --- | --- |
| A | `Order_ID` | Unique fulfillment order ID |
| B | `Recipient_Name` | Customer or warehouse consignee name |
| C | `Shipping_Address` | Full street, city, state/region, and postal code |
| D | `Items_Summary` | Line items and quantities to pack |
| E | `Carrier_Tracking` | Carrier tracking number |
| F | `Status` | `READY_TO_SHIP`, `SHIPPED`, or `NEEDS_CORRECTION` |
| G | `PDF_Link` | Drive URL of the generated Packing Slip PDF |
| H | `Manifest_ID` | Batch manifest ID assigned upon dispatch |

## Setup Guide

1. Create a Google Sheet with a `Dispatch_Orders` tab matching the columns above.
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json`, and save.
3. Reload the spreadsheet and click **SheetAutomate -> Generate Packing Slips & Manifest** (optionally configure a target Drive folder ID first).

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads ready-to-ship orders and updates `Status`, `PDF_Link`, and `Manifest_ID` in the active spreadsheet only. |
| `https://www.googleapis.com/auth/drive.file` | Creates the output folder, packing slip PDFs, and dispatch manifest PDFs managed by this script. |
