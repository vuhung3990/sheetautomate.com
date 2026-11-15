/**
 * SheetAutomate Flow: Candidate Offer Letter & Onboarding Folder Pack
 * License: MIT
 * Telemetry: Zero telemetry, zero external tracking, 100% local execution in your Google account.
 */

var HR_OFFER_CONFIG = {
  SHEET_NAME: 'Offers',
  PROP_TEMPLATE_ID: 'OFFER_TEMPLATE_DOC_ID',
  PROP_ROOT_FOLDER_ID: 'ONBOARDING_ROOT_FOLDER_ID',
  DEFAULT_ROOT_FOLDER_NAME: 'SheetAutomate HR Onboarding'
};

/**
 * Adds the SheetAutomate custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SheetAutomate')
    .addItem('Generate Offer Packs', 'generateOfferPacks')
    .addItem('Create Starter Offer Template Doc', 'createStarterOfferTemplate')
    .addItem('Configure Template & Root Folder IDs', 'configureHrTemplateSettings')
    .addItem('Initialize Offers Sheet', 'initializeOffersSheet')
    .addToUi();
}

/**
 * Creates the Offers tab with standard headers if missing.
 */
function initializeOffersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HR_OFFER_CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HR_OFFER_CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Candidate_ID',
      'Candidate_Name',
      'Role_Title',
      'Start_Date',
      'Base_Salary',
      'Folder_Link',
      'PDF_Link',
      'Audit_Status'
    ]);
    sheet.setFrozenRows(1);
  }
  SpreadsheetApp.getUi().alert('Sheet "' + HR_OFFER_CONFIG.SHEET_NAME + '" is ready.');
}

/**
 * Creates a clean starter Google Docs offer template and stores its ID in Script Properties.
 */
function createStarterOfferTemplate() {
  var doc = DocumentApp.create('SheetAutomate - Offer Letter Template');
  var body = doc.getBody();
  body.appendParagraph('OFFER OF EMPLOYMENT').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Date: {{GENERATED_DATE}}');
  body.appendParagraph('Reference ID: {{CANDIDATE_ID}}');
  body.appendParagraph('');
  body.appendParagraph('Dear {{CANDIDATE_NAME}},');
  body.appendParagraph('');
  body.appendParagraph(
    'We are pleased to offer you the position of {{ROLE_TITLE}}. Your anticipated start date is {{START_DATE}}, with an annual base compensation of {{BASE_SALARY}}.'
  );
  body.appendParagraph('');
  body.appendParagraph(
    'Please review this offer package and retain a copy for your onboarding records.'
  );
  body.appendParagraph('');
  body.appendParagraph('Sincerely,');
  body.appendParagraph('People Operations Team');
  doc.saveAndClose();

  var props = PropertiesService.getScriptProperties();
  props.setProperty(HR_OFFER_CONFIG.PROP_TEMPLATE_ID, doc.getId());

  SpreadsheetApp.getUi().alert(
    'Starter template created and linked!\nDoc ID: ' + doc.getId() + '\nURL: ' + doc.getUrl()
  );
}

/**
 * Lets the user manually configure an existing Google Docs template ID and optional Drive root folder ID.
 */
function configureHrTemplateSettings() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();

  var currentTpl = props.getProperty(HR_OFFER_CONFIG.PROP_TEMPLATE_ID) || '';
  var tplPrompt = ui.prompt(
    'Offer Letter Google Doc Template ID',
    'Paste the Google Doc ID containing {{CANDIDATE_NAME}}, {{ROLE_TITLE}}, etc. (current: ' + (currentTpl || 'none') + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (tplPrompt.getSelectedButton() === ui.Button.OK) {
    props.setProperty(HR_OFFER_CONFIG.PROP_TEMPLATE_ID, tplPrompt.getResponseText().trim());
  }

  var currentFolder = props.getProperty(HR_OFFER_CONFIG.PROP_ROOT_FOLDER_ID) || '';
  var folderPrompt = ui.prompt(
    'Optional Onboarding Root Drive Folder ID',
    'Leave blank to auto-create "' + HR_OFFER_CONFIG.DEFAULT_ROOT_FOLDER_NAME + '" (current: ' + (currentFolder || 'auto') + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (folderPrompt.getSelectedButton() === ui.Button.OK) {
    props.setProperty(HR_OFFER_CONFIG.PROP_ROOT_FOLDER_ID, folderPrompt.getResponseText().trim());
  }

  ui.alert('HR offer template settings saved.');
}

/**
 * Generates candidate onboarding folders and offer letter PDFs for pending rows.
 */
function generateOfferPacks() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire script lock. Another offer batch is running.');
  }

  try {
    var props = PropertiesService.getScriptProperties();
    var templateId = String(props.getProperty(HR_OFFER_CONFIG.PROP_TEMPLATE_ID) || '').trim();
    if (!templateId) {
      throw new Error('Missing OFFER_TEMPLATE_DOC_ID. Run "Create Starter Offer Template Doc" or configure template ID first.');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HR_OFFER_CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing required tab: ' + HR_OFFER_CONFIG.SHEET_NAME);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return;
    }

    var rootFolder = resolveRootFolder_(props);
    var templateFile = DriveApp.getFileById(templateId);
    var tz = ss.getSpreadsheetTimeZone();
    var todayFormatted = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

    for (var i = 0; i < values.length; i++) {
      var rowNumber = i + 2;
      var row = values[i];
      var candidateId = String(row[0] || '').trim();
      var candidateName = String(row[1] || '').trim();
      var roleTitle = String(row[2] || '').trim();
      var rawStartDate = row[3];
      var baseSalary = String(row[4] || '').trim();
      var existingPdfLink = String(row[6] || '').trim();
      var auditStatus = String(row[7] || '').trim().toUpperCase();

      if (!candidateId && !candidateName) {
        continue;
      }

      if (auditStatus === 'COMPLETED' || existingPdfLink) {
        continue;
      }

      var formattedStartDate = formatDateValue_(rawStartDate, tz);
      if (!candidateId || !candidateName || !roleTitle || !formattedStartDate || !baseSalary) {
        sheet.getRange(rowNumber, 8).setValue('NEEDS_CORRECTION');
        continue;
      }

      var safeFolderName = sanitizeFileName_(candidateId + ' - ' + candidateName + ' Onboarding');
      var candidateFolder = rootFolder.createFolder(safeFolderName);

      var tempCopy = null;
      var savedPdf = null;
      try {
        tempCopy = templateFile.makeCopy('TMP_' + candidateId + '_' + candidateName, candidateFolder);
        var doc = DocumentApp.openById(tempCopy.getId());
        var body = doc.getBody();

        body.replaceText('\\{\\{CANDIDATE_ID\\}\\}', escapeReplacement_(candidateId));
        body.replaceText('\\{\\{CANDIDATE_NAME\\}\\}', escapeReplacement_(candidateName));
        body.replaceText('\\{\\{ROLE_TITLE\\}\\}', escapeReplacement_(roleTitle));
        body.replaceText('\\{\\{START_DATE\\}\\}', escapeReplacement_(formattedStartDate));
        body.replaceText('\\{\\{BASE_SALARY\\}\\}', escapeReplacement_(baseSalary));
        body.replaceText('\\{\\{GENERATED_DATE\\}\\}', escapeReplacement_(todayFormatted));
        doc.saveAndClose();

        var pdfBlob = tempCopy.getAs(MimeType.PDF);
        var pdfFileName = sanitizeFileName_('Offer_Letter_' + candidateId + '_' + candidateName) + '.pdf';
        pdfBlob.setName(pdfFileName);
        savedPdf = candidateFolder.createFile(pdfBlob);
      } finally {
        if (tempCopy) {
          tempCopy.setTrashed(true);
        }
      }

      sheet.getRange(rowNumber, 6).setValue(candidateFolder.getUrl());
      sheet.getRange(rowNumber, 7).setValue(savedPdf.getUrl());
      sheet.getRange(rowNumber, 8).setValue('COMPLETED');
    }

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function resolveRootFolder_(props) {
  var folderId = String(props.getProperty(HR_OFFER_CONFIG.PROP_ROOT_FOLDER_ID) || '').trim();
  if (folderId) {
    return DriveApp.getFolderById(folderId);
  }
  var existing = DriveApp.getFoldersByName(HR_OFFER_CONFIG.DEFAULT_ROOT_FOLDER_NAME);
  if (existing.hasNext()) {
    var folder = existing.next();
    props.setProperty(HR_OFFER_CONFIG.PROP_ROOT_FOLDER_ID, folder.getId());
    return folder;
  }
  var created = DriveApp.createFolder(HR_OFFER_CONFIG.DEFAULT_ROOT_FOLDER_NAME);
  props.setProperty(HR_OFFER_CONFIG.PROP_ROOT_FOLDER_ID, created.getId());
  return created;
}

function formatDateValue_(value, tz) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  }
  return String(value || '').trim();
}

function sanitizeFileName_(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').trim();
}

function escapeReplacement_(val) {
  return String(val == null ? '' : val).replace(/\$/g, '\\$');
}
