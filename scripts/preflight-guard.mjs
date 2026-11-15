#!/usr/bin/env node
/**
 * preflight-guard.mjs
 * Accident-prevention guardrails for local development, commits, CI, and deployment.
 * Zero external dependencies (Node 20+ ESM).
 *
 * Usage:
 *   node scripts/preflight-guard.mjs [--mode=dev|commit|ci|deploy] [--target-dir <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');

const VALID_MODES = new Set(['dev', 'commit', 'ci', 'deploy']);
const MAX_JS_CHUNK_BYTES = 380 * 1024;
const MAX_SCAN_FILE_BYTES = 2 * 1024 * 1024;

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  '.wrangler',
  'reports',
  '.vite',
  'playwright-report',
  'test-results',
]);

const BINARY_EXTENSIONS = new Set([
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.pdf',
  '.mp4',
  '.webm',
  '.wasm',
]);

const CODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.gs']);

const SECRET_PATTERNS = [
  { name: 'GitHub classic PAT', regex: /\bghp_[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub fine-grained PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { name: 'OpenAI API key', regex: /\bsk-(?:proj-)?[A-Za-z0-9]{30,}\b/ },
  { name: 'Private key block', regex: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/ },
];

const REQUIRED_DIST_FILES = [
  'index.html',
  '_headers',
  '_redirects',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'og-image.png',
  'flows-manifest.json',
  'badges/virustotal.svg',
  'badges/ai-security.svg',
  'badges/flows-count.svg',
  'downloads/sheetautomate-chrome-extension.zip',
];

function parseArgs(argv) {
  let mode = 'ci';
  let targetDir = DEFAULT_ROOT;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--mode=')) {
      mode = arg.slice('--mode='.length).trim();
    } else if (arg === '--mode' && i + 1 < argv.length) {
      mode = argv[++i].trim();
    } else if (arg.startsWith('--target-dir=')) {
      targetDir = path.resolve(arg.slice('--target-dir='.length));
    } else if (arg === '--target-dir' && i + 1 < argv.length) {
      targetDir = path.resolve(argv[++i]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: node scripts/preflight-guard.mjs [--mode=dev|commit|ci|deploy] [--target-dir <dir>]'
      );
      process.exit(0);
    }
  }

  if (!VALID_MODES.has(mode)) {
    console.error(
      `ERROR: Invalid --mode "${mode}". Expected one of: ${Array.from(VALID_MODES).join(', ')}.`
    );
    process.exit(2);
  }

  return { mode, targetDir };
}

function toPosix(relPath) {
  return relPath.split(path.sep).join('/');
}

function walkWorkspace(rootDir) {
  const files = [];

  function visit(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = toPosix(path.relative(rootDir, fullPath));

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) {
          continue;
        }
        visit(fullPath);
      } else if (entry.isFile()) {
        files.push({ fullPath, relPath, name: entry.name });
      }
    }
  }

  visit(rootDir);
  return files;
}

function getGitTrackedFiles(targetDir) {
  if (!fs.existsSync(path.join(targetDir, '.git'))) {
    return new Set();
  }
  try {
    const stdout = execFileSync('git', ['ls-files', '-z'], {
      cwd: targetDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(stdout.split('\0').filter(Boolean));
  } catch {
    return new Set();
  }
}

function isBinaryBuffer(buf) {
  const sampleLen = Math.min(buf.length, 4096);
  for (let i = 0; i < sampleLen; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

function readTextFileSafe(fullPath) {
  const stat = fs.statSync(fullPath);
  if (stat.size > MAX_SCAN_FILE_BYTES) {
    return null;
  }
  const buf = fs.readFileSync(fullPath);
  if (isBinaryBuffer(buf)) {
    return null;
  }
  return buf.toString('utf8');
}

function isDotEnvFile(basename) {
  if (basename !== '.env' && !basename.startsWith('.env.')) {
    return false;
  }
  const lower = basename.toLowerCase();
  if (
    lower === '.env.example' ||
    lower.endsWith('.example') ||
    lower.endsWith('.sample') ||
    lower.endsWith('.template')
  ) {
    return false;
  }
  return true;
}

function isPlaceholderEnvValue(val) {
  const trimmed = val.trim().replace(/^['"]|['"]$/g, '').trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return (
    lower === 'changeme' ||
    lower === 'example' ||
    lower === 'placeholder' ||
    lower.startsWith('your_') ||
    lower.startsWith('replace_') ||
    (trimmed.startsWith('<') && trimmed.endsWith('>'))
  );
}

function checkSecretLeaks(targetDir, workspaceFiles, trackedSet) {
  const errors = [];

  for (const file of workspaceFiles) {
    const ext = path.extname(file.name).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      continue;
    }

    const content = readTextFileSafe(file.fullPath);
    if (content === null) {
      continue;
    }

    const lines = content.split(/\r?\n/);

    // Check token and private-key patterns across all text files
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          errors.push(
            `Secret leak (${pattern.name}) detected at ${file.relPath}:${idx + 1}`
          );
        }
      }
    }

    // Check .env* files (excluding .env.example)
    if (isDotEnvFile(file.name)) {
      if (trackedSet.has(file.relPath)) {
        errors.push(
          `Tracked environment file detected at ${file.relPath} (remove from git tracking; only .env.example may be committed)`
        );
      }
      for (let idx = 0; idx < lines.length; idx++) {
        const raw = lines[idx].trim();
        if (!raw || raw.startsWith('#')) continue;
        const eqIdx = raw.indexOf('=');
        if (eqIdx === -1) continue;
        const key = raw.slice(0, eqIdx).trim();
        const val = raw.slice(eqIdx + 1).trim();
        if (isPlaceholderEnvValue(val)) continue;
        if (/(SECRET|TOKEN|KEY|PASSWORD|PASS|AUTH|CREDENTIAL|PRIVATE|API)/i.test(key)) {
          errors.push(
            `Secret value in ${file.relPath}:${idx + 1} for key "${key}" (remove secrets from workspace .env files)`
          );
        }
      }
    }
  }

  return {
    name: 'Secret Leak Guard',
    passed: errors.length === 0,
    errors,
    details: `Scanned ${workspaceFiles.length} workspace entries`,
  };
}

function findDebuggerStatements(source) {
  const hits = [];
  let line = 1;
  let i = 0;
  const n = source.length;
  let codeBuf = '';

  const flushLine = () => {
    if (/(?:^|[^\w$.])debugger(?:\s*;|\s*$)/.test(codeBuf)) {
      hits.push(line);
    }
    codeBuf = '';
  };

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '\n') {
      flushLine();
      line++;
      i++;
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
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') {
          flushLine();
          line++;
        }
        i++;
      }
      i += 2;
      codeBuf += ' ';
      continue;
    }

    // String / template literals
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      codeBuf += ' ';
      i++;
      while (i < n) {
        const c = source[i];
        if (c === '\\') {
          i += 2;
          continue;
        }
        if (c === '\n') {
          flushLine();
          line++;
        }
        if (c === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    codeBuf += ch;
    i++;
  }
  flushLine();
  return hits;
}

function checkConflictsAndDebugLeaks(workspaceFiles) {
  const errors = [];

  for (const file of workspaceFiles) {
    if (file.name === 'package-lock.json' && file.relPath !== 'web/package-lock.json') {
      errors.push(
        `Unexpected lockfile outside web/: ${file.relPath} (only web/package-lock.json is allowed)`
      );
      continue;
    }

    const ext = path.extname(file.name).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext) || file.name === 'package-lock.json') {
      continue;
    }

    const content = readTextFileSafe(file.fullPath);
    if (content === null) {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      if (/^<{7}(?:\s|$)/.test(line) || /^={7}$/.test(line) || /^>{7}(?:\s|$)/.test(line)) {
        errors.push(`Git merge conflict marker at ${file.relPath}:${idx + 1}`);
      }
    }

    if (CODE_EXTENSIONS.has(ext)) {
      const debuggerLines = findDebuggerStatements(content);
      for (const ln of debuggerLines) {
        errors.push(`Stray debugger statement detected at ${file.relPath}:${ln}`);
      }
    }
  }

  return {
    name: 'Merge Conflict & Debug Leak Guard',
    passed: errors.length === 0,
    errors,
    details: 'Checked conflict markers, debugger statements, and lockfile placement',
  };
}

function diffDependencyMap(label, expectedMap = {}, actualMap = {}) {
  const diffs = [];
  const expectedKeys = Object.keys(expectedMap).sort();
  const actualKeys = Object.keys(actualMap).sort();

  for (const key of expectedKeys) {
    if (!(key in actualMap)) {
      diffs.push(`${label}: missing "${key}" in web/package-lock.json`);
    } else if (expectedMap[key] !== actualMap[key]) {
      diffs.push(
        `${label}: version mismatch for "${key}" (package.json="${expectedMap[key]}", package-lock.json="${actualMap[key]}")`
      );
    }
  }
  for (const key of actualKeys) {
    if (!(key in expectedMap)) {
      diffs.push(`${label}: extra "${key}" in web/package-lock.json not in web/package.json`);
    }
  }
  return diffs;
}

function checkLockfileAndBundleSync(targetDir) {
  const errors = [];

  // 1. Lockfile sync
  const pkgPath = path.join(targetDir, 'web', 'package.json');
  const lockPath = path.join(targetDir, 'web', 'package-lock.json');
  if (!fs.existsSync(pkgPath)) {
    errors.push('Missing web/package.json');
  } else if (!fs.existsSync(lockPath)) {
    errors.push('Missing web/package-lock.json');
  } else {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      const rootLockEntry = lock?.packages?.[''];
      if (!rootLockEntry) {
        errors.push('web/package-lock.json is missing packages[""] root entry');
      } else {
        errors.push(
          ...diffDependencyMap('dependencies', pkg.dependencies, rootLockEntry.dependencies)
        );
        errors.push(
          ...diffDependencyMap(
            'devDependencies',
            pkg.devDependencies,
            rootLockEntry.devDependencies
          )
        );
      }
    } catch (err) {
      errors.push(`Failed to parse web/package.json or web/package-lock.json: ${err.message}`);
    }
  }

  // 2. Flows directory vs web/public/flows-manifest.json & extension/flows-bundle.json
  const flowsDir = path.join(targetDir, 'flows');
  let flowDirs = [];
  if (!fs.existsSync(flowsDir)) {
    errors.push('Missing flows/ directory');
  } else {
    flowDirs = fs
      .readdirSync(flowsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort();
    if (flowDirs.length === 0) {
      errors.push('No flow directories found in flows/');
    }
  }

  const bundlePaths = [
    'web/public/flows-manifest.json',
    'extension/flows-bundle.json',
  ];
  for (const rel of bundlePaths) {
    const full = path.join(targetDir, rel);
    if (!fs.existsSync(full)) {
      errors.push(`Missing ${rel} (run node scripts/build-flows-manifest.mjs)`);
      continue;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (!Array.isArray(parsed.flows)) {
        errors.push(`${rel} must contain a "flows" array`);
      } else if (flowDirs.length > 0 && parsed.flows.length !== flowDirs.length) {
        errors.push(
          `${rel} flow count mismatch: expected ${flowDirs.length} (from flows/), found ${parsed.flows.length}`
        );
      }
      if (flowDirs.length > 0 && parsed.totalFlows !== flowDirs.length) {
        errors.push(
          `${rel} totalFlows mismatch: expected ${flowDirs.length}, found ${parsed.totalFlows}`
        );
      }
    } catch (err) {
      errors.push(`Invalid JSON in ${rel}: ${err.message}`);
    }
  }

  // 3. Extension MV3 manifest + syntax check
  const extManifestPath = path.join(targetDir, 'extension', 'manifest.json');
  if (!fs.existsSync(extManifestPath)) {
    errors.push('Missing extension/manifest.json');
  } else {
    try {
      const extManifest = JSON.parse(fs.readFileSync(extManifestPath, 'utf8'));
      if (extManifest.manifest_version !== 3) {
        errors.push(
          `extension/manifest.json must declare manifest_version === 3 (got ${extManifest.manifest_version})`
        );
      }
    } catch (err) {
      errors.push(`Invalid JSON in extension/manifest.json: ${err.message}`);
    }
  }

  for (const jsRel of ['extension/popup.js', 'extension/content-sheets.js']) {
    const jsPath = path.join(targetDir, jsRel);
    if (!fs.existsSync(jsPath)) {
      errors.push(`Missing ${jsRel}`);
      continue;
    }
    try {
      const source = fs.readFileSync(jsPath, 'utf8');
      new vm.Script(source, { filename: jsRel });
    } catch (err) {
      errors.push(`Syntax error in ${jsRel}: ${err.message}`);
    }
  }

  return {
    name: 'Lockfile & Bundle Sync Guard',
    passed: errors.length === 0,
    errors,
    details: `${flowDirs.length} flow directories verified against manifest, bundle, lockfile & MV3 scripts`,
  };
}

function checkDeployArtifacts(targetDir) {
  const errors = [];
  const distDir = path.join(targetDir, 'web', 'dist');

  if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
    errors.push('Missing web/dist directory (run cd web && npm run build)');
    return {
      name: 'Deploy Artifact Guard',
      passed: false,
      errors,
      details: 'web/dist directory not found',
    };
  }

  for (const rel of REQUIRED_DIST_FILES) {
    const full = path.join(distDir, rel);
    if (!fs.existsSync(full)) {
      errors.push(`Missing required build artifact: web/dist/${rel}`);
      continue;
    }
    const stat = fs.statSync(full);
    if (!stat.isFile() || stat.size === 0) {
      errors.push(`Empty or invalid build artifact: web/dist/${rel}`);
    }
  }

  const assetsDir = path.join(distDir, 'assets');
  const jsChunks = [];
  if (!fs.existsSync(assetsDir) || !fs.statSync(assetsDir).isDirectory()) {
    errors.push('Missing web/dist/assets directory');
  } else {
    const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
      const full = path.join(assetsDir, entry.name);
      const sizeBytes = fs.statSync(full).size;
      jsChunks.push({ name: entry.name, sizeBytes });
      if (sizeBytes === 0) {
        errors.push(`Empty JS chunk in web/dist/assets/${entry.name}`);
      } else if (sizeBytes > MAX_JS_CHUNK_BYTES) {
        const kb = (sizeBytes / 1024).toFixed(2);
        errors.push(
          `JS chunk web/dist/assets/${entry.name} is ${kb} KB, exceeding the 380 KB code-splitting limit`
        );
      }
    }
    if (jsChunks.length === 0) {
      errors.push('No JS chunks found in web/dist/assets/*.js');
    }
  }

  return {
    name: 'Deploy Artifact Guard',
    passed: errors.length === 0,
    errors,
    details: `Verified ${REQUIRED_DIST_FILES.length} required artifacts and ${jsChunks.length} JS chunks (<= 380 KB each)`,
  };
}

function main() {
  const { mode, targetDir } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`ERROR: Target directory does not exist: ${targetDir}`);
    process.exit(2);
  }

  const workspaceFiles = walkWorkspace(targetDir);
  const trackedSet = getGitTrackedFiles(targetDir);

  const results = [
    checkSecretLeaks(targetDir, workspaceFiles, trackedSet),
    checkConflictsAndDebugLeaks(workspaceFiles),
  ];

  if (mode === 'commit' || mode === 'ci' || mode === 'deploy') {
    results.push(checkLockfileAndBundleSync(targetDir));
  }

  if (mode === 'ci' || mode === 'deploy') {
    results.push(checkDeployArtifacts(targetDir));
  }

  let hasFailures = false;
  console.log(`Preflight Guard [mode=${mode}] target=${targetDir}`);
  for (const res of results) {
    if (res.passed) {
      console.log(`  [PASS] ${res.name} — ${res.details}`);
    } else {
      hasFailures = true;
      console.error(`  [FAIL] ${res.name}`);
      for (const err of res.errors) {
        console.error(`         - ${err}`);
      }
    }
  }

  if (hasFailures) {
    console.error('\nPreflight guard failed. Resolve the issues above before proceeding.');
    process.exit(1);
  }

  console.log('\nAll preflight guards passed.');
}

main();
