/**
 * SheetAutomate Flow: Warehouse Packing Slip & Dispatch Manifest PDF
 * License: MIT
 * Telemetry: Zero telemetry, zero external tracking, 100% local execution in your Google account.
 *
 * @OnlyCurrentDoc
 */

var DISPATCH_CONFIG = {
  ORDERS_SHEET: 'Dispatch_Orders',
  MANIFEST_LOG_SHEET: 'Dispatch_Manifests',
  PROP_FOLDER_ID: 'DISPATCH_FOLDER_ID',
  DEFAULT_FOLDER_NAME: 'SheetAutomate Packing Slips & Manifests'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Generate Packing Slips & Manifest', 'generatePackingSlipsAndManifest')
    .addItem('Configure Drive Output Folder ID', 'configureDispatchFolder')
    .addItem('Initialize Dispatch_Orders Sheet', 'initializeDispatchSheets')
    .addToUi();
}

/**
 * Creates Dispatch_Orders and Dispatch_Manifests tabs with headers if missing.
 */
function initializeDispatchSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName(DISPATCH_CONFIG.ORDERS_SHEET);
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet(DISPATCH_CONFIG.ORDERS_SHEET);
  }
  if (ordersSheet.getLastRow() === 0) {
    ordersSheet.appendRow([
      'Order_ID',
      'Recipient_Name',
      'Shipping_Address',
      'Items_Summary',
      'Carrier_Tracking',
      'Status',
      'PDF_Link',
      'Manifest_ID'
    ]);
    ordersSheet.setFrozenRows(1);
  }

  ensureManifestLogSheet_(ss);
  SpreadsheetApp.getUi().alert('Sheets "' + DISPATCH_CONFIG.ORDERS_SHEET + '" and "' + DISPATCH_CONFIG.MANIFEST_LOG_SHEET + '" are ready.');
}

/**
 * Allows the user to bind a specific Google Drive folder ID for dispatch PDFs.
 */
function configureDispatchFolder() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var current = props.getProperty(DISPATCH_CONFIG.PROP_FOLDER_ID) || '';
  var prompt = ui.prompt(
    'Dispatch Drive Folder ID',
    'Paste a Drive Folder ID or leave blank to auto-create "' + DISPATCH_CONFIG.DEFAULT_FOLDER_NAME + '" (current: ' + (current || 'auto') + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (prompt.getSelectedButton() === ui.Button.OK) {
    props.setProperty(DISPATCH_CONFIG.PROP_FOLDER_ID, prompt.getResponseText().trim());
    ui.alert('Dispatch Drive folder setting saved.');
  }
}

/**
 * Batch-generates Packing Slip PDFs and one consolidated Dispatch Manifest PDF for READY_TO_SHIP rows.
 */
function generatePackingSlipsAndManifest() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another dispatch batch is running.');
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(DISPATCH_CONFIG.ORDERS_SHEET);
    if (!sheet) {
      throw new Error('Missing required tab: ' + DISPATCH_CONFIG.ORDERS_SHEET);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var tz = ss.getSpreadsheetTimeZone();
    var now = new Date();
    var manifestId = 'MAN-' + Utilities.formatDate(now, tz, 'yyyyMMdd-HHmm');
    var dispatchedAtIso = now.toISOString();
    var outputFolder = resolveDispatchFolder_();
    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    var processedBatch = [];

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var orderId = String(row[0] || '').trim();
      var recipientName = String(row[1] || '').trim();
      var shippingAddress = String(row[2] || '').trim();
      var itemsSummary = String(row[3] || '').trim();
      var trackingNumber = String(row[4] || '').trim();
      var status = String(row[5] || '').trim().toUpperCase();
      var existingPdfLink = String(row[6] || '').trim();

      if (!orderId && !recipientName) {
        continue;
      }

      // Idempotency guard: skip already-shipped orders or rows with an existing PDF.
      if (status === 'SHIPPED' || status === 'COMPLETED' || existingPdfLink) {
        continue;
      }

      if (status !== 'READY_TO_SHIP') {
        continue;
      }

      if (!orderId || !recipientName || !shippingAddress || !itemsSummary || !trackingNumber) {
        sheet.getRange(rowNumber, 6).setValue('NEEDS_CORRECTION');
        continue;
      }

      var slipHtml = buildPackingSlipHtml_({
        orderId: orderId,
        recipientName: recipientName,
        shippingAddress: shippingAddress,
        itemsSummary: itemsSummary,
        trackingNumber: trackingNumber,
        manifestId: manifestId,
        dispatchedAt: dispatchedAtIso
      });

      var slipPdfName = sanitizeFileName_('PackingSlip_' + orderId) + '.pdf';
      var slipBlob = Utilities.newBlob(slipHtml, MimeType.HTML).getAs(MimeType.PDF).setName(slipPdfName);
      var slipFile = outputFolder.createFile(slipBlob);

      sheet.getRange(rowNumber, 6).setValue('SHIPPED');
      sheet.getRange(rowNumber, 7).setValue(slipFile.getUrl());
      sheet.getRange(rowNumber, 8).setValue(manifestId);

      processedBatch.push({
        orderId: orderId,
        recipientName: recipientName,
        shippingAddress: shippingAddress,
        itemsSummary: itemsSummary,
        trackingNumber: trackingNumber,
        slipUrl: slipFile.getUrl()
      });
    }

    if (processedBatch.length > 0) {
      var manifestHtml = buildManifestHtml_(manifestId, dispatchedAtIso, processedBatch);
      var manifestBlob = Utilities.newBlob(manifestHtml, MimeType.HTML)
        .getAs(MimeType.PDF)
        .setName(sanitizeFileName_('DispatchManifest_' + manifestId) + '.pdf');
      var manifestFile = outputFolder.createFile(manifestBlob);

      var logSheet = ensureManifestLogSheet_(ss);
      logSheet.appendRow([
        manifestId,
        dispatchedAtIso,
        processedBatch.length,
        manifestFile.getUrl()
      ]);
    }

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function ensureManifestLogSheet_(ss) {
  var logSheet = ss.getSheetByName(DISPATCH_CONFIG.MANIFEST_LOG_SHEET);
  if (!logSheet) {
    logSheet = ss.insertSheet(DISPATCH_CONFIG.MANIFEST_LOG_SHEET);
  }
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(['Manifest_ID', 'Dispatched_At', 'Order_Count', 'Manifest_PDF_Link']);
    logSheet.setFrozenRows(1);
  }
  return logSheet;
}

function resolveDispatchFolder_() {
  var props = PropertiesService.getScriptProperties();
  var folderId = String(props.getProperty(DISPATCH_CONFIG.PROP_FOLDER_ID) || '').trim();
  if (folderId) {
    return DriveApp.getFolderById(folderId);
  }
  var existing = DriveApp.getFoldersByName(DISPATCH_CONFIG.DEFAULT_FOLDER_NAME);
  if (existing.hasNext()) {
    var folder = existing.next();
    props.setProperty(DISPATCH_CONFIG.PROP_FOLDER_ID, folder.getId());
    return folder;
  }
  var created = DriveApp.createFolder(DISPATCH_CONFIG.DEFAULT_FOLDER_NAME);
  props.setProperty(DISPATCH_CONFIG.PROP_FOLDER_ID, created.getId());
  return created;
}

function buildPackingSlipHtml_(order) {
  return [
    '<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:32px;">',
    '<div style="border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:20px;">',
    '<h1 style="margin:0;font-size:22px;">WAREHOUSE PACKING SLIP</h1>',
    '<p style="margin:4px 0 0;color:#475569;font-size:12px;">Order ID: ' + escapeHtml_(order.orderId) + ' | Manifest: ' + escapeHtml_(order.manifestId) + '</p>',
    '</div>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">',
    '<tr><td style="padding:6px 0;width:160px;font-weight:bold;">Ship To</td><td style="padding:6px 0;">' + escapeHtml_(order.recipientName) + '</td></tr>',
    '<tr><td style="padding:6px 0;font-weight:bold;">Destination</td><td style="padding:6px 0;">' + escapeHtml_(order.shippingAddress) + '</td></tr>',
    '<tr><td style="padding:6px 0;font-weight:bold;">Carrier Tracking</td><td style="padding:6px 0;font-family:monospace;">' + escapeHtml_(order.trackingNumber) + '</td></tr>',
    '<tr><td style="padding:6px 0;font-weight:bold;">Dispatched At</td><td style="padding:6px 0;">' + escapeHtml_(order.dispatchedAt) + '</td></tr>',
    '</table>',
    '<div style="border:1px solid #cbd5e1;background:#f8fafc;padding:14px;border-radius:6px;">',
    '<div style="font-weight:bold;margin-bottom:6px;">Packed Contents</div>',
    '<div style="white-space:pre-wrap;">' + escapeHtml_(order.itemsSummary) + '</div>',
    '</div>',
    '</body></html>'
  ].join('');
}

function buildManifestHtml_(manifestId, dispatchedAt, orders) {
  var rowsHtml = '';
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    rowsHtml += [
      '<tr>',
      '<td style="padding:8px;border-bottom:1px solid #cbd5e1;font-family:monospace;">' + escapeHtml_(o.orderId) + '</td>',
      '<td style="padding:8px;border-bottom:1px solid #cbd5e1;">' + escapeHtml_(o.recipientName) + '</td>',
      '<td style="padding:8px;border-bottom:1px solid #cbd5e1;font-family:monospace;">' + escapeHtml_(o.trackingNumber) + '</td>',
      '<td style="padding:8px;border-bottom:1px solid #cbd5e1;">' + escapeHtml_(o.itemsSummary) + '</td>',
      '</tr>'
    ].join('');
  }

  return [
    '<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:28px;">',
    '<h1 style="margin:0 0 6px;font-size:20px;">CARRIER DISPATCH MANIFEST</h1>',
    '<p style="margin:0 0 16px;color:#475569;font-size:12px;">Manifest ID: ' + escapeHtml_(manifestId) + ' | Generated: ' + escapeHtml_(dispatchedAt) + ' | Total Orders: ' + orders.length + '</p>',
    '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;">',
    '<thead><tr style="background:#f1f5f9;text-align:left;">',
    '<th style="padding:8px;border-bottom:1px solid #cbd5e1;">Order ID</th>',
    '<th style="padding:8px;border-bottom:1px solid #cbd5e1;">Recipient</th>',
    '<th style="padding:8px;border-bottom:1px solid #cbd5e1;">Tracking</th>',
    '<th style="padding:8px;border-bottom:1px solid #cbd5e1;">Items</th>',
    '</tr></thead>',
    '<tbody>' + rowsHtml + '</tbody>',
    '</table>',
    '</body></html>'
  ].join('');
}

function sanitizeFileName_(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').trim();
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
