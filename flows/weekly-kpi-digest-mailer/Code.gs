/**
 * SheetAutomate Flow: Automated Weekly Executive KPI Digest Mailer
 * License: MIT
 * Telemetry: Zero telemetry, zero hardcoded recipient lists, 100% local execution in your Google account.
 *
 * @OnlyCurrentDoc
 */

var KPI_CONFIG = {
  KPI_SHEET: 'Weekly_KPI_Data',
  TASKS_SHEET: 'Tasks_Log',
  AUDIT_SHEET: 'Digest_Audit',
  PROP_STAKEHOLDERS: 'STAKEHOLDER_EMAILS',
  TRIGGER_HANDLER: 'sendWeeklyKpiDigest'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Send Weekly KPI Digest Now', 'sendWeeklyKpiDigest')
    .addItem('Configure Stakeholder Recipients', 'configureStakeholderEmails')
    .addItem('Install Weekly Monday 8 AM Trigger', 'installWeeklyKpiTrigger')
    .addItem('Initialize KPI & Audit Tabs', 'initializeKpiSheets')
    .addToUi();
}

/**
 * Creates Weekly_KPI_Data and Digest_Audit tabs with standard headers if missing.
 */
function initializeKpiSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var kpiSheet = ss.getSheetByName(KPI_CONFIG.KPI_SHEET);
  if (!kpiSheet) {
    kpiSheet = ss.insertSheet(KPI_CONFIG.KPI_SHEET);
  }
  if (kpiSheet.getLastRow() === 0) {
    kpiSheet.appendRow([
      'Week_Label',
      'Department',
      'Revenue',
      'Cost',
      'Tasks_Completed',
      'Tasks_Planned',
      'Row_Status'
    ]);
    kpiSheet.setFrozenRows(1);
  }

  ensureAuditSheet_(ss);
  SpreadsheetApp.getUi().alert('Sheets "' + KPI_CONFIG.KPI_SHEET + '" and "' + KPI_CONFIG.AUDIT_SHEET + '" are ready.');
}

/**
 * Stores comma-separated stakeholder email addresses in Script Properties.
 */
function configureStakeholderEmails() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var current = props.getProperty(KPI_CONFIG.PROP_STAKEHOLDERS) || '';
  var prompt = ui.prompt(
    'Stakeholder Recipient Emails',
    'Enter comma-separated recipient emails (current: ' + (current || 'none') + '):',
    ui.ButtonSet.OK_CANCEL
  );

  if (prompt.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var raw = prompt.getResponseText().trim();
  var validated = parseEmailList_(raw);
  if (validated.invalid.length > 0) {
    ui.alert('Invalid email(s): ' + validated.invalid.join(', ') + '. Settings were not saved.');
    return;
  }
  if (validated.valid.length === 0) {
    ui.alert('At least one valid recipient email is required.');
    return;
  }

  props.setProperty(KPI_CONFIG.PROP_STAKEHOLDERS, validated.valid.join(','));
  ui.alert('Saved ' + validated.valid.length + ' stakeholder recipient(s).');
}

/**
 * Installs a weekly Monday 8 AM trigger without duplicates.
 */
function installWeeklyKpiTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === KPI_CONFIG.TRIGGER_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger(KPI_CONFIG.TRIGGER_HANDLER)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();

  SpreadsheetApp.getUi().alert('Weekly KPI digest trigger installed (Mondays at 8:00 AM).');
}

/**
 * Aggregates the active week's KPIs across tabs, verifies run-hash idempotency, and sends the HTML digest.
 */
function sendWeeklyKpiDigest() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another digest run is active.');
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName(KPI_CONFIG.KPI_SHEET);
    if (!kpiSheet) {
      throw new Error('Missing required tab: ' + KPI_CONFIG.KPI_SHEET);
    }

    var lastRow = kpiSheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var props = PropertiesService.getScriptProperties();
    var rawRecipients = String(props.getProperty(KPI_CONFIG.PROP_STAKEHOLDERS) || '').trim();
    if (!rawRecipients) {
      rawRecipients = String(Session.getActiveUser().getEmail() || '').trim();
    }
    var parsedEmails = parseEmailList_(rawRecipients);
    if (parsedEmails.valid.length === 0) {
      throw new Error('No valid stakeholder emails configured. Run "Configure Stakeholder Recipients" first.');
    }

    var values = kpiSheet.getRange(2, 1, lastRow - 1, 7).getValues();
    var targetWeek = resolveLatestWeekLabel_(values);
    if (!targetWeek) {
      return;
    }

    var totalRevenue = 0;
    var totalCost = 0;
    var tasksCompleted = 0;
    var tasksPlanned = 0;
    var deptRows = [];

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var weekLabel = String(row[0] || '').trim();
      var dept = String(row[1] || '').trim();
      var revenue = Number(row[2]);
      var cost = Number(row[3]);
      var done = Number(row[4]);
      var planned = Number(row[5]);

      if (!weekLabel && !dept) {
        continue;
      }
      if (weekLabel !== targetWeek) {
        continue;
      }

      if (!dept || isNaN(revenue) || isNaN(cost) || isNaN(done) || isNaN(planned) || revenue < 0 || cost < 0 || done < 0 || planned < 0) {
        kpiSheet.getRange(rowNumber, 7).setValue('NEEDS_CORRECTION');
        continue;
      }

      var margin = revenue - cost;
      var marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

      totalRevenue += revenue;
      totalCost += cost;
      tasksCompleted += done;
      tasksPlanned += planned;

      deptRows.push({
        department: dept,
        revenue: revenue,
        cost: cost,
        margin: margin,
        marginPct: marginPct,
        done: done,
        planned: planned
      });
    }

    // Also incorporate optional Tasks_Log tab entries for the same Week_Label if present.
    var tasksSheet = ss.getSheetByName(KPI_CONFIG.TASKS_SHEET);
    if (tasksSheet && tasksSheet.getLastRow() >= 2) {
      var taskValues = tasksSheet.getRange(2, 1, tasksSheet.getLastRow() - 1, 3).getValues();
      for (var t = 0; t < taskValues.length; t++) {
        var tWeek = String(taskValues[t][0] || '').trim();
        var tStatus = String(taskValues[t][2] || '').trim().toUpperCase();
        if (tWeek === targetWeek && tStatus) {
          tasksPlanned += 1;
          if (tStatus === 'DONE' || tStatus === 'COMPLETED') {
            tasksCompleted += 1;
          }
        }
      }
    }

    if (deptRows.length === 0) {
      SpreadsheetApp.flush();
      return;
    }

    var grossMargin = totalRevenue - totalCost;
    var grossMarginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
    var completionPct = tasksPlanned > 0 ? (tasksCompleted / tasksPlanned) * 100 : 0;

    var summary = {
      weekLabel: targetWeek,
      spreadsheetName: ss.getName(),
      totalRevenue: totalRevenue,
      totalCost: totalCost,
      grossMargin: grossMargin,
      grossMarginPct: grossMarginPct,
      tasksCompleted: tasksCompleted,
      tasksPlanned: tasksPlanned,
      completionPct: completionPct,
      departments: deptRows
    };

    var runHash = computeSha256_(JSON.stringify({
      weekLabel: summary.weekLabel,
      totalRevenue: summary.totalRevenue,
      totalCost: summary.totalCost,
      tasksCompleted: summary.tasksCompleted,
      tasksPlanned: summary.tasksPlanned,
      recipients: parsedEmails.valid
    }));

    var auditSheet = ensureAuditSheet_(ss);
    if (hasCompletedRunHash_(auditSheet, targetWeek, runHash)) {
      Logger.log('Skipping duplicate KPI digest for ' + targetWeek + ' (' + runHash + ')');
      return;
    }

    var subject = '[Weekly KPI Digest] ' + targetWeek + ' | Margin ' + grossMarginPct.toFixed(1) + '%';
    MailApp.sendEmail({
      to: parsedEmails.valid.join(','),
      subject: subject,
      body: buildKpiText_(summary),
      htmlBody: buildKpiHtml_(summary)
    });

    var sentAt = new Date().toISOString();
    auditSheet.appendRow([
      targetWeek,
      runHash,
      parsedEmails.valid.join(', '),
      totalRevenue.toFixed(2),
      grossMarginPct.toFixed(1) + '%',
      sentAt,
      'COMPLETED'
    ]);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function resolveLatestWeekLabel_(values) {
  var latest = '';
  for (var i = 0; i < values.length; i++) {
    var w = String(values[i][0] || '').trim();
    if (w && w > latest) {
      latest = w;
    }
  }
  return latest;
}

function ensureAuditSheet_(ss) {
  var auditSheet = ss.getSheetByName(KPI_CONFIG.AUDIT_SHEET);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(KPI_CONFIG.AUDIT_SHEET);
  }
  if (auditSheet.getLastRow() === 0) {
    auditSheet.appendRow([
      'Week_Label',
      'Run_Hash',
      'Recipients',
      'Revenue_Total',
      'Margin_Pct',
      'Sent_Timestamp',
      'Audit_Status'
    ]);
    auditSheet.setFrozenRows(1);
  }
  return auditSheet;
}

function hasCompletedRunHash_(auditSheet, weekLabel, runHash) {
  var lastRow = auditSheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var rows = auditSheet.getRange(2, 1, lastRow - 1, 7).getValues();
  for (var i = 0; i < rows.length; i++) {
    var w = String(rows[i][0] || '').trim();
    var h = String(rows[i][1] || '').trim();
    var status = String(rows[i][6] || '').trim().toUpperCase();
    if (w === weekLabel && h === runHash && status === 'COMPLETED') {
      return true;
    }
  }
  return false;
}

function computeSha256_(input) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = (bytes[i] < 0) ? bytes[i] + 256 : bytes[i];
    var s = b.toString(16);
    hex += (s.length === 1 ? '0' + s : s);
  }
  return hex.substring(0, 16);
}

function parseEmailList_(raw) {
  var parts = String(raw || '').split(',');
  var valid = [];
  var invalid = [];
  var seen = {};
  for (var i = 0; i < parts.length; i++) {
    var email = parts[i].trim();
    if (!email) continue;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!seen[email.toLowerCase()]) {
        seen[email.toLowerCase()] = true;
        valid.push(email);
      }
    } else {
      invalid.push(email);
    }
  }
  return { valid: valid, invalid: invalid };
}

function buildKpiHtml_(s) {
  var deptHtml = '';
  for (var i = 0; i < s.departments.length; i++) {
    var d = s.departments[i];
    deptHtml += [
      '<tr>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(d.department) + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(formatCurrency_(d.revenue)) + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + escapeHtml_(formatCurrency_(d.cost)) + '</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#047857;font-weight:bold;">' + d.marginPct.toFixed(1) + '%</td>',
      '<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">' + d.done + ' / ' + d.planned + '</td>',
      '</tr>'
    ].join('');
  }

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;line-height:1.5;">',
    '<h2 style="margin:0 0 6px;font-size:20px;">Weekly Executive KPI Digest (' + escapeHtml_(s.weekLabel) + ')</h2>',
    '<p style="margin:0 0 16px;color:#475569;font-size:13px;">Source: ' + escapeHtml_(s.spreadsheetName) + '</p>',
    '<table style="width:100%;border-collapse:collapse;margin-bottom:18px;background:#f8fafc;border:1px solid #e2e8f0;">',
    '<tr>',
    '<td style="padding:12px;border-right:1px solid #e2e8f0;"><div style="font-size:11px;color:#64748b;">REVENUE</div><div style="font-size:16px;font-weight:bold;">' + escapeHtml_(formatCurrency_(s.totalRevenue)) + '</div></td>',
    '<td style="padding:12px;border-right:1px solid #e2e8f0;"><div style="font-size:11px;color:#64748b;">COST</div><div style="font-size:16px;font-weight:bold;">' + escapeHtml_(formatCurrency_(s.totalCost)) + '</div></td>',
    '<td style="padding:12px;border-right:1px solid #e2e8f0;"><div style="font-size:11px;color:#64748b;">GROSS MARGIN</div><div style="font-size:16px;font-weight:bold;color:#047857;">' + s.grossMarginPct.toFixed(1) + '%</div></td>',
    '<td style="padding:12px;"><div style="font-size:11px;color:#64748b;">TASKS DONE</div><div style="font-size:16px;font-weight:bold;">' + s.completionPct.toFixed(1) + '% (' + s.tasksCompleted + '/' + s.tasksPlanned + ')</div></td>',
    '</tr>',
    '</table>',
    '<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px;">',
    '<thead><tr style="background:#f1f5f9;text-align:left;">',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Department</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Revenue</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Cost</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Margin</th>',
    '<th style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Tasks</th>',
    '</tr></thead>',
    '<tbody>' + deptHtml + '</tbody>',
    '</table>',
    '</div>'
  ].join('');
}

function buildKpiText_(s) {
  var lines = [
    'Weekly Executive KPI Digest (' + s.weekLabel + ')',
    'Revenue: ' + formatCurrency_(s.totalRevenue),
    'Cost: ' + formatCurrency_(s.totalCost),
    'Gross Margin: ' + formatCurrency_(s.grossMargin) + ' (' + s.grossMarginPct.toFixed(1) + '%)',
    'Tasks Completed: ' + s.tasksCompleted + '/' + s.tasksPlanned + ' (' + s.completionPct.toFixed(1) + '%)',
    '',
    'Department Breakdown:'
  ];
  for (var i = 0; i < s.departments.length; i++) {
    var d = s.departments[i];
    lines.push('- ' + d.department + ': Rev ' + formatCurrency_(d.revenue) + ', Cost ' + formatCurrency_(d.cost) + ', Margin ' + d.marginPct.toFixed(1) + '%');
  }
  return lines.join('\n');
}

function formatCurrency_(amount) {
  return '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
