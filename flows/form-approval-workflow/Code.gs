/**
 * SheetAutomate Flow: Google Form Expense & Leave Approval Pipeline
 * License: MIT
 * Telemetry: Zero telemetry, zero external tracking, 100% local execution in your Google account.
 *
 * @OnlyCurrentDoc
 */

var APPROVAL_CONFIG = {
  SHEET_NAME: 'Requests'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Approve Selected Row', 'approveSelectedRow')
    .addItem('Reject Selected Row', 'rejectSelectedRow')
    .addItem('Process Pending Decisions', 'processApprovalDecisions')
    .addItem('Install Form & Approval Triggers', 'installApprovalTriggers')
    .addItem('Initialize Requests Sheet', 'initializeRequestsSheet')
    .addToUi();
}

/**
 * Creates the Requests tab with standard headers if missing.
 */
function initializeRequestsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(APPROVAL_CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(APPROVAL_CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Request_ID',
      'Requester_Email',
      'Request_Type',
      'Amount_Or_Days',
      'Approval_Status',
      'Approver_Notes',
      'Decision_Timestamp',
      'Audit_Status'
    ]);
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Sheet "' + APPROVAL_CONFIG.SHEET_NAME + '" is ready.');
}

/**
 * Installs spreadsheet-bound Form Submit and installable Edit triggers without duplicates.
 */
function installApprovalTriggers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction();
    if (fn === 'handleFormSubmit' || fn === 'handleApprovalEdit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('handleFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  ScriptApp.newTrigger('handleApprovalEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert('Form Submit and Approval Edit triggers installed.');
}

/**
 * Normalizes newly submitted Form rows with a Request_ID and PENDING status.
 */
function handleFormSubmit(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = (e && e.range) ? e.range.getSheet() : ss.getSheetByName(APPROVAL_CONFIG.SHEET_NAME);
    if (!sheet || sheet.getName() !== APPROVAL_CONFIG.SHEET_NAME) {
      return;
    }

    var row = (e && e.range) ? e.range.getRow() : sheet.getLastRow();
    if (row < 2) {
      return;
    }

    var currentId = String(sheet.getRange(row, 1).getValue() || '').trim();
    if (!currentId) {
      sheet.getRange(row, 1).setValue('REQ-' + new Date().getFullYear() + '-' + row);
    }

    var currentStatus = String(sheet.getRange(row, 5).getValue() || '').trim();
    if (!currentStatus) {
      sheet.getRange(row, 5).setValue('PENDING');
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

/**
 * Installable onEdit handler triggered when Approval_Status or Approver_Notes changes.
 */
function handleApprovalEdit(e) {
  if (!e || !e.range) {
    return;
  }
  var sheet = e.range.getSheet();
  if (sheet.getName() !== APPROVAL_CONFIG.SHEET_NAME) {
    return;
  }
  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row < 2 || (col !== 5 && col !== 6)) {
    return;
  }
  processApprovalDecisions();
}

/**
 * Menu helper to approve the active row with prompted required notes.
 */
function approveSelectedRow() {
  updateSelectedRowDecision_('Approved');
}

/**
 * Menu helper to reject the active row with prompted required notes.
 */
function rejectSelectedRow() {
  updateSelectedRowDecision_('Rejected');
}

function updateSelectedRowDecision_(decision) {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getName() !== APPROVAL_CONFIG.SHEET_NAME) {
    ui.alert('Please select a row inside the "' + APPROVAL_CONFIG.SHEET_NAME + '" tab.');
    return;
  }

  var row = sheet.getActiveRange().getRow();
  if (row < 2) {
    ui.alert('Select a data row (row 2 or below).');
    return;
  }

  var existingTimestamp = String(sheet.getRange(row, 7).getValue() || '').trim();
  var existingAudit = String(sheet.getRange(row, 8).getValue() || '').trim().toUpperCase();
  if (existingAudit === 'COMPLETED' || existingTimestamp) {
    ui.alert('Row ' + row + ' is already locked (' + existingTimestamp + ').');
    return;
  }

  var prompt = ui.prompt(
    decision + ' Request (Row ' + row + ')',
    'Enter required approver notes for the requester:',
    ui.ButtonSet.OK_CANCEL
  );
  if (prompt.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var notes = prompt.getResponseText().trim();
  if (!notes) {
    ui.alert('Approver notes are required before setting ' + decision + '.');
    return;
  }

  sheet.getRange(row, 5).setValue(decision);
  sheet.getRange(row, 6).setValue(notes);
  processApprovalDecisions();
}

/**
 * Validates all Approved/Rejected rows, dispatches decision emails, and locks Decision_Timestamp.
 */
function processApprovalDecisions() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another approval run is active.');
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(APPROVAL_CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing required tab: ' + APPROVAL_CONFIG.SHEET_NAME);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var requestId = String(row[0] || '').trim();
      var requesterEmail = String(row[1] || '').trim();
      var requestType = String(row[2] || '').trim();
      var amountOrDays = String(row[3] || '').trim();
      var decisionRaw = String(row[4] || '').trim();
      var decisionNormalized = decisionRaw.toUpperCase();
      var approverNotes = String(row[5] || '').trim();
      var decisionTimestamp = String(row[6] || '').trim();
      var auditStatus = String(row[7] || '').trim().toUpperCase();

      if (!requestId && !requesterEmail) {
        continue;
      }

      // Idempotency lock: never re-send or overwrite completed decisions.
      if (auditStatus === 'COMPLETED' || decisionTimestamp) {
        continue;
      }

      if (decisionNormalized !== 'APPROVED' && decisionNormalized !== 'REJECTED') {
        continue;
      }

      if (!requestId || !isValidEmail_(requesterEmail) || !requestType || !amountOrDays || !approverNotes) {
        sheet.getRange(rowNumber, 8).setValue('NEEDS_CORRECTION');
        continue;
      }

      var canonicalDecision = decisionNormalized === 'APPROVED' ? 'Approved' : 'Rejected';
      var timestamp = new Date().toISOString();
      var subject = '[' + canonicalDecision + '] Request ' + requestId + ' - ' + requestType;

      MailApp.sendEmail({
        to: requesterEmail,
        subject: subject,
        body: buildDecisionText_({
          requestId: requestId,
          requestType: requestType,
          amountOrDays: amountOrDays,
          decision: canonicalDecision,
          approverNotes: approverNotes,
          timestamp: timestamp
        }),
        htmlBody: buildDecisionHtml_({
          requestId: requestId,
          requestType: requestType,
          amountOrDays: amountOrDays,
          decision: canonicalDecision,
          approverNotes: approverNotes,
          timestamp: timestamp
        })
      });

      sheet.getRange(rowNumber, 5).setValue(canonicalDecision);
      sheet.getRange(rowNumber, 7).setValue(timestamp);
      sheet.getRange(rowNumber, 8).setValue('COMPLETED');
    }

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function buildDecisionHtml_(data) {
  var badgeColor = data.decision === 'Approved' ? '#047857' : '#b91c1c';
  var badgeBg = data.decision === 'Approved' ? '#ecfdf5' : '#fef2f2';

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5;">',
    '<h2 style="margin:0 0 12px;font-size:18px;">Request Decision Notification</h2>',
    '<div style="display:inline-block;padding:4px 10px;border-radius:6px;background:' + badgeBg + ';color:' + badgeColor + ';font-weight:bold;margin-bottom:14px;">' + escapeHtml_(data.decision) + '</div>',
    '<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;background:#f8fafc;">',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Request ID</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.requestId) + '</td></tr>',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Request Type</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.requestType) + '</td></tr>',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Amount / Duration</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.amountOrDays) + '</td></tr>',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Approver Notes</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.approverNotes) + '</td></tr>',
    '<tr><td style="padding:8px 12px;font-weight:bold;">Decision Timestamp</td><td style="padding:8px 12px;">' + escapeHtml_(data.timestamp) + '</td></tr>',
    '</table>',
    '</div>'
  ].join('');
}

function buildDecisionText_(data) {
  return [
    'Request Decision: ' + data.decision,
    'Request ID: ' + data.requestId,
    'Request Type: ' + data.requestType,
    'Amount / Duration: ' + data.amountOrDays,
    'Approver Notes: ' + data.approverNotes,
    'Decision Timestamp: ' + data.timestamp
  ].join('\n');
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
