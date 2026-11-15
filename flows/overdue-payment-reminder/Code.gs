/**
 * SheetAutomate Flow: Automated Overdue Invoice Follow-Up Mailer
 * License: MIT
 * Telemetry: Zero telemetry, zero external tracking, 100% local execution in your Google account.
 *
 * @OnlyCurrentDoc
 */

var FLOW_CONFIG = {
  SHEET_NAME: 'Invoices',
  CURRENCY_SYMBOL: '$',
  STAGE_THRESHOLDS: [
    { minDays: 14, code: 'STAGE_14', label: 'Final Notice (14+ Days Overdue)' },
    { minDays: 7, code: 'STAGE_7', label: 'Second Reminder (7+ Days Overdue)' },
    { minDays: 3, code: 'STAGE_3', label: 'Gentle Reminder (3+ Days Overdue)' }
  ],
  TRIGGER_HANDLER: 'sendOverdueReminders'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Send Overdue Reminders Now', 'sendOverdueReminders')
    .addItem('Install Daily 9 AM Trigger', 'installDailyReminderTrigger')
    .addItem('Initialize Invoices Sheet', 'initializeInvoicesSheet')
    .addToUi();
}

/**
 * Creates the Invoices tab with standard headers if it does not yet exist.
 */
function initializeInvoicesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(FLOW_CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(FLOW_CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Invoice_ID',
      'Client_Name',
      'Client_Email',
      'Amount_Due',
      'Due_Date',
      'Payment_Status',
      'Last_Reminder_Stage',
      'Sent_Timestamp'
    ]);
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Sheet "' + FLOW_CONFIG.SHEET_NAME + '" is ready.');
}

/**
 * Installs a daily time-driven trigger at 09:00 without creating duplicates.
 */
function installDailyReminderTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === FLOW_CONFIG.TRIGGER_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger(FLOW_CONFIG.TRIGGER_HANDLER)
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  SpreadsheetApp.getUi().alert('Daily overdue reminder trigger installed (9:00 AM).');
}

/**
 * Scans unpaid invoices and dispatches staged reminders once per overdue tier.
 */
function sendOverdueReminders() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another reminder run is active.');
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(FLOW_CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing required tab: ' + FLOW_CONFIG.SHEET_NAME);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    var todayMidnight = stripTime_(new Date());
    var sentCount = 0;

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var invoiceId = String(row[0] || '').trim();
      var clientName = String(row[1] || '').trim();
      var clientEmail = String(row[2] || '').trim();
      var rawAmount = row[3];
      var rawDueDate = row[4];
      var paymentStatus = String(row[5] || '').trim().toUpperCase();
      var lastStage = String(row[6] || '').trim().toUpperCase();

      if (!invoiceId && !clientName && !clientEmail) {
        continue;
      }

      if (paymentStatus === 'PAID' || paymentStatus === 'VOID' || paymentStatus === 'CANCELLED') {
        continue;
      }

      var parsedDueDate = parseDate_(rawDueDate);
      var parsedAmount = Number(rawAmount);

      if (!invoiceId || !clientName || !isValidEmail_(clientEmail) || !parsedDueDate || isNaN(parsedAmount) || parsedAmount <= 0) {
        sheet.getRange(rowNumber, 7).setValue('NEEDS_CORRECTION');
        sheet.getRange(rowNumber, 8).setValue('Invalid or missing required invoice fields');
        continue;
      }

      var dueMidnight = stripTime_(parsedDueDate);
      var daysOverdue = Math.floor((todayMidnight.getTime() - dueMidnight.getTime()) / 86400000);
      if (daysOverdue < 3) {
        continue;
      }

      var targetStage = resolveStage_(daysOverdue);
      if (!targetStage) {
        continue;
      }

      if (stageRank_(lastStage) >= stageRank_(targetStage.code)) {
        continue;
      }

      var formattedAmount = formatCurrency_(parsedAmount);
      var formattedDueDate = Utilities.formatDate(dueMidnight, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
      var subject = '[' + targetStage.label + '] Invoice ' + invoiceId + ' - ' + formattedAmount;
      var htmlBody = buildReminderHtml_({
        invoiceId: invoiceId,
        clientName: clientName,
        amountFormatted: formattedAmount,
        dueDateFormatted: formattedDueDate,
        daysOverdue: daysOverdue,
        stage: targetStage
      });
      var plainBody = buildReminderText_({
        invoiceId: invoiceId,
        clientName: clientName,
        amountFormatted: formattedAmount,
        dueDateFormatted: formattedDueDate,
        daysOverdue: daysOverdue,
        stage: targetStage
      });

      MailApp.sendEmail({
        to: clientEmail,
        subject: subject,
        body: plainBody,
        htmlBody: htmlBody
      });

      sheet.getRange(rowNumber, 7).setValue(targetStage.code);
      sheet.getRange(rowNumber, 8).setValue(new Date().toISOString());
      sentCount++;
    }

    SpreadsheetApp.flush();
    Logger.log('Overdue reminders dispatched: ' + sentCount);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Resolves the highest matching overdue stage for the given number of days.
 */
function resolveStage_(daysOverdue) {
  for (var i = 0; i < FLOW_CONFIG.STAGE_THRESHOLDS.length; i++) {
    if (daysOverdue >= FLOW_CONFIG.STAGE_THRESHOLDS[i].minDays) {
      return FLOW_CONFIG.STAGE_THRESHOLDS[i];
    }
  }
  return null;
}

/**
 * Returns numeric progression rank for idempotency comparison.
 */
function stageRank_(stageCode) {
  if (stageCode === 'STAGE_3') return 1;
  if (stageCode === 'STAGE_7') return 2;
  if (stageCode === 'STAGE_14') return 3;
  return 0;
}

/**
 * Builds an HTML-escaped reminder email body.
 */
function buildReminderHtml_(data) {
  var greeting = 'Hello ' + escapeHtml_(data.clientName) + ',';
  var toneCopy = 'This is a courteous reminder regarding your outstanding invoice listed below.';
  if (data.stage.code === 'STAGE_7') {
    toneCopy = 'We are following up again on the open invoice below, which is now ' + data.daysOverdue + ' days past due.';
  } else if (data.stage.code === 'STAGE_14') {
    toneCopy = 'This invoice is now ' + data.daysOverdue + ' days past its due date. Please arrange payment or reply with remittance details.';
  }

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5;">',
    '<h2 style="margin:0 0 12px;color:#0f172a;font-size:18px;">' + escapeHtml_(data.stage.label) + '</h2>',
    '<p style="margin:0 0 12px;">' + greeting + '</p>',
    '<p style="margin:0 0 16px;">' + escapeHtml_(toneCopy) + '</p>',
    '<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;">',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Invoice ID</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.invoiceId) + '</td></tr>',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Due Date</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(data.dueDateFormatted) + '</td></tr>',
    '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">Days Overdue</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + data.daysOverdue + ' days</td></tr>',
    '<tr><td style="padding:8px 12px;font-weight:bold;">Amount Due</td><td style="padding:8px 12px;font-weight:bold;color:#047857;">' + escapeHtml_(data.amountFormatted) + '</td></tr>',
    '</table>',
    '<p style="margin:16px 0 0;font-size:13px;color:#475569;">If payment has already been sent, please disregard this notice or reply with your payment confirmation.</p>',
    '</div>'
  ].join('');
}

/**
 * Builds plain-text fallback email body.
 */
function buildReminderText_(data) {
  return [
    data.stage.label,
    '',
    'Hello ' + data.clientName + ',',
    '',
    'Invoice ID: ' + data.invoiceId,
    'Due Date: ' + data.dueDateFormatted,
    'Days Overdue: ' + data.daysOverdue + ' days',
    'Amount Due: ' + data.amountFormatted,
    '',
    'If payment has already been submitted, please reply with your remittance confirmation.'
  ].join('\n');
}

function stripTime_(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

function parseDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    var parsed = new Date(value.trim());
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatCurrency_(amount) {
  return FLOW_CONFIG.CURRENCY_SYMBOL + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
