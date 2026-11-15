/**
 * @OnlyCurrentDoc
 *
 * SheetAutomate Flow: B2B Client Invoice PDF Generator
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const INVOICE_CONFIG = {
  TAB_NAME: 'Invoices',
  PROP_TEMPLATE_ID: 'SA_INVOICE_TEMPLATE_DOC_ID',
  PROP_FOLDER_ID: 'SA_INVOICE_OUTPUT_FOLDER_ID',
  LOCK_TIMEOUT_MS: 10000,
  REQUIRED_HEADERS: [
    'Invoice_ID',
    'Client_Name',
    'Client_Email',
    'Service_Description',
    'Amount_USD',
    'Status',
    'PDF_Link',
    'Audit_Status'
  ]
};

/**
 * Adds the custom SheetAutomate menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Generate Approved Invoice PDFs', 'generateApprovedInvoicePdfs')
    .addItem('Configure Template & Folder IDs', 'configureInvoiceSettings')
    .addItem('Initialize Invoices Sheet', 'initializeInvoicesSheet')
    .addToUi();
}

/**
 * Prompts the user to save the Google Docs template ID and output Drive folder ID.
 */
function configureInvoiceSettings() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const currentDocId = props.getProperty(INVOICE_CONFIG.PROP_TEMPLATE_ID) || '';
  const docResp = ui.prompt(
    'Step 1 of 2: Google Docs Template ID',
    'Paste the Google Docs Template ID (from the Doc URL between /d/ and /edit):' +
      (currentDocId ? '\nCurrent: ' + currentDocId : ''),
    ui.ButtonSet.OK_CANCEL
  );
  if (docResp.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const docId = docResp.getResponseText().trim();
  if (!docId) {
    ui.alert('Template Doc ID cannot be empty.');
    return;
  }

  const currentFolderId = props.getProperty(INVOICE_CONFIG.PROP_FOLDER_ID) || '';
  const folderResp = ui.prompt(
    'Step 2 of 2: Output Drive Folder ID',
    'Paste the Google Drive Folder ID where exported PDFs should be saved:' +
      (currentFolderId ? '\nCurrent: ' + currentFolderId : ''),
    ui.ButtonSet.OK_CANCEL
  );
  if (folderResp.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const folderId = folderResp.getResponseText().trim();
  if (!folderId) {
    ui.alert('Output Folder ID cannot be empty.');
    return;
  }

  props.setProperty(INVOICE_CONFIG.PROP_TEMPLATE_ID, docId);
  props.setProperty(INVOICE_CONFIG.PROP_FOLDER_ID, folderId);
  ui.alert('Configuration saved. You can now run "Generate Approved Invoice PDFs".');
}

/**
 * Creates or verifies the Invoices tab and header row.
 */
function initializeInvoicesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(INVOICE_CONFIG.TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(INVOICE_CONFIG.TAB_NAME);
  }
  const headerRange = sheet.getRange(1, 1, 1, INVOICE_CONFIG.REQUIRED_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(function (cell) {
    return String(cell).trim() !== '';
  });
  if (!hasHeaders) {
    headerRange.setValues([INVOICE_CONFIG.REQUIRED_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Invoices sheet is ready.');
}

/**
 * Merges Approved rows into the configured Docs template, exports PDFs to Drive,
 * and records the PDF link and COMPLETED audit status in the sheet.
 */
function generateApprovedInvoicePdfs() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(INVOICE_CONFIG.LOCK_TIMEOUT_MS)) {
    SpreadsheetApp.getUi().alert('Another invoice batch is currently running. Please try again in a moment.');
    return;
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const templateDocId = (props.getProperty(INVOICE_CONFIG.PROP_TEMPLATE_ID) || '').trim();
    const folderId = (props.getProperty(INVOICE_CONFIG.PROP_FOLDER_ID) || '').trim();

    if (!templateDocId || !folderId) {
      SpreadsheetApp.getUi().alert('Please run SheetAutomate > Configure Template & Folder IDs first.');
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.TAB_NAME);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Sheet tab "' + INVOICE_CONFIG.TAB_NAME + '" was not found.');
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('No invoice rows found to process.');
      return;
    }

    const headers = data[0].map(function (h) {
      return String(h).trim();
    });
    const colIndex = mapHeaderIndices_(headers, INVOICE_CONFIG.REQUIRED_HEADERS);

    const templateFile = DriveApp.getFileById(templateDocId);
    const outputFolder = DriveApp.getFolderById(folderId);
    const issueDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNum = r + 1;

      const invoiceId = String(row[colIndex.Invoice_ID] || '').trim();
      const clientName = String(row[colIndex.Client_Name] || '').trim();
      const clientEmail = String(row[colIndex.Client_Email] || '').trim();
      const description = String(row[colIndex.Service_Description] || '').trim();
      const rawAmount = row[colIndex.Amount_USD];
      const status = String(row[colIndex.Status] || '').trim();
      const existingPdfLink = String(row[colIndex.PDF_Link] || '').trim();
      const auditStatus = String(row[colIndex.Audit_Status] || '').trim();

      // Idempotency guard: never re-generate an already completed invoice.
      if (auditStatus === 'COMPLETED' || existingPdfLink !== '') {
        skippedCount++;
        continue;
      }

      if (status !== 'Approved') {
        continue;
      }

      const numericAmount = parseFloat(String(rawAmount).replace(/[^0-9.-]/g, ''));
      if (!invoiceId || !clientName || !description || isNaN(numericAmount)) {
        sheet
          .getRange(rowNum, colIndex.Audit_Status + 1)
          .setValue('NEEDS_CORRECTION: Missing Invoice_ID, Client_Name, Description, or numeric Amount_USD');
        errorCount++;
        continue;
      }

      const formattedAmount = '$' + numericAmount.toFixed(2);
      const safeName = sanitizeFilename_(invoiceId + '_' + clientName);
      const tempDocFile = templateFile.makeCopy(safeName + '_TMP', outputFolder);

      try {
        const doc = DocumentApp.openById(tempDocFile.getId());
        const body = doc.getBody();
        body.replaceText('\\{\\{Invoice_ID\\}\\}', escapeReplacement_(invoiceId));
        body.replaceText('\\{\\{Client_Name\\}\\}', escapeReplacement_(clientName));
        body.replaceText('\\{\\{Client_Email\\}\\}', escapeReplacement_(clientEmail));
        body.replaceText('\\{\\{Service_Description\\}\\}', escapeReplacement_(description));
        body.replaceText('\\{\\{Amount_USD\\}\\}', escapeReplacement_(formattedAmount));
        body.replaceText('\\{\\{Issue_Date\\}\\}', escapeReplacement_(issueDate));
        doc.saveAndClose();

        const pdfBlob = tempDocFile.getAs(MimeType.PDF);
        pdfBlob.setName(safeName + '.pdf');
        const pdfFile = outputFolder.createFile(pdfBlob);

        sheet.getRange(rowNum, colIndex.PDF_Link + 1).setValue(pdfFile.getUrl());
        sheet.getRange(rowNum, colIndex.Audit_Status + 1).setValue('COMPLETED');
        processedCount++;
      } finally {
        tempDocFile.setTrashed(true);
      }
    }

    SpreadsheetApp.getUi().alert(
      'Invoice PDF Run Complete\n\nGenerated: ' +
        processedCount +
        '\nSkipped (Already Completed): ' +
        skippedCount +
        '\nNeeds Correction: ' +
        errorCount
    );
  } finally {
    lock.releaseLock();
  }
}

/**
 * Maps required header names to zero-based column indices.
 *
 * @param {string[]} headers
 * @param {string[]} required
 * @return {Object.<string, number>}
 */
function mapHeaderIndices_(headers, required) {
  const map = {};
  for (let i = 0; i < required.length; i++) {
    const idx = headers.indexOf(required[i]);
    if (idx === -1) {
      throw new Error('Missing required column header: ' + required[i]);
    }
    map[required[i]] = idx;
  }
  return map;
}

/**
 * Escapes '$' in replacement strings for DocumentApp Body.replaceText().
 *
 * @param {*} val
 * @return {string}
 */
function escapeReplacement_(val) {
  return String(val == null ? '' : val).replace(/\$/g, '\\$');
}

/**
 * Replaces unsafe filename characters with underscores.
 *
 * @param {string} name
 * @return {string}
 */
function sanitizeFilename_(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
}
