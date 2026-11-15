/**
 * @OnlyCurrentDoc
 *
 * SheetAutomate Flow: Field Service & Inspection Work Order PDF
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const WORK_ORDER_CONFIG = {
  TAB_NAME: 'Work_Orders',
  PROP_TEMPLATE_ID: 'SA_WO_TEMPLATE_DOC_ID',
  PROP_FOLDER_ID: 'SA_WO_OUTPUT_FOLDER_ID',
  LOCK_TIMEOUT_MS: 10000,
  REQUIRED_HEADERS: [
    'Work_Order_ID',
    'Site_Name',
    'Technician_Name',
    'Scheduled_Date',
    'Scope_Of_Work',
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
    .addItem('Generate Scheduled Work Order PDFs', 'generateScheduledWorkOrderPdfs')
    .addItem('Configure Template & Output Folder', 'configureWorkOrderSettings')
    .addItem('Initialize Work_Orders Sheet', 'initializeWorkOrdersSheet')
    .addToUi();
}

/**
 * Prompts the user for the Google Docs work order template ID and Drive folder ID.
 */
function configureWorkOrderSettings() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const currentDocId = props.getProperty(WORK_ORDER_CONFIG.PROP_TEMPLATE_ID) || '';
  const docResp = ui.prompt(
    'Step 1 of 2: Work Order Docs Template ID',
    'Paste the Google Docs Template ID:' + (currentDocId ? '\nCurrent: ' + currentDocId : ''),
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

  const currentFolderId = props.getProperty(WORK_ORDER_CONFIG.PROP_FOLDER_ID) || '';
  const folderResp = ui.prompt(
    'Step 2 of 2: Output Drive Folder ID',
    'Paste the Drive Folder ID where work order PDFs should be stored:' +
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

  props.setProperty(WORK_ORDER_CONFIG.PROP_TEMPLATE_ID, docId);
  props.setProperty(WORK_ORDER_CONFIG.PROP_FOLDER_ID, folderId);
  ui.alert('Work Order configuration saved.');
}

/**
 * Creates or verifies the Work_Orders sheet tab and header row.
 */
function initializeWorkOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(WORK_ORDER_CONFIG.TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WORK_ORDER_CONFIG.TAB_NAME);
  }
  const headerRange = sheet.getRange(1, 1, 1, WORK_ORDER_CONFIG.REQUIRED_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(function (cell) {
    return String(cell).trim() !== '';
  });
  if (!hasHeaders) {
    headerRange.setValues([WORK_ORDER_CONFIG.REQUIRED_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Work_Orders sheet is ready.');
}

/**
 * Generates PDF work orders for all rows marked Scheduled that have not yet been completed.
 */
function generateScheduledWorkOrderPdfs() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(WORK_ORDER_CONFIG.LOCK_TIMEOUT_MS)) {
    SpreadsheetApp.getUi().alert('Another work order run is already in progress. Please try again shortly.');
    return;
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const templateDocId = (props.getProperty(WORK_ORDER_CONFIG.PROP_TEMPLATE_ID) || '').trim();
    const folderId = (props.getProperty(WORK_ORDER_CONFIG.PROP_FOLDER_ID) || '').trim();

    if (!templateDocId || !folderId) {
      SpreadsheetApp.getUi().alert('Please run SheetAutomate > Configure Template & Output Folder first.');
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(WORK_ORDER_CONFIG.TAB_NAME);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Sheet tab "' + WORK_ORDER_CONFIG.TAB_NAME + '" was not found.');
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('No work order rows found to process.');
      return;
    }

    const headers = data[0].map(function (h) {
      return String(h).trim();
    });
    const colIndex = mapHeaderIndices_(headers, WORK_ORDER_CONFIG.REQUIRED_HEADERS);

    const templateFile = DriveApp.getFileById(templateDocId);
    const outputFolder = DriveApp.getFolderById(folderId);
    const timeZone = Session.getScriptTimeZone();
    const generatedAt = Utilities.formatDate(new Date(), timeZone, 'yyyy-MM-dd HH:mm');

    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNum = r + 1;

      const workOrderId = String(row[colIndex.Work_Order_ID] || '').trim();
      const siteName = String(row[colIndex.Site_Name] || '').trim();
      const techName = String(row[colIndex.Technician_Name] || '').trim();
      const scheduledDate = formatSheetDate_(row[colIndex.Scheduled_Date], timeZone);
      const scopeOfWork = String(row[colIndex.Scope_Of_Work] || '').trim();
      const status = String(row[colIndex.Status] || '').trim();
      const existingPdfLink = String(row[colIndex.PDF_Link] || '').trim();
      const auditStatus = String(row[colIndex.Audit_Status] || '').trim();

      // Idempotency guard: skip rows already processed.
      if (auditStatus === 'COMPLETED' || existingPdfLink !== '') {
        skippedCount++;
        continue;
      }

      if (status !== 'Scheduled') {
        continue;
      }

      if (!workOrderId || !siteName || !techName || !scheduledDate || !scopeOfWork) {
        sheet
          .getRange(rowNum, colIndex.Audit_Status + 1)
          .setValue('NEEDS_CORRECTION: Missing Work_Order_ID, Site_Name, Technician_Name, Scheduled_Date, or Scope_Of_Work');
        errorCount++;
        continue;
      }

      const safeName = sanitizeFilename_(workOrderId + '_' + siteName);
      const tempDocFile = templateFile.makeCopy(safeName + '_TMP', outputFolder);

      try {
        const doc = DocumentApp.openById(tempDocFile.getId());
        const body = doc.getBody();
        body.replaceText('\\{\\{Work_Order_ID\\}\\}', escapeReplacement_(workOrderId));
        body.replaceText('\\{\\{Site_Name\\}\\}', escapeReplacement_(siteName));
        body.replaceText('\\{\\{Technician_Name\\}\\}', escapeReplacement_(techName));
        body.replaceText('\\{\\{Scheduled_Date\\}\\}', escapeReplacement_(scheduledDate));
        body.replaceText('\\{\\{Scope_Of_Work\\}\\}', escapeReplacement_(scopeOfWork));
        body.replaceText('\\{\\{Generated_At\\}\\}', escapeReplacement_(generatedAt));
        doc.saveAndClose();

        const pdfBlob = tempDocFile.getAs(MimeType.PDF);
        pdfBlob.setName(safeName + '.pdf');
        const pdfFile = outputFolder.createFile(pdfBlob);

        sheet.getRange(rowNum, colIndex.Status + 1).setValue('Dispatched');
        sheet.getRange(rowNum, colIndex.PDF_Link + 1).setValue(pdfFile.getUrl());
        sheet.getRange(rowNum, colIndex.Audit_Status + 1).setValue('COMPLETED');
        generatedCount++;
      } finally {
        tempDocFile.setTrashed(true);
      }
    }

    SpreadsheetApp.getUi().alert(
      'Work Order PDF Run Complete\n\nGenerated: ' +
        generatedCount +
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
 * Formats a Google Sheets cell value that may be a Date object or string.
 *
 * @param {Date|string} value
 * @param {string} timeZone
 * @return {string}
 */
function formatSheetDate_(value, timeZone) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, timeZone, 'yyyy-MM-dd');
  }
  return String(value || '').trim();
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
