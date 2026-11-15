/**
 * @OnlyCurrentDoc
 *
 * SheetAutomate Flow: Dynamic Multi-Row Sales Quote & Proposal PDF
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const QUOTE_CONFIG = {
  TAB_NAME: 'Quote_Line_Items',
  PROP_TEMPLATE_ID: 'SA_QUOTE_TEMPLATE_DOC_ID',
  PROP_FOLDER_ID: 'SA_QUOTE_OUTPUT_FOLDER_ID',
  LOCK_TIMEOUT_MS: 10000,
  REQUIRED_HEADERS: [
    'Quote_ID',
    'Client_Name',
    'Item_Description',
    'Quantity',
    'Unit_Price_USD',
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
    .addItem('Generate Multi-Item Quote PDFs', 'generateMultiItemQuotePdfs')
    .addItem('Configure Quote Template & Folder', 'configureQuoteSettings')
    .addItem('Initialize Quote_Line_Items Sheet', 'initializeQuoteSheet')
    .addToUi();
}

/**
 * Prompts the user to save the Google Docs quote template ID and Drive folder ID.
 */
function configureQuoteSettings() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const currentDocId = props.getProperty(QUOTE_CONFIG.PROP_TEMPLATE_ID) || '';
  const docResp = ui.prompt(
    'Step 1 of 2: Quote Docs Template ID',
    'Paste the Google Docs Quote Template ID:' + (currentDocId ? '\nCurrent: ' + currentDocId : ''),
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

  const currentFolderId = props.getProperty(QUOTE_CONFIG.PROP_FOLDER_ID) || '';
  const folderResp = ui.prompt(
    'Step 2 of 2: Output Drive Folder ID',
    'Paste the Drive Folder ID where quote PDFs should be saved:' +
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

  props.setProperty(QUOTE_CONFIG.PROP_TEMPLATE_ID, docId);
  props.setProperty(QUOTE_CONFIG.PROP_FOLDER_ID, folderId);
  ui.alert('Sales quote configuration saved.');
}

/**
 * Creates or verifies the Quote_Line_Items sheet tab and header row.
 */
function initializeQuoteSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(QUOTE_CONFIG.TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(QUOTE_CONFIG.TAB_NAME);
  }
  const headerRange = sheet.getRange(1, 1, 1, QUOTE_CONFIG.REQUIRED_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(function (cell) {
    return String(cell).trim() !== '';
  });
  if (!hasHeaders) {
    headerRange.setValues([QUOTE_CONFIG.REQUIRED_HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Quote_Line_Items sheet is ready.');
}

/**
 * Groups line items by Quote_ID, builds a formatted table in a Google Docs template,
 * exports each quote as a PDF to Drive, and writes the link back to all matching rows.
 */
function generateMultiItemQuotePdfs() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(QUOTE_CONFIG.LOCK_TIMEOUT_MS)) {
    SpreadsheetApp.getUi().alert('Another quote generation batch is running. Please try again shortly.');
    return;
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const templateDocId = (props.getProperty(QUOTE_CONFIG.PROP_TEMPLATE_ID) || '').trim();
    const folderId = (props.getProperty(QUOTE_CONFIG.PROP_FOLDER_ID) || '').trim();

    if (!templateDocId || !folderId) {
      SpreadsheetApp.getUi().alert('Please run SheetAutomate > Configure Quote Template & Folder first.');
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(QUOTE_CONFIG.TAB_NAME);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Sheet tab "' + QUOTE_CONFIG.TAB_NAME + '" was not found.');
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('No quote line-item rows found.');
      return;
    }

    const headers = data[0].map(function (h) {
      return String(h).trim();
    });
    const colIndex = mapHeaderIndices_(headers, QUOTE_CONFIG.REQUIRED_HEADERS);

    // Group rows by Quote_ID while preserving sheet order.
    const groups = {};
    const groupOrder = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNum = r + 1;
      const quoteId = String(row[colIndex.Quote_ID] || '').trim();

      if (!quoteId) {
        sheet.getRange(rowNum, colIndex.Audit_Status + 1).setValue('NEEDS_CORRECTION: Missing Quote_ID');
        continue;
      }

      if (!groups[quoteId]) {
        groups[quoteId] = [];
        groupOrder.push(quoteId);
      }
      groups[quoteId].push({ rowNum: rowNum, row: row });
    }

    const templateFile = DriveApp.getFileById(templateDocId);
    const outputFolder = DriveApp.getFolderById(folderId);
    const quoteDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    let generatedQuotes = 0;
    let skippedQuotes = 0;
    let errorQuotes = 0;

    for (let g = 0; g < groupOrder.length; g++) {
      const quoteId = groupOrder[g];
      const entries = groups[quoteId];

      // Idempotency guard: skip quote if all its rows are already completed or linked.
      const allCompleted = entries.every(function (entry) {
        const link = String(entry.row[colIndex.PDF_Link] || '').trim();
        const audit = String(entry.row[colIndex.Audit_Status] || '').trim();
        return audit === 'COMPLETED' || link !== '';
      });
      if (allCompleted) {
        skippedQuotes++;
        continue;
      }

      // Only generate when every line item in the Quote_ID group is Approved.
      const allApproved = entries.every(function (entry) {
        return String(entry.row[colIndex.Status] || '').trim() === 'Approved';
      });
      if (!allApproved) {
        continue;
      }

      let clientName = '';
      let grandTotal = 0;
      let hasValidationError = false;
      const tableData = [['Item Description', 'Qty', 'Unit Price', 'Line Total']];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const r = entry.row;
        const rowClient = String(r[colIndex.Client_Name] || '').trim();
        const itemDesc = String(r[colIndex.Item_Description] || '').trim();
        const qty = parseFloat(String(r[colIndex.Quantity]).replace(/[^0-9.-]/g, ''));
        const unitPrice = parseFloat(String(r[colIndex.Unit_Price_USD]).replace(/[^0-9.-]/g, ''));

        if (!rowClient || !itemDesc || isNaN(qty) || qty <= 0 || isNaN(unitPrice) || unitPrice < 0) {
          sheet
            .getRange(entry.rowNum, colIndex.Audit_Status + 1)
            .setValue('NEEDS_CORRECTION: Invalid Client_Name, Item_Description, Quantity, or Unit_Price_USD');
          hasValidationError = true;
          continue;
        }

        if (!clientName) {
          clientName = rowClient;
        }
        const lineTotal = qty * unitPrice;
        grandTotal += lineTotal;

        tableData.push([
          itemDesc,
          String(qty),
          '$' + unitPrice.toFixed(2),
          '$' + lineTotal.toFixed(2)
        ]);
      }

      if (hasValidationError || tableData.length < 2) {
        errorQuotes++;
        continue;
      }

      const safeName = sanitizeFilename_(quoteId + '_' + clientName);
      const tempDocFile = templateFile.makeCopy(safeName + '_TMP', outputFolder);

      try {
        const doc = DocumentApp.openById(tempDocFile.getId());
        const body = doc.getBody();
        body.replaceText('\\{\\{Quote_ID\\}\\}', escapeReplacement_(quoteId));
        body.replaceText('\\{\\{Client_Name\\}\\}', escapeReplacement_(clientName));
        body.replaceText('\\{\\{Quote_Date\\}\\}', escapeReplacement_(quoteDate));
        body.replaceText('\\{\\{Grand_Total\\}\\}', escapeReplacement_('$' + grandTotal.toFixed(2)));

        insertFormattedLineItemsTable_(body, tableData);
        doc.saveAndClose();

        const pdfBlob = tempDocFile.getAs(MimeType.PDF);
        pdfBlob.setName(safeName + '.pdf');
        const pdfFile = outputFolder.createFile(pdfBlob);
        const pdfUrl = pdfFile.getUrl();

        for (let k = 0; k < entries.length; k++) {
          sheet.getRange(entries[k].rowNum, colIndex.PDF_Link + 1).setValue(pdfUrl);
          sheet.getRange(entries[k].rowNum, colIndex.Audit_Status + 1).setValue('COMPLETED');
        }
        generatedQuotes++;
      } finally {
        tempDocFile.setTrashed(true);
      }
    }

    SpreadsheetApp.getUi().alert(
      'Multi-Item Quote Run Complete\n\nQuotes Generated: ' +
        generatedQuotes +
        '\nSkipped (Already Completed): ' +
        skippedQuotes +
        '\nQuotes Needing Correction: ' +
        errorQuotes
    );
  } finally {
    lock.releaseLock();
  }
}

/**
 * Replaces {{LINE_ITEMS_TABLE}} with a styled multi-row table, or appends it to the document body.
 *
 * @param {GoogleAppsScript.Document.Body} body
 * @param {string[][]} tableData
 */
function insertFormattedLineItemsTable_(body, tableData) {
  const found = body.findText('\\{\\{LINE_ITEMS_TABLE\\}\\}');
  let table;

  if (found) {
    const textElement = found.getElement();
    const paragraph = textElement.getParent();
    const insertIndex = body.getChildIndex(paragraph);
    table = body.insertTable(insertIndex, tableData);
    paragraph.removeFromParent();
  } else {
    table = body.appendTable(tableData);
  }

  table.setBorderColor('#CBD5E1');
  table.setBorderWidth(1);

  const headerRow = table.getRow(0);
  for (let c = 0; c < headerRow.getNumCells(); c++) {
    const cell = headerRow.getCell(c);
    cell.setBackgroundColor('#0F172A');
    const text = cell.editAsText();
    text.setForegroundColor('#FFFFFF');
    text.setBold(true);
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
