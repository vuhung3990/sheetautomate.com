/**
 * SheetAutomate Flow: Low-Stock Threshold & Reorder Alert Dispatcher
 * License: MIT
 * Telemetry: Zero telemetry, zero hardcoded external URLs, 100% user-configured endpoints.
 *
 * @OnlyCurrentDoc
 */

var INVENTORY_CONFIG = {
  SHEET_NAME: 'Inventory',
  PROP_RECIPIENT: 'ALERT_RECIPIENT_EMAIL',
  PROP_WEBHOOK_URL: 'ALERT_WEBHOOK_URL',
  TRIGGER_HANDLER: 'checkInventoryLevels'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Check Stock Levels & Alert', 'checkInventoryLevels')
    .addItem('Configure Alert Recipient & Webhook', 'configureAlertSettings')
    .addItem('Install Daily Stock Check Trigger', 'installDailyStockTrigger')
    .addItem('Initialize Inventory Sheet', 'initializeInventorySheet')
    .addToUi();
}

/**
 * Creates the Inventory tab with standard headers if missing.
 */
function initializeInventorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(INVENTORY_CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(INVENTORY_CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'SKU',
      'Item_Name',
      'Stock_Qty',
      'Reorder_Point',
      'Target_Stock',
      'Suggested_Reorder',
      'Alert_Status',
      'Last_Alert_Date'
    ]);
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Sheet "' + INVENTORY_CONFIG.SHEET_NAME + '" is ready.');
}

/**
 * Prompts the spreadsheet owner to store recipient email and optional webhook URL in Script Properties.
 */
function configureAlertSettings() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();

  var currentEmail = props.getProperty(INVENTORY_CONFIG.PROP_RECIPIENT) || '';
  var emailPrompt = ui.prompt(
    'Alert Recipient Email',
    'Enter recipient email for low-stock digests (current: ' + (currentEmail || 'none') + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (emailPrompt.getSelectedButton() === ui.Button.OK) {
    var nextEmail = emailPrompt.getResponseText().trim();
    if (nextEmail && !isValidEmail_(nextEmail)) {
      ui.alert('Invalid email format. Recipient setting was not updated.');
      return;
    }
    props.setProperty(INVENTORY_CONFIG.PROP_RECIPIENT, nextEmail);
  }

  var currentWebhook = props.getProperty(INVENTORY_CONFIG.PROP_WEBHOOK_URL) || '';
  var hookPrompt = ui.prompt(
    'Optional Webhook URL (Slack / Chat / HTTPS)',
    'Leave blank to disable webhook POSTs (current: ' + (currentWebhook ? 'configured' : 'disabled') + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (hookPrompt.getSelectedButton() === ui.Button.OK) {
    var nextWebhook = hookPrompt.getResponseText().trim();
    if (nextWebhook && !isValidHttpsUrl_(nextWebhook)) {
      ui.alert('Webhook URL must use HTTPS. Setting was not updated.');
      return;
    }
    props.setProperty(INVENTORY_CONFIG.PROP_WEBHOOK_URL, nextWebhook);
  }

  ui.alert('Alert configuration saved to Script Properties.');
}

/**
 * Installs a daily morning stock check trigger without duplicates.
 */
function installDailyStockTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === INVENTORY_CONFIG.TRIGGER_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger(INVENTORY_CONFIG.TRIGGER_HANDLER)
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  SpreadsheetApp.getUi().alert('Daily inventory check trigger installed (8:00 AM).');
}

/**
 * Scans inventory rows, computes reorder quantities, and dispatches alerts for newly flagged items.
 */
function checkInventoryLevels() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another inventory check is running.');
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INVENTORY_CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing required tab: ' + INVENTORY_CONFIG.SHEET_NAME);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var todayStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    var lowStockItems = [];
    var rowsToMarkNotified = [];

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var sku = String(row[0] || '').trim();
      var itemName = String(row[1] || '').trim();
      var stockQty = Number(row[2]);
      var reorderPoint = Number(row[3]);
      var targetStock = Number(row[4]);
      var currentStatus = String(row[6] || '').trim().toUpperCase();
      var lastAlertDate = formatCellDate_(row[7], ss.getSpreadsheetTimeZone());

      if (!sku && !itemName) {
        continue;
      }

      if (!sku || !itemName || isNaN(stockQty) || isNaN(reorderPoint) || stockQty < 0 || reorderPoint < 0) {
        sheet.getRange(rowNumber, 7).setValue('NEEDS_CORRECTION');
        continue;
      }

      var effectiveTarget = (!isNaN(targetStock) && targetStock > reorderPoint) ? targetStock : Math.max(reorderPoint * 2, 1);

      if (stockQty <= reorderPoint) {
        var suggestedReorder = Math.max(1, Math.ceil(effectiveTarget - stockQty));
        sheet.getRange(rowNumber, 6).setValue(suggestedReorder);

        if (currentStatus === 'LOW_STOCK' && lastAlertDate === todayStr) {
          continue;
        }

        sheet.getRange(rowNumber, 7).setValue('LOW_STOCK');
        lowStockItems.push({
          rowNumber: rowNumber,
          sku: sku,
          itemName: itemName,
          stockQty: stockQty,
          reorderPoint: reorderPoint,
          targetStock: effectiveTarget,
          suggestedReorder: suggestedReorder
        });
        rowsToMarkNotified.push(rowNumber);
      } else {
        sheet.getRange(rowNumber, 6).setValue(0);
        sheet.getRange(rowNumber, 7).setValue('OK');
      }
    }

    if (lowStockItems.length === 0) {
      SpreadsheetApp.flush();
      return;
    }

    var props = PropertiesService.getScriptProperties();
    var recipientEmail = String(props.getProperty(INVENTORY_CONFIG.PROP_RECIPIENT) || '').trim();
    if (!recipientEmail) {
      recipientEmail = String(Session.getActiveUser().getEmail() || '').trim();
    }

    var dispatched = false;

    if (isValidEmail_(recipientEmail)) {
      var subject = '[LOW_STOCK] ' + lowStockItems.length + ' item(s) require reorder (' + todayStr + ')';
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        body: buildDigestText_(lowStockItems, todayStr),
        htmlBody: buildDigestHtml_(lowStockItems, todayStr)
      });
      dispatched = true;
    }

    var webhookUrl = String(props.getProperty(INVENTORY_CONFIG.PROP_WEBHOOK_URL) || '').trim();
    if (webhookUrl && isValidHttpsUrl_(webhookUrl)) {
      var payload = {
        event: 'LOW_STOCK_DIGEST',
        date: todayStr,
        spreadsheetName: ss.getName(),
        itemCount: lowStockItems.length,
        items: lowStockItems,
        text: buildWebhookSummary_(lowStockItems, todayStr)
      };

      var response = UrlFetchApp.fetch(webhookUrl, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      var code = response.getResponseCode();
      if (code >= 200 && code < 300) {
        dispatched = true;
      } else {
        Logger.log('Webhook returned HTTP ' + code);
      }
    }

    if (dispatched) {
      for (var j = 0; j < rowsToMarkNotified.length; j++) {
        sheet.getRange(rowsToMarkNotified[j], 8).setValue(todayStr);
      }
    }

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function buildDigestHtml_(items, dateStr) {
  var rowsHtml = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    rowsHtml += [
      '<tr>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;">' + escapeHtml_(item.sku) + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(item.itemName) + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#b91c1c;font-weight:bold;">' + item.stockQty + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + item.reorderPoint + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#047857;font-weight:bold;">' + item.suggestedReorder + '</td>',
      '</tr>'
    ].join('');
  }

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;">',
    '<h2 style="margin:0 0 8px;font-size:18px;">Low-Stock Reorder Digest (' + escapeHtml_(dateStr) + ')</h2>',
    '<p style="margin:0 0 16px;color:#475569;">The following ' + items.length + ' SKU(s) are at or below their reorder point:</p>',
    '<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px;">',
    '<thead><tr style="background:#f8fafc;text-align:left;">',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">SKU</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Item Name</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Stock</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Reorder Pt</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Suggested Reorder</th>',
    '</tr></thead>',
    '<tbody>' + rowsHtml + '</tbody>',
    '</table>',
    '</div>'
  ].join('');
}

function buildDigestText_(items, dateStr) {
  var lines = ['Low-Stock Reorder Digest (' + dateStr + ')', ''];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    lines.push(
      item.sku + ' | ' + item.itemName +
      ' | Stock: ' + item.stockQty +
      ' (Reorder Pt: ' + item.reorderPoint + ')' +
      ' | Suggested Reorder: ' + item.suggestedReorder
    );
  }
  return lines.join('\n');
}

function buildWebhookSummary_(items, dateStr) {
  var lines = ['Low-Stock Alert (' + dateStr + '): ' + items.length + ' item(s) below threshold'];
  for (var i = 0; i < items.length; i++) {
    lines.push('- ' + items[i].sku + ' (' + items[i].itemName + '): ' + items[i].stockQty + ' left, reorder ' + items[i].suggestedReorder);
  }
  return lines.join('\n');
}

function formatCellDate_(val, tz) {
  if (val instanceof Date && !isNaN(val.getTime())) {
    return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
  }
  return String(val || '').trim();
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHttpsUrl_(url) {
  return /^https:\/\/[^\s]+$/i.test(url);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
