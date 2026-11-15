# Google Form Expense & Leave Approval Pipeline

Automate expense reimbursement and leave request approvals submitted through Google Forms into Google Sheets. Enforces required approver notes, sends HTML-formatted decision emails via `MailApp`, and locks the processed `Decision_Timestamp` to prevent duplicate notifications.

Interactive demo: https://sheetautomate.com/?flow=form-approval-workflow

## Features

- **Form & Edit Automation**: Assigns `Request_ID` and `PENDING` status on form submission, and triggers validation/dispatch when `Approval_Status` is updated to `Approved` or `Rejected`.
- **Mandatory Approver Notes**: Rejects decision dispatch and marks `NEEDS_CORRECTION` if `Approver_Notes` is blank.
- **Menu Quick Actions**: Includes **Approve Selected Row** and **Reject Selected Row** dialogs directly in the `SheetAutomate` menu.
- **Decision Timestamp Lock**: Once `Decision_Timestamp` and `COMPLETED` are written, the row is locked against duplicate emails.

## Sheet Schema (`Requests`)

| Column | Header | Description |
| --- | --- | --- |
| A | `Request_ID` | Unique request identifier (auto-generated on submit if empty) |
| B | `Requester_Email` | Submitter email address for decision notification |
| C | `Request_Type` | e.g. `Travel Expense`, `Annual Leave`, `Software Subscription` |
| D | `Amount_Or_Days` | Dollar amount or leave duration |
| E | `Approval_Status` | `PENDING`, `Approved`, or `Rejected` |
| F | `Approver_Notes` | Required justification or feedback sent to the requester |
| G | `Decision_Timestamp` | ISO-8601 UTC timestamp locked once notified |
| H | `Audit_Status` | `COMPLETED` or `NEEDS_CORRECTION` |

## Setup Guide

1. Create or link a Google Form response tab named `Requests` matching the 8 columns above.
2. Open **Extensions -> Apps Script**, paste `Code.gs` and `appsscript.json`, and save.
3. Reload the spreadsheet, run **SheetAutomate -> Install Form & Approval Triggers**, and test with **Approve Selected Row** or **Process Pending Decisions**.

## OAuth Scopes Explained

| Scope | Reason |
| --- | --- |
| `https://www.googleapis.com/auth/spreadsheets.currentonly` | Reads requests and writes decision timestamps/status inside the active spreadsheet only. |
| `https://www.googleapis.com/auth/script.send_mail` | Dispatches approval/rejection emails to requesters via `MailApp`. |
| `https://www.googleapis.com/auth/script.scriptapp` | Installs and manages Form Submit and Approval Edit triggers via `ScriptApp`. |
