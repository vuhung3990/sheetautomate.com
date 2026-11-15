#!/usr/bin/env node
/**
 * validate-flows.mjs
 * Validates every automation flow under flows/<slug>/ against schema,
 * least-privilege OAuth scope rules, static security gates, and SVG safety.
 * Zero external dependencies (Node 20+ ESM).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_FLOWS_DIR = path.join(ROOT_DIR, 'flows');

function parseArgs(argv) {
  let flowsDir = DEFAULT_FLOWS_DIR;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--flows-dir') {
      if (i + 1 >= argv.length) {
        console.error('ERROR: --flows-dir requires a directory path argument');
        process.exit(1);
      }
      flowsDir = path.resolve(process.cwd(), argv[++i]);
    } else if (arg.startsWith('--flows-dir=')) {
      const value = arg.slice('--flows-dir='.length);
      if (!value) {
        console.error('ERROR: --flows-dir requires a directory path argument');
        process.exit(1);
      }
      flowsDir = path.resolve(process.cwd(), value);
    }
  }
  return { flowsDir };
}

const REQUIRED_FILES = [
  'flow.json',
  'Code.gs',
  'appsscript.json',
  'thumbnail.svg',
  'README.md',
];

const VALID_CATEGORIES = new Set([
  'Document & PDF',
  'Email & Gmail',
  'Finance & Ops',
  'HR & Team',
  'Alerts & Sync',
]);

const VALID_DIFFICULTIES = new Set(['Beginner', 'Intermediate']);

const VALID_SERVICES = new Set([
  'Sheets',
  'Docs',
  'Drive',
  'Gmail',
  'Forms',
  'Chat/Webhook',
]);

const VALID_OUTPUT_TYPES = new Set([
  'pdf-document',
  'email-dispatch',
  'sheet-ops',
  'alert-webhook',
]);

const EXPECTED_FIELD_KEYS = ['field1', 'field2', 'field3', 'field4'];

const FORBIDDEN_SCOPES = new Set([
  'https://mail.google.com/',
  'https://mail.google.com',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.scripts',
]);

const ALLOWED_LEAST_PRIVILEGE_SCOPES = new Set([
  'https://www.googleapis.com/auth/spreadsheets.currentonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents.currentonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/script.send_mail',
  'https://www.googleapis.com/auth/script.external_request',
  'https://www.googleapis.com/auth/script.scriptapp',
  'https://www.googleapis.com/auth/forms.currentonly',
  'https://www.googleapis.com/auth/forms',
  'https://www.googleapis.com/auth/userinfo.email',
]);

/**
 * Strip JS single-line and multi-line comments while preserving string literals
 * so JSDoc license headers or comments do not trigger false security positives.
 */
function stripJsComments(source) {
  let out = '';
  let i = 0;
  const n = source.length;
  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    // String or template literal
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      while (i < n) {
        const c = source[i];
        out += c;
        if (c === '\\') {
          i++;
          if (i < n) {
            out += source[i];
            i++;
          }
          continue;
        }
        if (c === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // Line comment
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < n && source[i] !== '\n') i++;
      continue;
    }

    // Block comment
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      out += ' ';
      continue;
    }

    out += ch;
    i++;
  }
  return out;
}

function validateFlowJson(slug, data, errors) {
  const requiredKeys = [
    'id',
    'title',
    'shortDescription',
    'category',
    'tags',
    'trigger',
    'difficulty',
    'timeSavedPerWeek',
    'featured',
    'copySheetUrl',
    'services',
    'setupSteps',
    'sheetSchema',
    'demo',
  ];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('flow.json must be a JSON object');
    return;
  }

  for (const key of requiredKeys) {
    if (!(key in data)) {
      errors.push(`flow.json missing required property "${key}"`);
    }
  }

  if (typeof data.id !== 'string' || !/^[a-z0-9-]+$/.test(data.id)) {
    errors.push(`flow.json "id" must match ^[a-z0-9-]+$ (got "${data.id}")`);
  } else if (data.id !== slug) {
    errors.push(`flow.json "id" ("${data.id}") does not match folder name "${slug}"`);
  }

  if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 70) {
    errors.push(`flow.json "title" must be a string between 5 and 70 chars`);
  }

  if (
    typeof data.shortDescription !== 'string' ||
    data.shortDescription.length < 20 ||
    data.shortDescription.length > 200
  ) {
    errors.push(`flow.json "shortDescription" must be a string between 20 and 200 chars`);
  }

  if (!VALID_CATEGORIES.has(data.category)) {
    errors.push(`flow.json "category" invalid ("${data.category}")`);
  }

  if (
    !Array.isArray(data.tags) ||
    data.tags.length < 2 ||
    data.tags.length > 5 ||
    !data.tags.every((t) => typeof t === 'string' && t.trim().length > 0)
  ) {
    errors.push('flow.json "tags" must be an array of 2-5 non-empty strings');
  }

  if (typeof data.trigger !== 'string' || data.trigger.length < 3) {
    errors.push('flow.json "trigger" must be a string with minLength 3');
  }

  if (!VALID_DIFFICULTIES.has(data.difficulty)) {
    errors.push(`flow.json "difficulty" invalid ("${data.difficulty}")`);
  }

  if (typeof data.timeSavedPerWeek !== 'string' || data.timeSavedPerWeek.length < 3) {
    errors.push('flow.json "timeSavedPerWeek" must be a string with minLength 3');
  }

  if (typeof data.featured !== 'boolean') {
    errors.push('flow.json "featured" must be a boolean');
  }

  if (typeof data.copySheetUrl !== 'string') {
    errors.push('flow.json "copySheetUrl" must be a string');
  }

  if (
    !Array.isArray(data.services) ||
    data.services.length < 1 ||
    !data.services.every((s) => VALID_SERVICES.has(s))
  ) {
    errors.push('flow.json "services" must be a non-empty array of valid Workspace services');
  }

  if (
    !Array.isArray(data.setupSteps) ||
    data.setupSteps.length !== 3 ||
    !data.setupSteps.every((s) => typeof s === 'string' && s.trim().length > 0)
  ) {
    errors.push('flow.json "setupSteps" must contain exactly 3 non-empty strings');
  }

  // sheetSchema
  const schema = data.sheetSchema;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push('flow.json "sheetSchema" must be an object');
  } else {
    if (typeof schema.tabName !== 'string' || schema.tabName.length < 1) {
      errors.push('flow.json "sheetSchema.tabName" must be a non-empty string');
    }
    if (
      !Array.isArray(schema.headers) ||
      schema.headers.length < 3 ||
      !schema.headers.every((h) => typeof h === 'string' && h.trim().length > 0)
    ) {
      errors.push('flow.json "sheetSchema.headers" must be an array of at least 3 strings');
    } else if (!Array.isArray(schema.sampleRows) || schema.sampleRows.length < 1) {
      errors.push('flow.json "sheetSchema.sampleRows" must have at least 1 row');
    } else {
      schema.sampleRows.forEach((row, idx) => {
        if (!Array.isArray(row)) {
          errors.push(`flow.json "sheetSchema.sampleRows[${idx}]" must be an array`);
        } else if (row.length !== schema.headers.length) {
          errors.push(
            `flow.json "sheetSchema.sampleRows[${idx}]" length (${row.length}) does not match headers length (${schema.headers.length})`
          );
        } else if (!row.every((cell) => typeof cell === 'string')) {
          errors.push(`flow.json "sheetSchema.sampleRows[${idx}]" cells must all be strings`);
        }
      });
    }
  }

  // demo
  const demo = data.demo;
  if (!demo || typeof demo !== 'object' || Array.isArray(demo)) {
    errors.push('flow.json "demo" must be an object');
  } else {
    if (typeof demo.recordId !== 'string' || demo.recordId.length < 2) {
      errors.push('flow.json "demo.recordId" must be a string with minLength 2');
    }
    if (!VALID_OUTPUT_TYPES.has(demo.outputType)) {
      errors.push(`flow.json "demo.outputType" invalid ("${demo.outputType}")`);
    }
    for (const k of ['outputTitle', 'outputSubtitle', 'auditColumn']) {
      if (typeof demo[k] !== 'string' || demo[k].length === 0) {
        errors.push(`flow.json "demo.${k}" must be a non-empty string`);
      }
    }
    if (!Array.isArray(demo.fields) || demo.fields.length !== 4) {
      errors.push('flow.json "demo.fields" must contain exactly 4 fields');
    } else {
      const keysSeen = demo.fields.map((f) => f?.key);
      for (let i = 0; i < EXPECTED_FIELD_KEYS.length; i++) {
        const expectedKey = EXPECTED_FIELD_KEYS[i];
        const field = demo.fields[i];
        if (!field || typeof field !== 'object') {
          errors.push(`flow.json "demo.fields[${i}]" must be an object`);
          continue;
        }
        if (field.key !== expectedKey) {
          errors.push(
            `flow.json "demo.fields[${i}].key" must be "${expectedKey}" (got "${field.key}")`
          );
        }
        if (typeof field.label !== 'string' || field.label.length === 0) {
          errors.push(`flow.json "demo.fields[${i}].label" must be a non-empty string`);
        }
        if (typeof field.defaultValue !== 'string') {
          errors.push(`flow.json "demo.fields[${i}].defaultValue" must be a string`);
        }
      }
      const field1 = demo.fields.find((f) => f?.key === 'field1');
      if (!field1 || field1.required !== true) {
        errors.push('flow.json "demo.fields" field1 must have required === true');
      }
      if (new Set(keysSeen).size !== 4) {
        errors.push('flow.json "demo.fields" must have unique keys field1..field4');
      }
    }
  }
}

function validateAppsScriptJson(manifest, errors, warnings) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push('appsscript.json must be a JSON object');
    return 0;
  }

  if (manifest.runtimeVersion !== 'V8') {
    errors.push(`appsscript.json "runtimeVersion" must be "V8" (got "${manifest.runtimeVersion}")`);
  }

  if (!Array.isArray(manifest.oauthScopes) || manifest.oauthScopes.length === 0) {
    errors.push('appsscript.json "oauthScopes" must be a non-empty array');
    return 0;
  }

  for (const scope of manifest.oauthScopes) {
    if (typeof scope !== 'string' || !scope.startsWith('https://')) {
      errors.push(`appsscript.json invalid OAuth scope "${scope}"`);
      continue;
    }
    const normalized = scope.trim();
    if (FORBIDDEN_SCOPES.has(normalized)) {
      errors.push(`appsscript.json contains overly broad OAuth scope "${normalized}"`);
    } else if (!ALLOWED_LEAST_PRIVILEGE_SCOPES.has(normalized)) {
      warnings.push(`appsscript.json uses non-standard OAuth scope "${normalized}" — verify least-privilege`);
    }
  }

  return manifest.oauthScopes.length;
}

function validateCodeGs(code, errors, warnings) {
  if (!code || code.trim().length < 50) {
    errors.push('Code.gs is empty or too short');
    return { hasOnOpen: false, hasLockService: false };
  }

  const stripped = stripJsComments(code);

  const dangerousPatterns = [
    { regex: /\beval\s*\(/, msg: 'Code.gs uses forbidden eval(' },
    { regex: /\bnew\s+Function\s*\(/, msg: 'Code.gs uses forbidden new Function(' },
    { regex: /\bdocument\.write\s*\(/, msg: 'Code.gs uses forbidden document.write(' },
    {
      regex: /\bset(?:Timeout|Interval)\s*\(\s*['"`]/,
      msg: 'Code.gs uses forbidden string-evaluated setTimeout/setInterval',
    },
  ];

  for (const { regex, msg } of dangerousPatterns) {
    if (regex.test(stripped)) {
      errors.push(msg);
    }
  }

  if (/Utilities\.base64Decode/i.test(stripped) && /\beval\s*\(/i.test(stripped)) {
    errors.push('Code.gs combines Utilities.base64Decode with eval(');
  }

  // Reject hardcoded external URLs passed directly into UrlFetchApp.fetch('http...')
  const urlFetchLiteralRegex = /UrlFetchApp\.fetch\s*\(\s*(['"`])(https?:\/\/[^'"`]+)\1/gi;
  let match;
  while ((match = urlFetchLiteralRegex.exec(stripped)) !== null) {
    const url = match[2];
    const isGoogleHttps =
      url.startsWith('https://') &&
      /^https:\/\/([a-z0-9-]+\.)?(googleapis\.com|google\.com|gstatic\.com)(\/|$)/i.test(url);
    if (!isGoogleHttps) {
      errors.push(`Code.gs contains hardcoded external UrlFetchApp.fetch URL: "${url}"`);
    }
  }

  const hasOnOpen = /\bonOpen\s*\(/.test(stripped);
  const hasLockService = /\bLockService\b/.test(stripped);

  if (!hasOnOpen) {
    errors.push('Code.gs missing onOpen() menu handler');
  }
  if (!hasLockService) {
    errors.push('Code.gs missing LockService concurrency guard');
  }

  return { hasOnOpen, hasLockService };
}

function validateSvg(svg, errors) {
  if (!svg || !svg.includes('<svg') || !svg.includes('</svg>')) {
    errors.push('thumbnail.svg missing <svg> or </svg> tag');
    return;
  }
  if (/<script\b/i.test(svg)) {
    errors.push('thumbnail.svg contains forbidden <script tag');
  }
  if (/\bonload\s*=/i.test(svg) || /\bonerror\s*=/i.test(svg)) {
    errors.push('thumbnail.svg contains forbidden inline event handler (onload=/onerror=)');
  }
  if (/javascript:/i.test(svg)) {
    errors.push('thumbnail.svg contains forbidden javascript: URI');
  }
  if (/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u.test(svg)) {
    errors.push('thumbnail.svg contains forbidden emoji character(s)');
  }
}

function main() {
  const { flowsDir } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(flowsDir)) {
    console.error(`ERROR: flows directory not found at ${flowsDir}`);
    process.exit(1);
  }

  const entries = fs
    .readdirSync(flowsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();

  if (entries.length === 0) {
    console.error(`ERROR: No flow directories found in ${flowsDir}`);
    process.exit(1);
  }

  const results = [];
  let totalErrors = 0;

  for (const slug of entries) {
    const flowDir = path.join(flowsDir, slug);
    const errors = [];
    const warnings = [];
    let scopesCount = 0;
    let codeChecks = { hasOnOpen: false, hasLockService: false };

    for (const file of REQUIRED_FILES) {
      const filePath = path.join(flowDir, file);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        errors.push(`Missing required file: ${file}`);
      }
    }

    if (errors.length === 0) {
      // flow.json
      try {
        const flowJson = JSON.parse(fs.readFileSync(path.join(flowDir, 'flow.json'), 'utf8'));
        validateFlowJson(slug, flowJson, errors);
      } catch (err) {
        errors.push(`Invalid JSON in flow.json: ${err.message}`);
      }

      // appsscript.json
      try {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(flowDir, 'appsscript.json'), 'utf8')
        );
        scopesCount = validateAppsScriptJson(manifest, errors, warnings);
      } catch (err) {
        errors.push(`Invalid JSON in appsscript.json: ${err.message}`);
      }

      // Code.gs
      const code = fs.readFileSync(path.join(flowDir, 'Code.gs'), 'utf8');
      codeChecks = validateCodeGs(code, errors, warnings);

      // thumbnail.svg
      const svg = fs.readFileSync(path.join(flowDir, 'thumbnail.svg'), 'utf8');
      validateSvg(svg, errors);

      // README.md
      const readme = fs.readFileSync(path.join(flowDir, 'README.md'), 'utf8');
      if (readme.trim().length < 40) {
        errors.push('README.md is empty or too brief');
      }
    }

    totalErrors += errors.length;
    results.push({
      slug,
      scopesCount,
      hasOnOpen: codeChecks.hasOnOpen,
      hasLockService: codeChecks.hasLockService,
      warnings,
      errors,
    });
  }

  console.log('\n=== SheetAutomate Flow Validation Summary ===\n');
  console.log(
    `${'Flow Slug'.padEnd(32)} ${'Scopes'.padEnd(8)} ${'onOpen'.padEnd(8)} ${'Lock'.padEnd(8)} Status`
  );
  console.log('-'.repeat(72));

  for (const r of results) {
    const statusText =
      r.errors.length > 0
        ? `FAIL (${r.errors.length} errors)`
        : r.warnings.length > 0
          ? `PASS (WARN: ${r.warnings.length})`
          : 'PASS';

    console.log(
      `${r.slug.padEnd(32)} ${String(r.scopesCount).padEnd(8)} ${(r.hasOnOpen ? 'OK' : 'FAIL').padEnd(8)} ${(r.hasLockService ? 'OK' : 'FAIL').padEnd(8)} ${statusText}`
    );

    for (const w of r.warnings) {
      console.log(`  [WARN] ${w}`);
    }
    for (const e of r.errors) {
      console.error(`  [ERROR] ${e}`);
    }
  }

  console.log('-'.repeat(72));
  console.log(`Total flows validated: ${results.length} | Errors: ${totalErrors}\n`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
