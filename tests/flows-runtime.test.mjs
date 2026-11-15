import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FLOWS_DIR = path.join(ROOT_DIR, 'flows');

function discoverFlowSlugs() {
  return fs
    .readdirSync(FLOWS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
}

function parseA1Range(a1) {
  const match = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i.exec(String(a1).trim());
  if (!match) {
    throw new Error(`Unsupported A1 notation: ${a1}`);
  }
  const colToNum = (letters) => {
    let num = 0;
    for (const ch of letters.toUpperCase()) {
      num = num * 26 + (ch.charCodeAt(0) - 64);
    }
    return num;
  };
  const startCol = colToNum(match[1]);
  const startRow = Number(match[2]);
  const endCol = match[3] ? colToNum(match[3]) : startCol;
  const endRow = match[4] ? Number(match[4]) : startRow;
  return {
    row: startRow,
    col: startCol,
    numRows: endRow - startRow + 1,
    numCols: endCol - startCol + 1,
  };
}

function formatUtcDate(dateObj, format) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  const MM = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const HH = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());

  if (format === 'yyyy-MM-dd') return `${yyyy}-${MM}-${dd}`;
  if (format === 'yyyy-MM-dd HH:mm') return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
  if (format === 'yyyyMMdd-HHmm') return `${yyyy}${MM}${dd}-${HH}${mm}`;
  return format
    .replace('yyyy', yyyy)
    .replace('MM', MM)
    .replace('dd', dd)
    .replace('HH', HH)
    .replace('mm', mm)
    .replace('ss', ss);
}

function createGasSandbox(options = {}) {
  const state = {
    menus: [],
    alerts: [],
    promptQueue: [...(options.promptQueue || [])],
    sheets: new Map(),
    sheetOrder: [],
    docs: new Map(),
    files: new Map(),
    folders: new Map(),
    createdFiles: [],
    createdFolders: [],
    sentEmails: [],
    fetchCalls: [],
    triggers: [],
    properties: new Map(Object.entries(options.properties || {})),
    logs: [],
    gmailThreads: options.gmailThreads || [],
    lock: {
      available: options.lockAvailable !== undefined ? options.lockAvailable : true,
      attempts: 0,
      acquired: 0,
      released: 0,
    },
    sheetWrites: 0,
    nextId: 1,
  };

  const genId = (prefix) => `${prefix}-${state.nextId++}`;

  class MockBlob {
    constructor(data, contentType = 'application/octet-stream', name = 'untitled') {
      this._data = String(data ?? '');
      this._contentType = contentType;
      this._name = name;
    }
    setName(name) {
      this._name = String(name);
      return this;
    }
    getName() {
      return this._name;
    }
    getContentType() {
      return this._contentType;
    }
    getDataAsString() {
      return this._data;
    }
    getAs(mimeType) {
      return new MockBlob(this._data, mimeType, this._name);
    }
    copyBlob() {
      return new MockBlob(this._data, this._contentType, this._name);
    }
  }

  class MockDocText {
    constructor(parent) {
      this._parent = parent;
      this.color = null;
      this.bold = false;
    }
    setForegroundColor(color) {
      this.color = color;
      return this;
    }
    setBold(isBold) {
      this.bold = Boolean(isBold);
      return this;
    }
  }

  class MockTableCell {
    constructor(value) {
      this._text = String(value ?? '');
      this._bg = null;
      this._textStyle = new MockDocText(this);
    }
    setBackgroundColor(color) {
      this._bg = color;
      return this;
    }
    editAsText() {
      return this._textStyle;
    }
    getText() {
      return this._text;
    }
  }

  class MockTableRow {
    constructor(cells) {
      this._cells = cells.map((v) => new MockTableCell(v));
    }
    getNumCells() {
      return this._cells.length;
    }
    getCell(idx) {
      return this._cells[idx];
    }
  }

  class MockTable {
    constructor(rowsData) {
      this.type = 'TABLE';
      this._rows = rowsData.map((r) => new MockTableRow(r));
      this._borderColor = null;
      this._borderWidth = null;
    }
    setBorderColor(color) {
      this._borderColor = color;
      return this;
    }
    setBorderWidth(width) {
      this._borderWidth = width;
      return this;
    }
    getRow(idx) {
      return this._rows[idx];
    }
    getText() {
      return this._rows.map((r) => r._cells.map((c) => c.getText()).join(' | ')).join('\n');
    }
  }

  class MockParagraph {
    constructor(body, text) {
      this.type = 'PARAGRAPH';
      this._body = body;
      this.text = String(text ?? '');
      this.heading = 'NORMAL';
    }
    setHeading(heading) {
      this.heading = heading;
      return this;
    }
    removeFromParent() {
      const idx = this._body._children.indexOf(this);
      if (idx !== -1) {
        this._body._children.splice(idx, 1);
      }
    }
    getText() {
      return this.text;
    }
  }

  class MockBody {
    constructor(initialParagraphs = []) {
      this._children = initialParagraphs.map((t) => new MockParagraph(this, t));
    }
    appendParagraph(text) {
      const p = new MockParagraph(this, text);
      this._children.push(p);
      return p;
    }
    replaceText(searchPattern, replacement) {
      const repStr = String(replacement ?? '');
      // Simulate Google Apps Script / Java Matcher.replaceAll '$' backreference rules:
      // unescaped $0-$9 or $&/$`/$' is invalid or corrupts text unless escaped as \$.
      if (/(^|[^\\])\$[0-9&`']/.test(repStr)) {
        throw new Error(`Unescaped "$" in DocumentApp Body.replaceText replacement: "${repStr}"`);
      }
      const literalReplacement = repStr.replace(/\\\$/g, '$').replace(/\\\\/g, '\\');
      const regex = new RegExp(searchPattern, 'g');
      for (const child of this._children) {
        if (child.type === 'PARAGRAPH') {
          child.text = child.text.replace(regex, () => literalReplacement);
        }
      }
      return this;
    }
    findText(searchPattern) {
      const regex = new RegExp(searchPattern);
      for (const child of this._children) {
        if (child.type === 'PARAGRAPH' && regex.test(child.text)) {
          return {
            getElement: () => ({
              getParent: () => child,
            }),
          };
        }
      }
      return null;
    }
    getChildIndex(child) {
      return this._children.indexOf(child);
    }
    insertTable(index, tableData) {
      const table = new MockTable(tableData);
      this._children.splice(index, 0, table);
      return table;
    }
    appendTable(tableData) {
      const table = new MockTable(tableData);
      this._children.push(table);
      return table;
    }
    getText() {
      return this._children.map((c) => c.getText()).join('\n');
    }
  }

  class MockDocument {
    constructor(id, name, paragraphs = []) {
      this._id = id;
      this._name = name;
      this._body = new MockBody(paragraphs);
      this._saved = false;
    }
    getId() {
      return this._id;
    }
    getName() {
      return this._name;
    }
    getUrl() {
      return `https://docs.google.com/document/d/${this._id}/edit`;
    }
    getBody() {
      return this._body;
    }
    saveAndClose() {
      this._saved = true;
    }
  }

  class MockFile {
    constructor({ id, name, content = '', mimeType = 'application/octet-stream', isDoc = false }) {
      this._id = id;
      this._name = name;
      this._content = content;
      this._mimeType = mimeType;
      this._isDoc = isDoc;
      this._trashed = false;
    }
    getId() {
      return this._id;
    }
    getName() {
      return this._name;
    }
    getUrl() {
      return `https://drive.google.com/file/d/${this._id}/view`;
    }
    makeCopy(name, destFolder) {
      const newId = genId('file');
      const copyFile = new MockFile({
        id: newId,
        name: String(name || `${this._name}_copy`),
        content: this._content,
        mimeType: this._mimeType,
        isDoc: this._isDoc,
      });
      state.files.set(newId, copyFile);
      if (this._isDoc && state.docs.has(this._id)) {
        const srcDoc = state.docs.get(this._id);
        const clonedParagraphs = srcDoc
          .getBody()
          ._children.filter((c) => c.type === 'PARAGRAPH')
          .map((c) => c.text);
        state.docs.set(newId, new MockDocument(newId, copyFile.getName(), clonedParagraphs));
      }
      if (destFolder) {
        destFolder._files.push(copyFile);
      }
      return copyFile;
    }
    getAs(mimeType) {
      const docText = state.docs.has(this._id) ? state.docs.get(this._id).getBody().getText() : this._content;
      return new MockBlob(docText, mimeType, `${this._name}.pdf`);
    }
    setTrashed(trashed) {
      this._trashed = Boolean(trashed);
    }
  }

  class MockFolder {
    constructor(id, name) {
      this._id = id;
      this._name = name;
      this._files = [];
      this._subfolders = [];
    }
    getId() {
      return this._id;
    }
    getName() {
      return this._name;
    }
    getUrl() {
      return `https://drive.google.com/drive/folders/${this._id}`;
    }
    createFile(blob) {
      const id = genId('pdf');
      const file = new MockFile({
        id,
        name: blob.getName(),
        content: blob.getDataAsString(),
        mimeType: blob.getContentType(),
      });
      state.files.set(id, file);
      state.createdFiles.push(file);
      this._files.push(file);
      return file;
    }
    createFolder(name) {
      const id = genId('folder');
      const folder = new MockFolder(id, String(name));
      state.folders.set(id, folder);
      state.createdFolders.push(folder);
      this._subfolders.push(folder);
      return folder;
    }
  }

  class MockProtection {
    constructor(description = '') {
      this._description = description;
      this._unprotectedRanges = [];
      this._warningOnly = false;
      this._domainEdit = true;
      this._editors = [];
    }
    setDescription(desc) {
      this._description = String(desc);
      return this;
    }
    getDescription() {
      return this._description;
    }
    setUnprotectedRanges(ranges) {
      this._unprotectedRanges = ranges || [];
      return this;
    }
    getUnprotectedRanges() {
      return this._unprotectedRanges;
    }
    setWarningOnly(flag) {
      this._warningOnly = Boolean(flag);
      return this;
    }
    canDomainEdit() {
      return true;
    }
    setDomainEdit(flag) {
      this._domainEdit = Boolean(flag);
      return this;
    }
    addEditor(user) {
      this._editors.push(user);
      return this;
    }
    getEditors() {
      return [...this._editors];
    }
    removeEditors(users) {
      const toRemove = new Set(users.map((u) => (typeof u === 'string' ? u : u.getEmail())));
      this._editors = this._editors.filter((u) => !toRemove.has(typeof u === 'string' ? u : u.getEmail()));
      return this;
    }
  }

  class MockRange {
    constructor(sheet, row, col, numRows = 1, numCols = 1) {
      this._sheet = sheet;
      this._row = row;
      this._col = col;
      this._numRows = numRows;
      this._numCols = numCols;
    }
    getSheet() {
      return this._sheet;
    }
    getRow() {
      return this._row;
    }
    getColumn() {
      return this._col;
    }
    getValues() {
      const out = [];
      for (let r = 0; r < this._numRows; r++) {
        const rowArr = [];
        for (let c = 0; c < this._numCols; c++) {
          rowArr.push(this._sheet._getCell(this._row + r, this._col + c));
        }
        out.push(rowArr);
      }
      return out;
    }
    getValue() {
      return this._sheet._getCell(this._row, this._col);
    }
    setValues(values) {
      state.sheetWrites++;
      for (let r = 0; r < values.length; r++) {
        for (let c = 0; c < values[r].length; c++) {
          this._sheet._setCell(this._row + r, this._col + c, values[r][c]);
        }
      }
      return this;
    }
    setValue(value) {
      state.sheetWrites++;
      this._sheet._setCell(this._row, this._col, value);
      return this;
    }
    setFontWeight() {
      return this;
    }
    clearContent() {
      state.sheetWrites++;
      for (let r = 0; r < this._numRows; r++) {
        for (let c = 0; c < this._numCols; c++) {
          this._sheet._setCell(this._row + r, this._col + c, '');
        }
      }
      return this;
    }
  }

  class MockSheet {
    constructor(name, rows = []) {
      this._name = name;
      this._rows = rows.map((r) => [...r]);
      this._frozenRows = 0;
      this._hidden = false;
      this._protections = [];
      this._activeRow = 2;
    }
    getName() {
      return this._name;
    }
    setName(name) {
      const oldName = this._name;
      this._name = String(name);
      state.sheets.delete(oldName);
      state.sheets.set(this._name, this);
      const idx = state.sheetOrder.indexOf(oldName);
      if (idx !== -1) state.sheetOrder[idx] = this._name;
    }
    showSheet() {
      this._hidden = false;
    }
    _getCell(row, col) {
      const rIdx = row - 1;
      const cIdx = col - 1;
      if (rIdx < 0 || cIdx < 0 || rIdx >= this._rows.length) return '';
      const rowData = this._rows[rIdx];
      return cIdx < rowData.length ? rowData[cIdx] : '';
    }
    _setCell(row, col, value) {
      const rIdx = row - 1;
      const cIdx = col - 1;
      while (this._rows.length <= rIdx) {
        this._rows.push([]);
      }
      while (this._rows[rIdx].length <= cIdx) {
        this._rows[rIdx].push('');
      }
      this._rows[rIdx][cIdx] = value;
    }
    getLastRow() {
      for (let r = this._rows.length - 1; r >= 0; r--) {
        if (this._rows[r].some((cell) => cell !== '' && cell !== null && cell !== undefined)) {
          return r + 1;
        }
      }
      return 0;
    }
    getLastColumn() {
      let maxCol = 0;
      for (const row of this._rows) {
        for (let c = row.length - 1; c >= 0; c--) {
          if (row[c] !== '' && row[c] !== null && row[c] !== undefined) {
            maxCol = Math.max(maxCol, c + 1);
            break;
          }
        }
      }
      return maxCol;
    }
    getDataRange() {
      const lastRow = this.getLastRow();
      const lastCol = this.getLastColumn();
      if (lastRow === 0 || lastCol === 0) {
        return new MockRange(this, 1, 1, 1, 1);
      }
      return new MockRange(this, 1, 1, lastRow, lastCol);
    }
    getRange(rowOrA1, col, numRows = 1, numCols = 1) {
      if (typeof rowOrA1 === 'string') {
        const parsed = parseA1Range(rowOrA1);
        return new MockRange(this, parsed.row, parsed.col, parsed.numRows, parsed.numCols);
      }
      return new MockRange(this, rowOrA1, col, numRows, numCols);
    }
    getActiveRange() {
      return new MockRange(this, this._activeRow, 1, 1, 1);
    }
    appendRow(values) {
      state.sheetWrites++;
      const nextRow = this.getLastRow() + 1;
      for (let c = 0; c < values.length; c++) {
        this._setCell(nextRow, c + 1, values[c]);
      }
      return this;
    }
    setFrozenRows(n) {
      this._frozenRows = n;
    }
    copyTo(targetSpreadsheet) {
      state.sheetWrites++;
      const copyName = `Copy of ${this._name}`;
      const cloned = new MockSheet(copyName, this._rows);
      cloned._frozenRows = this._frozenRows;
      targetSpreadsheet._registerSheet(cloned);
      return cloned;
    }
    protect() {
      const p = new MockProtection();
      this._protections.push(p);
      return p;
    }
    getProtections() {
      return [...this._protections];
    }
  }

  const spreadsheet = {
    getName: () => 'SheetAutomate Test Workbook',
    getSpreadsheetTimeZone: () => 'Etc/UTC',
    getSheetByName: (name) => state.sheets.get(name) || null,
    insertSheet: (name) => {
      state.sheetWrites++;
      const s = new MockSheet(name);
      spreadsheet._registerSheet(s);
      return s;
    },
    getActiveSheet: () => {
      const firstName = state.sheetOrder[0];
      return firstName ? state.sheets.get(firstName) : null;
    },
    getSheets: () => state.sheetOrder.map((n) => state.sheets.get(n)),
    _registerSheet: (sheet) => {
      state.sheets.set(sheet.getName(), sheet);
      if (!state.sheetOrder.includes(sheet.getName())) {
        state.sheetOrder.push(sheet.getName());
      }
    },
  };

  const ui = {
    ButtonSet: { OK: 'OK', OK_CANCEL: 'OK_CANCEL', YES_NO: 'YES_NO', YES_NO_CANCEL: 'YES_NO_CANCEL' },
    Button: { OK: 'OK', CANCEL: 'CANCEL', YES: 'YES', NO: 'NO', CLOSE: 'CLOSE' },
    createMenu(title) {
      const menu = { title, items: [], addedToUi: false };
      const builder = {
        addItem(caption, fnName) {
          menu.items.push({ caption, fnName });
          return builder;
        },
        addSeparator() {
          return builder;
        },
        addToUi() {
          menu.addedToUi = true;
          state.menus.push(menu);
          return builder;
        },
      };
      return builder;
    },
    alert(message) {
      state.alerts.push(String(message));
      return ui.Button.OK;
    },
    prompt() {
      const next = state.promptQueue.shift();
      return {
        getSelectedButton: () => (next ? next.button : ui.Button.OK),
        getResponseText: () => (next ? String(next.text) : ''),
      };
    },
  };

  const SpreadsheetApp = {
    ProtectionType: { SHEET: 'SHEET', RANGE: 'RANGE' },
    getUi: () => ui,
    getActiveSpreadsheet: () => spreadsheet,
    flush: () => {},
  };

  const DocumentApp = {
    ParagraphHeading: { HEADING1: 'HEADING1', HEADING2: 'HEADING2', NORMAL: 'NORMAL' },
    create(name) {
      const id = genId('doc');
      const doc = new MockDocument(id, String(name));
      state.docs.set(id, doc);
      state.files.set(id, new MockFile({ id, name: String(name), isDoc: true }));
      return doc;
    },
    openById(id) {
      const doc = state.docs.get(id);
      if (!doc) throw new Error(`Document not found: ${id}`);
      return doc;
    },
  };

  const DriveApp = {
    getFileById(id) {
      const file = state.files.get(id);
      if (!file) throw new Error(`File not found: ${id}`);
      return file;
    },
    getFolderById(id) {
      const folder = state.folders.get(id);
      if (!folder) throw new Error(`Folder not found: ${id}`);
      return folder;
    },
    getFoldersByName(name) {
      const matches = [...state.folders.values()].filter((f) => f.getName() === name);
      let idx = 0;
      return {
        hasNext: () => idx < matches.length,
        next: () => matches[idx++],
      };
    },
    createFolder(name) {
      const id = genId('folder');
      const folder = new MockFolder(id, String(name));
      state.folders.set(id, folder);
      state.createdFolders.push(folder);
      return folder;
    },
  };

  const MimeType = {
    PDF: 'application/pdf',
    HTML: 'text/html',
    PLAIN_TEXT: 'text/plain',
  };

  const GmailApp = {
    search() {
      return state.gmailThreads;
    },
  };

  const MailApp = {
    sendEmail(arg1, subject, body, opts) {
      if (typeof arg1 === 'object' && arg1 !== null) {
        state.sentEmails.push({
          to: arg1.to,
          subject: arg1.subject,
          body: arg1.body || '',
          htmlBody: arg1.htmlBody || '',
        });
      } else {
        state.sentEmails.push({
          to: arg1,
          subject: subject || '',
          body: body || '',
          htmlBody: opts?.htmlBody || '',
        });
      }
    },
  };

  const LockService = {
    getScriptLock() {
      return {
        tryLock() {
          state.lock.attempts++;
          if (!state.lock.available) return false;
          state.lock.acquired++;
          return true;
        },
        releaseLock() {
          state.lock.released++;
        },
      };
    },
  };

  const ScriptApp = {
    WeekDay: {
      MONDAY: 'MONDAY',
      TUESDAY: 'TUESDAY',
      WEDNESDAY: 'WEDNESDAY',
      THURSDAY: 'THURSDAY',
      FRIDAY: 'FRIDAY',
      SATURDAY: 'SATURDAY',
      SUNDAY: 'SUNDAY',
    },
    getProjectTriggers() {
      return [...state.triggers];
    },
    deleteTrigger(trigger) {
      const idx = state.triggers.indexOf(trigger);
      if (idx !== -1) state.triggers.splice(idx, 1);
    },
    newTrigger(handlerFunction) {
      const cfg = { handlerFunction, mode: 'unknown', details: {} };
      const builder = {
        forSpreadsheet() {
          cfg.mode = 'spreadsheet';
          return builder;
        },
        onFormSubmit() {
          cfg.details.event = 'onFormSubmit';
          return builder;
        },
        onEdit() {
          cfg.details.event = 'onEdit';
          return builder;
        },
        timeBased() {
          cfg.mode = 'timeBased';
          return builder;
        },
        everyHours(n) {
          cfg.details.everyHours = n;
          return builder;
        },
        everyDays(n) {
          cfg.details.everyDays = n;
          return builder;
        },
        onMonthDay(d) {
          cfg.details.onMonthDay = d;
          return builder;
        },
        onWeekDay(wd) {
          cfg.details.onWeekDay = wd;
          return builder;
        },
        atHour(h) {
          cfg.details.atHour = h;
          return builder;
        },
        create() {
          const trigger = {
            getHandlerFunction: () => cfg.handlerFunction,
            ...cfg,
          };
          state.triggers.push(trigger);
          return trigger;
        },
      };
      return builder;
    },
  };

  const PropertiesService = {
    getScriptProperties() {
      return {
        getProperty: (k) => (state.properties.has(k) ? state.properties.get(k) : null),
        setProperty: (k, v) => {
          state.properties.set(String(k), String(v));
        },
        deleteProperty: (k) => {
          state.properties.delete(String(k));
        },
        getProperties: () => Object.fromEntries(state.properties.entries()),
      };
    },
  };

  const Session = {
    getScriptTimeZone: () => 'Etc/UTC',
    getActiveUser: () => ({ getEmail: () => 'owner@sheetautomate.example' }),
    getEffectiveUser: () => ({ getEmail: () => 'owner@sheetautomate.example' }),
  };

  const Utilities = {
    DigestAlgorithm: { SHA_256: 'SHA_256', MD5: 'MD5' },
    Charset: { UTF_8: 'UTF_8' },
    formatDate(dateObj, _tz, format) {
      return formatUtcDate(dateObj, format);
    },
    newBlob(data, contentType, name) {
      return new MockBlob(data, contentType, name);
    },
    computeDigest(algorithm, input) {
      const algoName = algorithm === 'MD5' ? 'md5' : 'sha256';
      const buf = crypto.createHash(algoName).update(String(input), 'utf8').digest();
      return Array.from(buf, (b) => (b > 127 ? b - 256 : b));
    },
  };

  const UrlFetchApp = {
    fetch(url, params = {}) {
      state.fetchCalls.push({ url, params });
      return {
        getResponseCode: () => 200,
        getContentText: () => '{"ok":true}',
      };
    },
  };

  const HtmlService = {
    createHtmlOutput(html) {
      return {
        getContent: () => String(html ?? ''),
        setTitle() {
          return this;
        },
      };
    },
  };

  const Logger = {
    log(msg) {
      state.logs.push(String(msg));
    },
  };

  const sandboxHelpers = {
    seedSheet(tabName, headers, rows = []) {
      const sheet = new MockSheet(tabName, [headers, ...rows]);
      spreadsheet._registerSheet(sheet);
      return sheet;
    },
    seedTemplateDoc(id, name, paragraphs) {
      const doc = new MockDocument(id, name, paragraphs);
      state.docs.set(id, doc);
      state.files.set(id, new MockFile({ id, name, isDoc: true }));
      return doc;
    },
    seedFolder(id, name) {
      const folder = new MockFolder(id, name);
      state.folders.set(id, folder);
      return folder;
    },
    makeGmailMessage({ id, from, subject, attachments = [] }) {
      return {
        getId: () => id,
        getFrom: () => from,
        getSubject: () => subject,
        getAttachments: () =>
          attachments.map((att) => ({
            getName: () => att.name,
            getContentType: () => att.contentType || MimeType.PDF,
            copyBlob: () => new MockBlob(att.content || '%PDF-1.4', att.contentType || MimeType.PDF, att.name),
          })),
      };
    },
  };

  const context = vm.createContext({
    SpreadsheetApp,
    DocumentApp,
    DriveApp,
    MimeType,
    GmailApp,
    MailApp,
    LockService,
    ScriptApp,
    PropertiesService,
    Session,
    Utilities,
    UrlFetchApp,
    HtmlService,
    Logger,
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
  });

  return { context, state, helpers: sandboxHelpers };
}

function loadFlowIntoSandbox(slug, options = {}) {
  const codePath = path.join(FLOWS_DIR, slug, 'Code.gs');
  const code = fs.readFileSync(codePath, 'utf8');
  const sandbox = createGasSandbox(options);
  const script = new vm.Script(code, { filename: `${slug}/Code.gs` });
  script.runInContext(sandbox.context);
  return sandbox;
}

function readSheetHeadersAndSamples(flowJson) {
  const schema = flowJson.sheetSchema || flowJson.setup || {};
  const headers = schema.headers || schema.sheetHeaders;
  const sampleRows = schema.sampleRows || [];
  const tabName = schema.tabName || 'Sheet1';
  return { tabName, headers, sampleRows };
}

function cloneRows(rows) {
  return rows.map((r) => [...r]);
}

function daysAgoIsoDate(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return formatUtcDate(d, 'yyyy-MM-dd');
}

function runWithLockContentionGuard(fn) {
  let caught = null;
  try {
    fn();
  } catch (err) {
    caught = err;
  }
  if (caught) {
    assert.match(caught.message, /lock/i, `Unexpected non-lock error during lock contention: ${caught.message}`);
  }
}

const FLOW_SCENARIOS = {
  'b2b-client-invoice': {
    primaryFn: 'generateApprovedInvoicePdfs',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedTemplateDoc('tpl-1', 'Invoice Template', [
        'Invoice {{Invoice_ID}} for {{Client_Name}} ({{Client_Email}})',
        'Service: {{Service_Description}}',
        'Total: {{Amount_USD}} | Issued: {{Issue_Date}}',
      ]);
      sandbox.helpers.seedFolder('folder-1', 'Invoices Output');
      sandbox.state.properties.set('SA_INVOICE_TEMPLATE_DOC_ID', 'tpl-1');
      sandbox.state.properties.set('SA_INVOICE_OUTPUT_FOLDER_ID', 'folder-1');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][3] = 'Q4 Cloud Retainer ($1,250.00 tier)';
        rows[0][4] = '$1,250.00';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[1]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['INV-BAD-1', '', 'ap@example.com', 'Missing client', '500', 'Approved', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 1);
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.match(String(sheet.getRange(2, 7).getValue()), /^https:\/\/drive\.google\.com/);
      const pdfText = sandbox.state.createdFiles[0]._content;
      assert.ok(pdfText.includes('$1,250.00'), 'Expected literal "$1,250.00" in rendered invoice doc');
      assert.ok(!pdfText.includes('\\$'), 'Unexpected escaped backslash-dollar in rendered invoice doc');
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.match(String(sheet.getRange(3, 8).getValue()), /NEEDS_CORRECTION/);
    },
  },

  'completion-certificate-batch': {
    primaryFn: 'issueApprovedCertificates',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedTemplateDoc('tpl-1', 'Certificate Template', [
        'Certificate {{Certificate_ID}}',
        'Awarded to {{Trainee_Name}} for {{Course_Title}}',
        'Score: {{Score_Pct}} on {{Completion_Date}}',
      ]);
      sandbox.helpers.seedFolder('folder-1', 'Certificates Output');
      sandbox.state.properties.set('SA_CERT_TEMPLATE_DOC_ID', 'tpl-1');
      sandbox.state.properties.set('SA_CERT_OUTPUT_FOLDER_ID', 'folder-1');
      sandbox.state.properties.set('SA_CERT_PASSING_SCORE', '80');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][2] = 'Workspace Security ($1,250.00 Scholarship)';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[1]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['CERT-BAD-1', '', 'Course Title', '90', '2026-11-10', 'Approved', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 1);
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.match(String(sheet.getRange(4, 8).getValue()), /^SKIPPED:/);
      assert.ok(sandbox.state.createdFiles[0]._content.includes('$1,250.00'));
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.match(String(sheet.getRange(3, 8).getValue()), /NEEDS_CORRECTION/);
    },
  },

  'field-service-work-order': {
    primaryFn: 'generateScheduledWorkOrderPdfs',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedTemplateDoc('tpl-1', 'Work Order Template', [
        'Work Order {{Work_Order_ID}} - {{Site_Name}}',
        'Tech: {{Technician_Name}} | Date: {{Scheduled_Date}}',
        'Scope: {{Scope_Of_Work}} | Generated: {{Generated_At}}',
      ]);
      sandbox.helpers.seedFolder('folder-1', 'Work Orders Output');
      sandbox.state.properties.set('SA_WO_TEMPLATE_DOC_ID', 'tpl-1');
      sandbox.state.properties.set('SA_WO_OUTPUT_FOLDER_ID', 'folder-1');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][4] = 'Inspect chiller seals ($1,250.00 parts cap)';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[1]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['WO-BAD-1', '', 'Marcus Vance', '2026-11-18', 'Scope', 'Scheduled', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 1);
      assert.equal(sheet.getRange(2, 6).getValue(), 'Dispatched');
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.ok(sandbox.state.createdFiles[0]._content.includes('$1,250.00'));
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.match(String(sheet.getRange(3, 8).getValue()), /NEEDS_CORRECTION/);
    },
  },

  'form-approval-workflow': {
    primaryFn: 'processApprovalDecisions',
    triggerInstallerFn: 'installApprovalTriggers',
    expectedTriggers: ['handleFormSubmit', 'handleApprovalEdit'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][3] = '$1,250.00';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[2]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['REQ-BAD-1', 'not-an-email', 'Expense', '$100', 'Approved', '', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 1);
      assert.ok(sandbox.state.sentEmails[0].htmlBody.includes('$1,250.00'));
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.ok(String(sheet.getRange(2, 7).getValue()).length > 0);
      // Also exercise handleFormSubmit on a new blank-ID/status row
      sheet.appendRow(['', 'new@example.com', 'Equipment', '$1,250.00', '', '', '', '']);
      sandbox.context.handleFormSubmit({ range: sheet.getRange(sheet.getLastRow(), 1) });
      assert.match(String(sheet.getRange(sheet.getLastRow(), 1).getValue()), /^REQ-/);
      assert.equal(sheet.getRange(sheet.getLastRow(), 5).getValue(), 'PENDING');
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.sentEmails.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 0);
      assert.equal(sheet.getRange(3, 8).getValue(), 'NEEDS_CORRECTION');
    },
  },

  'gmail-invoice-extractor': {
    primaryFn: 'extractGmailInvoices',
    triggerInstallerFn: 'installHourlyGmailTrigger',
    expectedTriggers: ['extractGmailInvoices'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedFolder('folder-1', 'Gmail Invoices');
      sandbox.state.properties.set('SA_GMAIL_ARCHIVE_FOLDER_ID', 'folder-1');

      if (scenario === 'a') {
        sandbox.state.gmailThreads = [
          {
            getMessages: () => [
              sandbox.helpers.makeGmailMessage({
                id: 'msg-new-1250',
                from: 'billing@vendor.example',
                subject: 'Invoice #991 ($1,250.00)',
                attachments: [{ name: 'invoice-991.pdf' }],
              }),
            ],
          },
        ];
        return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
      }
      if (scenario === 'b') {
        sandbox.state.gmailThreads = [
          {
            getMessages: () => [
              sandbox.helpers.makeGmailMessage({
                id: sampleRows[0][1],
                from: 'billing@cloudvendor.example',
                subject: 'Duplicate Invoice',
                attachments: [{ name: 'dup.pdf' }],
              }),
            ],
          },
        ];
        return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        sandbox.state.gmailThreads = [
          {
            getMessages: () => [
              sandbox.helpers.makeGmailMessage({
                id: '',
                from: '',
                subject: 'Blank message id without PDF',
                attachments: [],
              }),
            ],
          },
        ];
        return sandbox.helpers.seedSheet(tabName, headers, [blank]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 1);
      const lastRow = sheet.getLastRow();
      assert.equal(sheet.getRange(lastRow, 2).getValue(), 'msg-new-1250');
      assert.equal(sheet.getRange(lastRow, 4).getValue(), 'Invoice #991 ($1,250.00)');
      assert.equal(sheet.getRange(lastRow, 7).getValue(), 'COMPLETED');
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
  },

  'hr-offer-letter-onboarding': {
    primaryFn: 'generateOfferPacks',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedTemplateDoc('tpl-1', 'Offer Template', [
        'Offer {{CANDIDATE_ID}} for {{CANDIDATE_NAME}}',
        'Role: {{ROLE_TITLE}} starting {{START_DATE}}',
        'Salary: {{BASE_SALARY}} | Date: {{GENERATED_DATE}}',
      ]);
      sandbox.helpers.seedFolder('root-1', 'HR Onboarding');
      sandbox.state.properties.set('OFFER_TEMPLATE_DOC_ID', 'tpl-1');
      sandbox.state.properties.set('ONBOARDING_ROOT_FOLDER_ID', 'root-1');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][4] = '$1,250.00 / wk';
        return sandbox.helpers.seedSheet(tabName, headers, [rows[0], rows[2]]);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[2]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['CAND-BAD-1', 'Missing Role', '', '2026-12-01', '$1,250.00', '', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFolders.length, 1);
      assert.equal(sandbox.state.createdFiles.length, 1);
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.ok(sandbox.state.createdFiles[0]._content.includes('$1,250.00 / wk'));
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFolders.length, 0);
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.equal(sheet.getRange(3, 8).getValue(), 'NEEDS_CORRECTION');
    },
  },

  'inventory-low-stock-alert': {
    primaryFn: 'checkInventoryLevels',
    triggerInstallerFn: 'installDailyStockTrigger',
    expectedTriggers: ['checkInventoryLevels'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.state.properties.set('ALERT_RECIPIENT_EMAIL', 'ops@example.com');
      sandbox.state.properties.set('ALERT_WEBHOOK_URL', 'https://hooks.example.test/low-stock');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][1] = 'Thermal Labels ($1,250.00 Master Pack)';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        const todayStr = formatUtcDate(new Date(), 'yyyy-MM-dd');
        const rows = cloneRows(sampleRows).slice(0, 2);
        rows[0][6] = 'LOW_STOCK';
        rows[0][7] = todayStr;
        rows[1][6] = 'LOW_STOCK';
        rows[1][7] = todayStr;
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['SKU-BAD', '', '-5', '10', '20', '', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 1);
      assert.equal(sandbox.state.fetchCalls.length, 1);
      assert.ok(sandbox.state.sentEmails[0].htmlBody.includes('$1,250.00'));
      assert.equal(sheet.getRange(2, 6).getValue(), 86);
      assert.equal(sheet.getRange(2, 7).getValue(), 'LOW_STOCK');
      assert.equal(sheet.getRange(4, 7).getValue(), 'OK');
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.sentEmails.length, 0);
      assert.equal(sandbox.state.fetchCalls.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 0);
      assert.equal(sheet.getRange(3, 7).getValue(), 'NEEDS_CORRECTION');
    },
  },

  'monthly-ot-sheet-locker': {
    primaryFn: 'provisionNextMonthAndLockPrevious',
    triggerInstallerFn: 'installMonthlyOtTrigger',
    expectedTriggers: ['provisionNextMonthAndLockPrevious'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      const now = new Date();
      const curTab = `OT_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevTab = `OT_${prevDate.getFullYear()}_${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][6] = 'READY ($1,250.00 cap)';
        sandbox.helpers.seedSheet(prevTab, headers, cloneRows(sampleRows));
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
        const curSheet = sandbox.helpers.seedSheet(curTab, headers, cloneRows(sampleRows));
        const prevSheet = sandbox.helpers.seedSheet(prevTab, headers, cloneRows(sampleRows));
        prevSheet.protect().setDescription(`SheetAutomate Monthly Lock - ${prevTab}`);
        return curSheet;
      }
      if (scenario === 'c') {
        // Missing _Template tab -> gracefully logs NEEDS_CORRECTION to Audit_Log
        return sandbox.helpers.seedSheet('Other_Tab', ['Col1'], [['']]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox) {
      const now = new Date();
      const curTab = `OT_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevTab = `OT_${prevDate.getFullYear()}_${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

      const curSheet = sandbox.state.sheets.get(curTab);
      const prevSheet = sandbox.state.sheets.get(prevTab);
      const auditSheet = sandbox.state.sheets.get('Audit_Log');
      assert.ok(curSheet, `Expected ${curTab} to be provisioned`);
      assert.equal(curSheet.getRange(2, 4).getValue(), '');
      assert.equal(prevSheet.getProtections().length, 1);
      assert.equal(auditSheet.getRange(2, 6).getValue(), 'COMPLETED');
    },
    assertScenarioB(sandbox) {
      const auditSheet = sandbox.state.sheets.get('Audit_Log');
      assert.match(String(auditSheet.getRange(2, 2).getValue()), /SKIPPED_ALREADY_EXISTS/);
    },
    assertScenarioC(sandbox) {
      const auditSheet = sandbox.state.sheets.get('Audit_Log');
      assert.match(String(auditSheet.getRange(2, 6).getValue()), /NEEDS_CORRECTION/);
    },
  },

  'multi-item-sales-quote': {
    primaryFn: 'generateMultiItemQuotePdfs',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedTemplateDoc('tpl-1', 'Quote Template', [
        'Quote {{Quote_ID}} for {{Client_Name}} on {{Quote_Date}}',
        '{{LINE_ITEMS_TABLE}}',
        'Grand Total: {{Grand_Total}}',
      ]);
      sandbox.helpers.seedFolder('folder-1', 'Quotes Output');
      sandbox.state.properties.set('SA_QUOTE_TEMPLATE_DOC_ID', 'tpl-1');
      sandbox.state.properties.set('SA_QUOTE_OUTPUT_FOLDER_ID', 'folder-1');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][2] = 'RFID Dock Scanner ($1,250.00 bundle)';
        rows[0][4] = '$1,250.00';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        const rows = cloneRows(sampleRows).slice(0, 2);
        rows[0][6] = 'https://drive.google.com/file/d/done-qt/view';
        rows[0][7] = 'COMPLETED';
        rows[1][6] = 'https://drive.google.com/file/d/done-qt/view';
        rows[1][7] = 'COMPLETED';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['QT-BAD-1', 'Acme', '', '0', '-10', 'Approved', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 1);
      assert.equal(sheet.getRange(2, 8).getValue(), 'COMPLETED');
      assert.equal(sheet.getRange(3, 8).getValue(), 'COMPLETED');
      assert.equal(sheet.getRange(4, 8).getValue(), '');
      assert.ok(sandbox.state.createdFiles[0]._content.includes('$1,250.00'));
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.match(String(sheet.getRange(2, 8).getValue()), /NEEDS_CORRECTION/);
      assert.match(String(sheet.getRange(3, 8).getValue()), /NEEDS_CORRECTION/);
    },
  },

  'overdue-payment-reminder': {
    primaryFn: 'sendOverdueReminders',
    triggerInstallerFn: 'installDailyReminderTrigger',
    expectedTriggers: ['sendOverdueReminders'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][3] = '1250.00';
        rows[0][4] = daysAgoIsoDate(8);
        return sandbox.helpers.seedSheet(tabName, headers, [rows[0], rows[2]]);
      }
      if (scenario === 'b') {
        const rows = cloneRows(sampleRows);
        rows[1][4] = daysAgoIsoDate(20);
        rows[1][6] = 'STAGE_14';
        return sandbox.helpers.seedSheet(tabName, headers, [rows[1], rows[2]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['INV-BAD-1', 'Client', 'bad-email', '0', 'invalid-date', 'UNPAID', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 1);
      assert.ok(sandbox.state.sentEmails[0].subject.includes('$1,250.00'));
      assert.ok(sandbox.state.sentEmails[0].htmlBody.includes('$1,250.00'));
      assert.equal(sheet.getRange(2, 7).getValue(), 'STAGE_7');
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.sentEmails.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 0);
      assert.equal(sheet.getRange(3, 7).getValue(), 'NEEDS_CORRECTION');
    },
  },

  'packing-slip-dispatch': {
    primaryFn: 'generatePackingSlipsAndManifest',
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.helpers.seedFolder('folder-1', 'Dispatch Folder');
      sandbox.state.properties.set('DISPATCH_FOLDER_ID', 'folder-1');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[0][3] = '4x Barcode Scanner Pro ($1,250.00 insured value)';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        return sandbox.helpers.seedSheet(tabName, headers, [cloneRows(sampleRows)[2]]);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['ORD-BAD-1', 'Recipient', '', 'Items', 'TRACK-1', 'READY_TO_SHIP', '', ''];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox, sheet) {
      // 2 packing slips + 1 consolidated manifest
      assert.equal(sandbox.state.createdFiles.length, 3);
      assert.equal(sheet.getRange(2, 6).getValue(), 'SHIPPED');
      assert.equal(sheet.getRange(3, 6).getValue(), 'SHIPPED');
      assert.ok(sandbox.state.createdFiles[0]._content.includes('$1,250.00'));
      const manifestLog = sandbox.state.sheets.get('Dispatch_Manifests');
      assert.ok(manifestLog);
      assert.equal(manifestLog.getRange(2, 3).getValue(), 2);
    },
    assertScenarioB(sandbox) {
      assert.equal(sandbox.state.createdFiles.length, 0);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.createdFiles.length, 0);
      assert.equal(sheet.getRange(3, 6).getValue(), 'NEEDS_CORRECTION');
    },
  },

  'weekly-kpi-digest-mailer': {
    primaryFn: 'sendWeeklyKpiDigest',
    triggerInstallerFn: 'installWeeklyKpiTrigger',
    expectedTriggers: ['sendWeeklyKpiDigest'],
    prepare(sandbox, scenario, { tabName, headers, sampleRows }) {
      sandbox.state.properties.set('STAKEHOLDER_EMAILS', 'exec@example.com');

      if (scenario === 'a') {
        const rows = cloneRows(sampleRows);
        rows[2][2] = '1250.00';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'b') {
        const rows = cloneRows(sampleRows);
        rows[2][2] = '1250.00';
        return sandbox.helpers.seedSheet(tabName, headers, rows);
      }
      if (scenario === 'c') {
        const blank = new Array(headers.length).fill('');
        const invalid = ['2026-W46', '', '-100', '50', '1', '2', 'READY'];
        return sandbox.helpers.seedSheet(tabName, headers, [blank, invalid]);
      }
      return sandbox.helpers.seedSheet(tabName, headers, cloneRows(sampleRows));
    },
    assertScenarioA(sandbox) {
      assert.equal(sandbox.state.sentEmails.length, 1);
      assert.ok(sandbox.state.sentEmails[0].htmlBody.includes('$1,250.00'));
      const auditSheet = sandbox.state.sheets.get('Digest_Audit');
      assert.ok(auditSheet);
      assert.equal(auditSheet.getRange(2, 7).getValue(), 'COMPLETED');
    },
    assertScenarioB(sandbox) {
      // Run once to record Run_Hash in Digest_Audit, then run again to assert idempotent skip
      sandbox.context.sendWeeklyKpiDigest();
      assert.equal(sandbox.state.sentEmails.length, 1);
      sandbox.context.sendWeeklyKpiDigest();
      assert.equal(sandbox.state.sentEmails.length, 1);
    },
    assertScenarioC(sandbox, sheet) {
      assert.equal(sandbox.state.sentEmails.length, 0);
      assert.equal(sheet.getRange(3, 7).getValue(), 'NEEDS_CORRECTION');
    },
  },
};

const flowSlugs = discoverFlowSlugs();

test('discovers all 12+ flows under flows/', () => {
  assert.ok(flowSlugs.length >= 12, `Expected at least 12 flows, found ${flowSlugs.length}`);
  for (const slug of flowSlugs) {
    assert.ok(
      FLOW_SCENARIOS[slug],
      `Missing runtime scenario mapping for discovered flow "${slug}" in tests/flows-runtime.test.mjs`
    );
  }
});

for (const slug of flowSlugs) {
  const spec = FLOW_SCENARIOS[slug];
  const flowDir = path.join(FLOWS_DIR, slug);
  const flowJson = JSON.parse(fs.readFileSync(path.join(flowDir, 'flow.json'), 'utf8'));
  const appsscript = JSON.parse(fs.readFileSync(path.join(flowDir, 'appsscript.json'), 'utf8'));
  const code = fs.readFileSync(path.join(flowDir, 'Code.gs'), 'utf8');
  const schemaInfo = readSheetHeadersAndSamples(flowJson);

  test(`[${slug}] syntax compiles with vm.Script, runtimeVersion is V8, and onOpen registers menu items`, () => {
    assert.equal(appsscript.runtimeVersion, 'V8');
    assert.doesNotThrow(() => new vm.Script(code, { filename: `${slug}/Code.gs` }));

    const sandbox = loadFlowIntoSandbox(slug);
    assert.equal(typeof sandbox.context.onOpen, 'function', 'onOpen() must be defined');
    sandbox.context.onOpen();

    assert.ok(sandbox.state.menus.length >= 1, 'onOpen() must register at least one menu');
    const menu = sandbox.state.menus[0];
    assert.equal(menu.addedToUi, true);
    assert.ok(menu.items.length >= 2, 'Menu should register at least 2 items');
    for (const item of menu.items) {
      assert.equal(
        typeof sandbox.context[item.fnName],
        'function',
        `Menu item "${item.caption}" references missing function "${item.fnName}"`
      );
    }

    if (spec.triggerInstallerFn) {
      assert.equal(typeof sandbox.context[spec.triggerInstallerFn], 'function');
      sandbox.context[spec.triggerInstallerFn]();
      sandbox.context[spec.triggerInstallerFn]();
      const installedNames = sandbox.state.triggers.map((t) => t.getHandlerFunction()).sort();
      assert.deepEqual(installedNames, [...spec.expectedTriggers].sort());
    }
  });

  test(`[${slug}] (a) valid row execution with currency/dollar string '$1,250.00'`, () => {
    const sandbox = loadFlowIntoSandbox(slug);
    const sheet = spec.prepare(sandbox, 'a', schemaInfo);
    sandbox.context[spec.primaryFn]();
    assert.equal(sandbox.state.lock.acquired, 1);
    assert.equal(sandbox.state.lock.released, 1);
    spec.assertScenarioA(sandbox, sheet);
  });

  test(`[${slug}] (b) duplicate / idempotency guard skips re-emission`, () => {
    const sandbox = loadFlowIntoSandbox(slug);
    const sheet = spec.prepare(sandbox, 'b', schemaInfo);
    if (slug !== 'weekly-kpi-digest-mailer') {
      sandbox.context[spec.primaryFn]();
    }
    spec.assertScenarioB(sandbox, sheet);
    assert.equal(sandbox.state.lock.acquired, sandbox.state.lock.released);
  });

  test(`[${slug}] (c) missing required input & blank row handled gracefully`, () => {
    const sandbox = loadFlowIntoSandbox(slug);
    const sheet = spec.prepare(sandbox, 'c', schemaInfo);
    assert.doesNotThrow(() => sandbox.context[spec.primaryFn]());
    spec.assertScenarioC(sandbox, sheet);
    assert.equal(sandbox.state.lock.acquired, sandbox.state.lock.released);
  });

  test(`[${slug}] (d) concurrent lock contention exits safely without side effects`, () => {
    const sandbox = loadFlowIntoSandbox(slug, { lockAvailable: false });
    spec.prepare(sandbox, 'd', schemaInfo);
    const writesBefore = sandbox.state.sheetWrites;
    runWithLockContentionGuard(() => sandbox.context[spec.primaryFn]());
    assert.equal(sandbox.state.lock.attempts, 1);
    assert.equal(sandbox.state.lock.acquired, 0);
    assert.equal(sandbox.state.lock.released, 0);
    assert.equal(sandbox.state.createdFiles.length, 0);
    assert.equal(sandbox.state.createdFolders.length, 0);
    assert.equal(sandbox.state.sentEmails.length, 0);
    assert.equal(sandbox.state.fetchCalls.length, 0);
    assert.equal(sandbox.state.sheetWrites, writesBefore);
  });
}
