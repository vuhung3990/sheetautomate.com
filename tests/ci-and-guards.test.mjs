import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WORKFLOW_PATH = path.join(
  ROOT_DIR,
  '.github',
  'workflows',
  'flows-audit-and-deploy.yml'
);
const PREFLIGHT_SCRIPT = path.join(ROOT_DIR, 'scripts', 'preflight-guard.mjs');

function runPreflight(targetDir, mode = 'deploy') {
  return spawnSync(
    process.execPath,
    [PREFLIGHT_SCRIPT, `--mode=${mode}`, '--target-dir', targetDir],
    {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    }
  );
}

function createValidFixtureDir({ withDist = true } = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-guard-fixture-'));

  fs.mkdirSync(path.join(tmpDir, 'flows', 'sample-flow'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'web', 'public'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'extension'), { recursive: true });

  fs.writeFileSync(
    path.join(tmpDir, 'web', 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-web',
        version: '1.0.0',
        dependencies: { react: '^18.3.1' },
        devDependencies: { vite: '^6.1.0' },
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(tmpDir, 'web', 'package-lock.json'),
    JSON.stringify(
      {
        name: 'fixture-web',
        lockfileVersion: 3,
        packages: {
          '': {
            dependencies: { react: '^18.3.1' },
            devDependencies: { vite: '^6.1.0' },
          },
        },
      },
      null,
      2
    )
  );

  const manifestPayload = JSON.stringify({
    totalFlows: 1,
    flows: [{ id: 'sample-flow', title: 'Sample Flow' }],
  });
  fs.writeFileSync(path.join(tmpDir, 'web', 'public', 'flows-manifest.json'), manifestPayload);
  fs.writeFileSync(path.join(tmpDir, 'extension', 'flows-bundle.json'), manifestPayload);

  fs.writeFileSync(
    path.join(tmpDir, 'extension', 'manifest.json'),
    JSON.stringify({ manifest_version: 3, name: 'SheetAutomate', version: '1.0.0' })
  );
  fs.writeFileSync(path.join(tmpDir, 'extension', 'popup.js'), 'const ready = true;\n');
  fs.writeFileSync(
    path.join(tmpDir, 'extension', 'content-sheets.js'),
    'const mounted = true;\n'
  );

  if (withDist) {
    const distDir = path.join(tmpDir, 'web', 'dist');
    fs.mkdirSync(path.join(distDir, 'badges'), { recursive: true });
    fs.mkdirSync(path.join(distDir, 'downloads'), { recursive: true });
    fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });

    const distFiles = [
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
      'assets/index-fixture.js',
    ];

    for (const rel of distFiles) {
      fs.writeFileSync(path.join(distDir, rel), 'fixture-content\n');
    }
  }

  return tmpDir;
}

test('GitHub Actions workflow parses cleanly via PyYAML and has zero secrets in if conditions', () => {
  const pyCheck = `
import json, yaml

with open(${JSON.stringify(WORKFLOW_PATH)}, 'r', encoding='utf-8') as f:
    raw = f.read()

data = yaml.safe_load(raw)
assert isinstance(data, dict), 'Workflow YAML must be a mapping'

# PyYAML parses unquoted "on" as boolean True in YAML 1.1
triggers = data.get('on') or data.get(True)
assert isinstance(triggers, dict), 'Workflow triggers missing'
assert 'push' in triggers and 'pull_request' in triggers and 'workflow_dispatch' in triggers

for trig in ('push', 'pull_request'):
    paths = triggers[trig].get('paths', [])
    for required in ('tests/**', 'extension/**', 'flows/**', 'web/**', 'scripts/**', '.github/workflows/**'):
        assert required in paths, f"Missing {required} in {trig}.paths"

concurrency = data.get('concurrency', {})
assert 'group' in concurrency and 'cancel-in-progress' in concurrency, 'Missing concurrency settings'

perms = data.get('permissions', {})
assert perms.get('contents') == 'write'
assert perms.get('models') == 'read'
assert perms.get('pull-requests') == 'write'

if_conditions = []
def collect_if(node):
    if isinstance(node, dict):
        if 'if' in node:
            if_conditions.append(str(node['if']))
        for val in node.values():
            collect_if(val)
    elif isinstance(node, list):
        for item in node:
            collect_if(item)

collect_if(data)
assert len(if_conditions) > 0, 'Expected conditional steps in workflow'
for cond in if_conditions:
    assert 'secrets.' not in cond, f'secrets.* is forbidden inside if: {cond}'

print(json.dumps({'jobs': list(data['jobs'].keys()), 'ifCount': len(if_conditions)}))
`;

  const out = execFileSync('python3', ['-c', pyCheck], { encoding: 'utf8' });
  const parsed = JSON.parse(out.trim());
  assert.ok(parsed.jobs.includes('audit-and-deploy'));
  assert.ok(parsed.ifCount >= 4);

  const rawYaml = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  for (const line of rawYaml.split(/\r?\n/)) {
    if (/^\s*(?:-\s*)?if\s*:/.test(line)) {
      assert.equal(
        line.includes('secrets.'),
        false,
        `Found forbidden secrets.* reference on if line: ${line}`
      );
    }
  }
});

test('web/package.json dependencies match web/package-lock.json', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'web', 'package.json'), 'utf8')
  );
  const lock = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'web', 'package-lock.json'), 'utf8')
  );
  const rootLock = lock?.packages?.[''];
  assert.ok(rootLock, 'web/package-lock.json must contain packages[""]');
  assert.deepEqual(rootLock.dependencies, pkg.dependencies);
  assert.deepEqual(rootLock.devDependencies, pkg.devDependencies);
});

test('Extension MV3 manifest, JS syntax (vm.Script), and flows bundle counts match flows/', () => {
  const extManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'extension', 'manifest.json'), 'utf8')
  );
  assert.equal(extManifest.manifest_version, 3);

  for (const file of ['popup.js', 'content-sheets.js']) {
    const filePath = path.join(ROOT_DIR, 'extension', file);
    const code = fs.readFileSync(filePath, 'utf8');
    assert.doesNotThrow(() => new vm.Script(code, { filename: file }));
  }

  const flowDirs = fs
    .readdirSync(path.join(ROOT_DIR, 'flows'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'));
  assert.ok(flowDirs.length > 0, 'Expected at least 1 flow directory');

  const webManifest = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'web', 'public', 'flows-manifest.json'), 'utf8')
  );
  const extBundle = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'extension', 'flows-bundle.json'), 'utf8')
  );

  assert.equal(webManifest.totalFlows, flowDirs.length);
  assert.equal(webManifest.flows.length, flowDirs.length);
  assert.equal(extBundle.totalFlows, flowDirs.length);
  assert.equal(extBundle.flows.length, flowDirs.length);
});

test('Git hooks and guardrail scripts exist with expected executable permissions', () => {
  for (const hook of ['.githooks/pre-commit', '.githooks/pre-push']) {
    const full = path.join(ROOT_DIR, hook);
    assert.ok(fs.existsSync(full), `Missing ${hook}`);
    const stat = fs.statSync(full);
    assert.ok((stat.mode & 0o111) !== 0, `${hook} must be executable (chmod +x)`);
  }

  for (const script of [
    'scripts/preflight-guard.mjs',
    'scripts/deploy-pages.mjs',
    'scripts/install-git-hooks.mjs',
    'scripts/run-all-checks.mjs',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, script)), `Missing ${script}`);
  }
});

test('preflight-guard.mjs passes clean isolated fixture in deploy mode', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: true });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const res = runPreflight(tmpDir, 'deploy');
  assert.equal(res.status, 0, `Expected exit 0, got ${res.status}:\n${res.stdout}\n${res.stderr}`);
});

test('preflight-guard.mjs blocks fake GitHub PAT token leak', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: false });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const fakePat = 'ghp_' + '1234567890abcdefghij1234567890';
  fs.writeFileSync(path.join(tmpDir, 'leak.js'), `const token = "${fakePat}";\n`);

  const res = runPreflight(tmpDir, 'commit');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /Secret leak/i);
});

test('preflight-guard.mjs blocks .env file containing secrets', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: false });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  fs.writeFileSync(path.join(tmpDir, '.env'), 'CLOUDFLARE_API_TOKEN=live_secret_value_999\n');

  const res = runPreflight(tmpDir, 'commit');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /Secret value in \.env/i);
});

test('preflight-guard.mjs blocks Git conflict markers', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: false });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const conflictText = [
    '<<<<<<<' + ' HEAD',
    'const x = 1;',
    '=======',
    'const x = 2;',
    '>>>>>>>' + ' feature',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(tmpDir, 'conflict.ts'), conflictText);

  const res = runPreflight(tmpDir, 'commit');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /merge conflict marker/i);
});

test('preflight-guard.mjs blocks stray debugger statement', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: false });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const debugLine = 'function inspect() {\n  ' + 'debug' + 'ger;\n}\n';
  fs.writeFileSync(path.join(tmpDir, 'debug-leak.js'), debugLine);

  const res = runPreflight(tmpDir, 'commit');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /debugger statement/i);
});

test('preflight-guard.mjs blocks unexpected package-lock.json outside web/', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: false });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  fs.writeFileSync(path.join(tmpDir, 'package-lock.json'), '{}\n');

  const res = runPreflight(tmpDir, 'commit');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /Unexpected lockfile outside web\//i);
});

test('preflight-guard.mjs blocks missing web/dist/_headers in deploy mode', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: true });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  fs.unlinkSync(path.join(tmpDir, 'web', 'dist', '_headers'));

  const res = runPreflight(tmpDir, 'deploy');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /web\/dist\/_headers/);
});

test('preflight-guard.mjs blocks JS chunk exceeding 380 KB in deploy mode', (t) => {
  const tmpDir = createValidFixtureDir({ withDist: true });
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const oversized = Buffer.alloc(385 * 1024, 'a');
  fs.writeFileSync(path.join(tmpDir, 'web', 'dist', 'assets', 'monolith.js'), oversized);

  const res = runPreflight(tmpDir, 'deploy');
  assert.notEqual(res.status, 0);
  assert.match(res.stderr, /exceeding the 380 KB/i);
});
