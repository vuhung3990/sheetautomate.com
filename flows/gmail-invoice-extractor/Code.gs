/**
 * SheetAutomate Flow: Gmail Billing & Receipt Scanner to Sheets
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const GMAIL_EXTRACTOR_CONFIG = {
  TAB_NAME: 'Billing_Log',
  PROP_QUERY: 'SA_GMAIL_INVOICE_QUERY',
  PROP_FOLDER_ID: 'SA_GMAIL_ARCHIVE_FOLDER_ID',
  DEFAULT_QUERY: 'has:attachment filename:pdf (label:billing OR subject:invoice)',
  DEFAULT_FOLDER_NAME: 'SheetAutomate_Gmail_Invoices',
  MAX_THREADS: 25,
  LOCK_TIMEOUT_MS: 10000,
  REQUIRED_HEADERS: [
    'Logged_At',
    'Message_ID',
    'Sender',
    'Subject',
    'Attachment_Name',
    'Drive_PDF_Link',
    'Audit_Status'
  ]
};

/**
 * Adds the custom SheetAutomate menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Scan Gmail for PDF Invoices', 'scanGmailInvoicesInteractive')
    .addItem('Configure Gmail Query & Folder', 'configureGmailExtractor')
    .addItem('Install Hourly Trigger', 'installHourlyGmailTrigger')
    .addItem('Initialize Billing_Log Sheet', 'initializeBillingLogSheet')
    .addToUi();
}

/**
 * Prompts the user for the Gmail search query and optional Drive archive folder ID.
 */
function configureGmailExtractor() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const currentQuery = props.getProperty(GMAIL_EXTRACTOR_CONFIG.PROP_QUERY) || GMAIL_EXTRACTOR_CONFIG.DEFAULT_QUERY;
  const queryResp = ui.prompt(
    'Step 1 of 2: Gmail Search Query',
    'Enter the Gmail search query for billing emails:\nCurrent: ' + currentQuery,
    ui.ButtonSet.OK_CANCEL
  );
  if (queryResp.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const queryText = queryResp.getResponseText().trim();
  if (!queryText) {
    ui.alert('Gmail search query cannot be empty.');
    return;
  }

  const currentFolderId = props.getProperty(GMAIL_EXTRACTOR_CONFIG.PROP_FOLDER_ID) || '';
  const folderResp = ui.prompt(
    'Step 2 of 2: Archive Drive Folder ID (Optional)',
    'Paste a Drive Folder ID, or leave blank to auto-create "' +
      GMAIL_EXTRACTOR_CONFIG.DEFAULT_FOLDER_NAME +
      '":' +
      (currentFolderId ? '\nCurrent: ' + currentFolderId : ''),
    ui.ButtonSet.OK_CANCEL
  );
  if (folderResp.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  props.setProperty(GMAIL_EXTRACTOR_CONFIG.PROP_QUERY, queryText);
  const folderId = folderResp.getResponseText().trim();
  if (folderId) {
    props.setProperty(GMAIL_EXTRACTOR_CONFIG.PROP_FOLDER_ID, folderId);
  }
  ui.alert('Gmail extractor settings saved.');
}

/**
 * Creates or verifies the Billing_Log sheet and header row.
 */
function initializeBillingLogSheet() {
  const sheet = ensureBillingLogSheet_();
  SpreadsheetApp.getUi().alert('Sheet "' + sheet.getName() + '" is ready.');
}

/**
 * Installs an hourly time-driven trigger for extractGmailInvoices if not already present.
 */
function installHourlyGmailTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const alreadyExists = triggers.some(function (trigger) {
    return trigger.getHandlerFunction() === 'extractGmailInvoices';
  });

  if (alreadyExists) {
    SpreadsheetApp.getUi().alert('An hourly trigger for extractGmailInvoices is already installed.');
    return;
  }

  ScriptApp.newTrigger('extractGmailInvoices').timeBased().everyHours(1).create();
  SpreadsheetApp.getUi().alert('Hourly Gmail extraction trigger installed.');
}

/**
 * Menu entry point that displays a summary dialog on completion.
 */
function scanGmailInvoicesInteractive() {
  const summary = runGmailExtraction_();
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * Trigger entry point for automated hourly execution without UI alerts.
 */
function extractGmailInvoices() {
  const summary = runGmailExtraction_();
  Logger.log(summary);
}

/**
 * Searches matching Gmail threads, archives PDF attachments to Drive,
 * and logs new rows while skipping previously processed Gmail Message IDs.
 *
 * @return {string}
 */
function runGmailExtraction_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(GMAIL_EXTRACTOR_CONFIG.LOCK_TIMEOUT_MS)) {
    return 'Skipped: Another Gmail extraction job is currently running.';
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const query = (props.getProperty(GMAIL_EXTRACTOR_CONFIG.PROP_QUERY) || GMAIL_EXTRACTOR_CONFIG.DEFAULT_QUERY).trim();
    if (!query) {
      throw new Error('NEEDS_CORRECTION: Gmail search query is empty.');
    }

    const sheet = ensureBillingLogSheet_();
    const folder = resolveArchiveFolder_(props);
    const existingMessageIds = collectExistingMessageIds_(sheet);

    const threads = GmailApp.search(query, 0, GMAIL_EXTRACTOR_CONFIG.MAX_THREADS);
    const rowsToAppend = [];
    let skippedMessages = 0;

    for (let t = 0; t < threads.length; t++) {
      const messages = threads[t].getMessages();
      for (let m = 0; m < messages.length; m++) {
        const message = messages[m];
        const messageId = String(message.getId() || '').trim();

        // Idempotency guard: skip any Gmail message ID already logged.
        if (!messageId || existingMessageIds.has(messageId)) {
          skippedMessages++;
          continue;
        }

        const attachments = message.getAttachments({ includeInlineImages: false, includeAttachments: true });
        const pdfAttachments = attachments.filter(function (att) {
          const name = String(att.getName() || '').toLowerCase();
          return att.getContentType() === MimeType.PDF || name.endsWith('.pdf');
        });

        if (pdfAttachments.length === 0) {
          continue;
        }

        const sender = String(message.getFrom() || '').trim();
        const subject = String(message.getSubject() || '(No Subject)').trim();
        const loggedAt = new Date().toISOString();

        for (let a = 0; a < pdfAttachments.length; a++) {
          const pdfAtt = pdfAttachments[a];
          const cleanName = sanitizeAttachmentName_(pdfAtt.getName(), messageId);
          const blob = pdfAtt.copyBlob().setName(cleanName);
          const savedFile = folder.createFile(blob);

          rowsToAppend.push([
            loggedAt,
            messageId,
            sender,
            subject,
            cleanName,
            savedFile.getUrl(),
            'COMPLETED'
          ]);
        }

        existingMessageIds.add(messageId);
      }
    }

    if (rowsToAppend.length > 0) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, GMAIL_EXTRACTOR_CONFIG.REQUIRED_HEADERS.length).setValues(rowsToAppend);
    }

    return (
      'Gmail Invoice Scan Complete\n\nPDFs Archived: ' +
      rowsToAppend.length +
      '\nMessages Skipped (Already Processed): ' +
      skippedMessages
    );
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ensures the Billing_Log tab exists with the required header row.
 *
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureBillingLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(GMAIL_EXTRACTOR_CONFIG.TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(GMAIL_EXTRACTOR_CONFIG.TAB_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, GMAIL_EXTRACTOR_CONFIG.REQUIRED_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(function (cell) {
    return String(cell).trim() !== '';
  });

  if (!hasHeaders) {
    headerRange.setValues([GMAIL_EXTRACTOR_CONFIG.REQUIRED_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Collects all Message_ID values already logged in Billing_Log for idempotency.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {Set<string>}
 */
function collectExistingMessageIds_(sheet) {
  const ids = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ids;
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (h) {
      return String(h).trim();
    });
  const msgColIdx = headers.indexOf('Message_ID');
  if (msgColIdx === -1) {
    throw new Error('Missing required column header: Message_ID');
  }

  const values = sheet.getRange(2, msgColIdx + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    const id = String(values[i][0] || '').trim();
    if (id) {
      ids.add(id);
    }
  }
  return ids;
}

/**
 * Resolves the target Drive folder from ScriptProperties or creates a dedicated archive folder.
 *
 * @param {GoogleAppsScript.Properties.Properties} props
 * @return {GoogleAppsScript.Drive.Folder}
 */
function resolveArchiveFolder_(props) {
  const folderId = (props.getProperty(GMAIL_EXTRACTOR_CONFIG.PROP_FOLDER_ID) || '').trim();
  if (folderId) {
    return DriveApp.getFolderById(folderId);
  }
  const newFolder = DriveApp.createFolder(GMAIL_EXTRACTOR_CONFIG.DEFAULT_FOLDER_NAME);
  props.setProperty(GMAIL_EXTRACTOR_CONFIG.PROP_FOLDER_ID, newFolder.getId());
  return newFolder;
}

/**
 * Builds a clean PDF filename prefixed with the Gmail message ID to avoid Drive collisions.
 *
 * @param {string} rawName
 * @param {string} messageId
 * @return {string}
 */
function sanitizeAttachmentName_(rawName, messageId) {
  const cleaned = String(rawName || 'invoice.pdf')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const withExt = cleaned.toLowerCase().endsWith('.pdf') ? cleaned : cleaned + '.pdf';
  return messageId.slice(0, 8) + '_' + withExt;
}
