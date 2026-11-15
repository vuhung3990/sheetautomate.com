/**
 * @OnlyCurrentDoc
 *
 * SheetAutomate Flow: Monthly Attendance & OT Sheet Provisioner + Auto-Lock
 * License: MIT
 * Privacy: Zero external telemetry or third-party endpoints. Runs strictly within your Google Workspace account.
 */

const OT_LOCKER_CONFIG = {
  TEMPLATE_TAB: '_Template',
  AUDIT_TAB: 'Audit_Log',
  TAB_PREFIX: 'OT_',
  EDITABLE_RANGE_A1: 'D2:E100',
  LOCK_DESCRIPTION_PREFIX: 'SheetAutomate Monthly Lock',
  LOCK_TIMEOUT_MS: 10000,
  TEMPLATE_HEADERS: [
    'Employee_ID',
    'Employee_Name',
    'Department',
    'Regular_Hours',
    'OT_Hours',
    'Manager_Approval',
    'Audit_Status'
  ],
  AUDIT_HEADERS: [
    'Timestamp_UTC',
    'Action',
    'Target_Tab',
    'Previous_Tab_Locked',
    'Editable_Range_Preserved',
    'Audit_Status'
  ]
};

/**
 * Adds the custom SheetAutomate menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Provision Next Month & Lock Previous', 'provisionNextMonthInteractive')
    .addItem('Initialize _Template & Audit_Log Tabs', 'initializeOtTabs')
    .addItem('Install Monthly 1st-of-Month Trigger', 'installMonthlyOtTrigger')
    .addToUi();
}

/**
 * Creates _Template and Audit_Log tabs if they do not exist.
 */
function initializeOtTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureTabWithHeaders_(ss, OT_LOCKER_CONFIG.TEMPLATE_TAB, OT_LOCKER_CONFIG.TEMPLATE_HEADERS);
  ensureTabWithHeaders_(ss, OT_LOCKER_CONFIG.AUDIT_TAB, OT_LOCKER_CONFIG.AUDIT_HEADERS);
  SpreadsheetApp.getUi().alert('Tabs "_Template" and "Audit_Log" are ready.');
}

/**
 * Installs a monthly time-driven trigger running on the 1st of each month at 01:00.
 */
function installMonthlyOtTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(function (t) {
    return t.getHandlerFunction() === 'provisionNextMonthAndLockPrevious';
  });

  if (exists) {
    SpreadsheetApp.getUi().alert('A monthly trigger for provisionNextMonthAndLockPrevious is already installed.');
    return;
  }

  ScriptApp.newTrigger('provisionNextMonthAndLockPrevious')
    .timeBased()
    .onMonthDay(1)
    .atHour(1)
    .create();

  SpreadsheetApp.getUi().alert('Monthly 1st-of-Month trigger installed.');
}

/**
 * Interactive menu entry point.
 */
function provisionNextMonthInteractive() {
  const summary = runMonthlyProvisionAndLock_();
  SpreadsheetApp.getUi().alert(summary);
}

/**
 * Scheduled trigger entry point (no UI calls).
 */
function provisionNextMonthAndLockPrevious() {
  const summary = runMonthlyProvisionAndLock_();
  Logger.log(summary);
}

/**
 * Clones _Template into the active month's OT_YYYY_MM tab (month M when run on the 1st)
 * with D2:E100 left editable, locks the closing month's tab (M - 1), and logs to Audit_Log.
 *
 * @return {string}
 */
function runMonthlyProvisionAndLock_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(OT_LOCKER_CONFIG.LOCK_TIMEOUT_MS)) {
    return 'Skipped: Another monthly OT provisioning run is already in progress.';
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ensureTabWithHeaders_(ss, OT_LOCKER_CONFIG.AUDIT_TAB, OT_LOCKER_CONFIG.AUDIT_HEADERS);
    const templateSheet = ss.getSheetByName(OT_LOCKER_CONFIG.TEMPLATE_TAB);

    if (!templateSheet) {
      auditSheet.appendRow([
        new Date().toISOString(),
        'PROVISION_MONTH',
        '',
        '',
        OT_LOCKER_CONFIG.EDITABLE_RANGE_A1,
        'NEEDS_CORRECTION: Missing _Template tab'
      ]);
      return 'Missing "_Template" tab. Run SheetAutomate > Initialize _Template & Audit_Log Tabs first.';
    }

    const now = new Date();
    const targetMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const nextTabName = formatMonthTabName_(targetMonthDate);
    const prevTabName = formatMonthTabName_(prevMonthDate);

    let provisionOutcome = 'CREATED';
    let nextSheet = ss.getSheetByName(nextTabName);

    // Idempotency guard: do not duplicate or overwrite if next month's tab already exists.
    if (nextSheet) {
      provisionOutcome = 'SKIPPED_ALREADY_EXISTS';
    } else {
      nextSheet = templateSheet.copyTo(ss);
      nextSheet.setName(nextTabName);
      nextSheet.showSheet();

      // Clear previous sample/hours input in editable range while preserving employee rows & headers.
      const lastRow = nextSheet.getLastRow();
      if (lastRow >= 2) {
        const editableRows = Math.max(1, lastRow - 1);
        nextSheet.getRange(2, 4, editableRows, 2).clearContent();
      }

      // Protect the cloned sheet except the staff input range (D2:E100).
      const sheetProtection = nextSheet
        .protect()
        .setDescription('SheetAutomate Template Guard - ' + nextTabName);
      sheetProtection.setUnprotectedRanges([nextSheet.getRange(OT_LOCKER_CONFIG.EDITABLE_RANGE_A1)]);
      restrictProtectionToOwner_(sheetProtection);
    }

    let prevLockStatus = 'NO_PREVIOUS_TAB';
    const prevSheet = ss.getSheetByName(prevTabName);
    if (prevSheet) {
      const existingProtections = prevSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      const alreadyLocked = existingProtections.some(function (p) {
        return String(p.getDescription() || '').indexOf(OT_LOCKER_CONFIG.LOCK_DESCRIPTION_PREFIX) === 0;
      });

      if (alreadyLocked) {
        prevLockStatus = prevTabName + ' (ALREADY_LOCKED)';
      } else {
        const lockProtection = prevSheet
          .protect()
          .setDescription(OT_LOCKER_CONFIG.LOCK_DESCRIPTION_PREFIX + ' - ' + prevTabName);
        lockProtection.setUnprotectedRanges([]);
        restrictProtectionToOwner_(lockProtection);
        prevLockStatus = prevTabName + ' (LOCKED)';
      }
    }

    auditSheet.appendRow([
      new Date().toISOString(),
      'PROVISION_AND_LOCK (' + provisionOutcome + ')',
      nextTabName,
      prevLockStatus,
      OT_LOCKER_CONFIG.EDITABLE_RANGE_A1,
      'COMPLETED'
    ]);

    return (
      'Monthly OT Provisioning Complete\n\nTarget Tab: ' +
      nextTabName +
      ' (' +
      provisionOutcome +
      ')\nPrevious Tab: ' +
      prevLockStatus
    );
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ensures a tab exists with its expected header row.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} tabName
 * @param {string[]} headers
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureTabWithHeaders_(ss, tabName, headers) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  const existing = headerRange.getValues()[0];
  const hasHeaders = existing.some(function (cell) {
    return String(cell).trim() !== '';
  });
  if (!hasHeaders) {
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Formats a Date into OT_YYYY_MM.
 *
 * @param {Date} dateObj
 * @return {string}
 */
function formatMonthTabName_(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return OT_LOCKER_CONFIG.TAB_PREFIX + year + '_' + month;
}

/**
 * Removes non-owner editors from a Protection object when permitted by the domain.
 *
 * @param {GoogleAppsScript.Spreadsheet.Protection} protection
 */
function restrictProtectionToOwner_(protection) {
  protection.setWarningOnly(false);
  try {
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
    const me = Session.getEffectiveUser();
    protection.addEditor(me);
    const editors = protection.getEditors();
    const toRemove = editors.filter(function (user) {
      return user.getEmail() !== me.getEmail();
    });
    if (toRemove.length > 0) {
      protection.removeEditors(toRemove);
    }
  } catch (err) {
    Logger.log('Editor restriction notice: ' + err.message);
  }
}
