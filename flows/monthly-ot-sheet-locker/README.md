# Monthly Attendance & OT Sheet Provisioner + Auto-Lock

On the 1st of each month, automatically clone a `_Template` tab to create the new month's `OT_YYYY_MM` overtime sheet while keeping staff hour cells (`D2:E100`) editable, lock the closing month's sheet tab (`M - 1`) to prevent retroactive edits, and log every execution in `Audit_Log`.

**Interactive Demo:** [https://sheetautomate.com/?flow=monthly-ot-sheet-locker](https://sheetautomate.com/?flow=monthly-ot-sheet-locker)

## Key Features

- **Selective Range Protection:** Clones `_Template` into the new month (`M`) and protects headers, formulas, and approval columns while keeping `D2:E100` (`Regular_Hours` and `OT_Hours`) editable for staff.
- **Retroactive Edit Lock:** Applies full tab protection to the closing month's `OT_YYYY_MM` sheet (`M - 1`) and removes non-owner editors.
- **Idempotent Execution:** Checks whether the target month's tab or the closing month's lock already exists before taking action, guarded by `LockService.getScriptLock()`.
- **Audit Trail:** Records every provisioning and locking run in `Audit_Log`.

## Sheet Schema (`_Template` tab)

| Column | Header | Description |
| :--- | :--- | :--- |
| A | `Employee_ID` | Employee roster identifier |
| B | `Employee_Name` | Staff member full name |
| C | `Department` | Team or cost center |
| D | `Regular_Hours` | Editable staff regular hours (`D2:E100`) |
| E | `OT_Hours` | Editable staff overtime hours (`D2:E100`) |
| F | `Manager_Approval` | Protected approval status column |
| G | `Audit_Status` | Template/sheet audit status |

## Setup Guide

1. **Install the Script:** Open **Extensions > Apps Script**, paste `Code.gs`, and paste `appsscript.json` into the manifest editor.
2. **Initialize Tabs:** Reload the spreadsheet and run **SheetAutomate > Initialize _Template & Audit_Log Tabs**, then populate your employee roster in `_Template`.
3. **Run or Automate:** Run **SheetAutomate > Provision Next Month & Lock Previous** manually or click **SheetAutomate > Install Monthly 1st-of-Month Trigger**.

## OAuth Scopes (`appsscript.json`)

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — Only accesses the active spreadsheet (`@OnlyCurrentDoc`) to clone tabs, apply range/sheet protections, and append audit rows.
- `https://www.googleapis.com/auth/script.scriptapp` — Installs the optional monthly 1st-of-month time-driven trigger via `ScriptApp.newTrigger()`.
