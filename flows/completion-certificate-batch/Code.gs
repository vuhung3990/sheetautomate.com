/**
 * @OnlyCurrentDoc
 *
 * SheetAutomate Flow: Training & Course Certificate Batch Issuer
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const CERT_CONFIG = {
  TAB_NAME: 'Certificates',
  PROP_TEMPLATE_ID: 'SA_CERT_TEMPLATE_DOC_ID',
  PROP_FOLDER_ID: 'SA_CERT_OUTPUT_FOLDER_ID',
  PROP_PASSING_SCORE: 'SA_CERT_PASSING_SCORE',
  DEFAULT_PASSING_SCORE: 80,
  LOCK_TIMEOUT_MS: 10000,
  REQUIRED_HEADERS: [
    'Certificate_ID',
    'Trainee_Name',
    'Course_Title',
    'Score_Pct',
    'Completion_Date',
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
    .addItem('Issue Approved Certificate PDFs', 'issueApprovedCertificates')
    .addItem('Configure Template, Folder & Passing Score', 'configureCertificateSettings')
    .addItem('Initialize Certificates Sheet', 'initializeCertificatesSheet')
    .addToUi();
}

/**
 * Prompts the user for the certificate Docs template ID, Drive folder ID, and passing score.
 */
function configureCertificateSettings() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const currentDocId = props.getProperty(CERT_CONFIG.PROP_TEMPLATE_ID) || '';
  const docResp = ui.prompt(
    'Step 1 of 3: Certificate Docs Template ID',
    'Paste the Google Docs Certificate Template ID:' + (currentDocId ? '\nCurrent: ' + currentDocId : ''),
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

  const currentFolderId = props.getProperty(CERT_CONFIG.PROP_FOLDER_ID) || '';
  const folderResp = ui.prompt(
    'Step 2 of 3: Output Drive Folder ID',
    'Paste the Drive Folder ID for exported certificate PDFs:' +
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

  const currentScore = props.getProperty(CERT_CONFIG.PROP_PASSING_SCORE) || String(CERT_CONFIG.DEFAULT_PASSING_SCORE);
  const scoreResp = ui.prompt(
    'Step 3 of 3: Minimum Passing Score (%)',
    'Enter minimum passing percentage (0-100):\nCurrent: ' + currentScore,
    ui.ButtonSet.OK_CANCEL
  );
  if (scoreResp.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const parsedScore = parseFloat(scoreResp.getResponseText().trim());
  if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
    ui.alert('Passing score must be a number between 0 and 100.');
    return;
  }

  props.setProperty(CERT_CONFIG.PROP_TEMPLATE_ID, docId);
  props.setProperty(CERT_CONFIG.PROP_FOLDER_ID, folderId);
  props.setProperty(CERT_CONFIG.PROP_PASSING_SCORE, String(parsedScore));
  ui.alert('Certificate batch configuration saved.');
}

/**
 * Creates or verifies the Certificates sheet tab and header row.
 */
function initializeCertificatesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CERT_CONFIG.TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CERT_CONFIG.TAB_NAME);
  }
  const headerRange = sheet.getRange(1, 1, 1, CERT_CONFIG.REQUIRED_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(function (cell) {
    return String(cell).trim() !== '';
  });
  if (!hasHeaders) {
    headerRange.setValues([CERT_CONFIG.REQUIRED_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Certificates sheet is ready.');
}

/**
 * Batch-generates certificate PDFs for Approved rows that meet the passing score
 * and do not already have a generated PDF link.
 */
function issueApprovedCertificates() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(CERT_CONFIG.LOCK_TIMEOUT_MS)) {
    SpreadsheetApp.getUi().alert('Another certificate batch is already running. Please try again in a moment.');
    return;
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const templateDocId = (props.getProperty(CERT_CONFIG.PROP_TEMPLATE_ID) || '').trim();
    const folderId = (props.getProperty(CERT_CONFIG.PROP_FOLDER_ID) || '').trim();
    const passingScoreRaw = props.getProperty(CERT_CONFIG.PROP_PASSING_SCORE);
    const passingScore = passingScoreRaw ? parseFloat(passingScoreRaw) : CERT_CONFIG.DEFAULT_PASSING_SCORE;

    if (!templateDocId || !folderId) {
      SpreadsheetApp.getUi().alert('Please run SheetAutomate > Configure Template, Folder & Passing Score first.');
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CERT_CONFIG.TAB_NAME);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Sheet tab "' + CERT_CONFIG.TAB_NAME + '" was not found.');
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('No trainee rows found to process.');
      return;
    }

    const headers = data[0].map(function (h) {
      return String(h).trim();
    });
    const colIndex = mapHeaderIndices_(headers, CERT_CONFIG.REQUIRED_HEADERS);

    const templateFile = DriveApp.getFileById(templateDocId);
    const outputFolder = DriveApp.getFolderById(folderId);
    const timeZone = Session.getScriptTimeZone();

    let issuedCount = 0;
    let skippedDuplicate = 0;
    let skippedBelowScore = 0;
    let errorCount = 0;

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNum = r + 1;

      const certId = String(row[colIndex.Certificate_ID] || '').trim();
      const traineeName = String(row[colIndex.Trainee_Name] || '').trim();
      const courseTitle = String(row[colIndex.Course_Title] || '').trim();
      const rawScore = row[colIndex.Score_Pct];
      const completionDate = formatSheetDate_(row[colIndex.Completion_Date], timeZone);
      const status = String(row[colIndex.Status] || '').trim();
      const existingPdfLink = String(row[colIndex.PDF_Link] || '').trim();
      const auditStatus = String(row[colIndex.Audit_Status] || '').trim();

      // Idempotency guard: never reissue a certificate that already has a link or COMPLETED mark.
      if (auditStatus === 'COMPLETED' || existingPdfLink !== '') {
        skippedDuplicate++;
        continue;
      }

      if (status !== 'Approved') {
        continue;
      }

      const numericScore = parseFloat(String(rawScore).replace(/[^0-9.-]/g, ''));
      if (!certId || !traineeName || !courseTitle || !completionDate || isNaN(numericScore)) {
        sheet
          .getRange(rowNum, colIndex.Audit_Status + 1)
          .setValue('NEEDS_CORRECTION: Missing required certificate fields or invalid Score_Pct');
        errorCount++;
        continue;
      }

      if (numericScore < passingScore) {
        sheet
          .getRange(rowNum, colIndex.Audit_Status + 1)
          .setValue('SKIPPED: Score ' + numericScore + '% below passing threshold (' + passingScore + '%)');
        skippedBelowScore++;
        continue;
      }

      const safeName = sanitizeFilename_(certId + '_' + traineeName);
      const tempDocFile = templateFile.makeCopy(safeName + '_TMP', outputFolder);

      try {
        const doc = DocumentApp.openById(tempDocFile.getId());
        const body = doc.getBody();
        body.replaceText('\\{\\{Certificate_ID\\}\\}', escapeReplacement_(certId));
        body.replaceText('\\{\\{Trainee_Name\\}\\}', escapeReplacement_(traineeName));
        body.replaceText('\\{\\{Course_Title\\}\\}', escapeReplacement_(courseTitle));
        body.replaceText('\\{\\{Score_Pct\\}\\}', escapeReplacement_(numericScore + '%'));
        body.replaceText('\\{\\{Completion_Date\\}\\}', escapeReplacement_(completionDate));
        doc.saveAndClose();

        const pdfBlob = tempDocFile.getAs(MimeType.PDF);
        pdfBlob.setName(safeName + '.pdf');
        const pdfFile = outputFolder.createFile(pdfBlob);

        sheet.getRange(rowNum, colIndex.PDF_Link + 1).setValue(pdfFile.getUrl());
        sheet.getRange(rowNum, colIndex.Audit_Status + 1).setValue('COMPLETED');
        issuedCount++;
      } finally {
        tempDocFile.setTrashed(true);
      }
    }

    SpreadsheetApp.getUi().alert(
      'Certificate Batch Complete\n\nIssued: ' +
        issuedCount +
        '\nSkipped (Already Issued): ' +
        skippedDuplicate +
        '\nSkipped (Below Passing Score): ' +
        skippedBelowScore +
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
