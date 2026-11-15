#!/usr/bin/env node
/**
 * run-all-checks.mjs
 * Master evaluation & QA evidence generator for SheetAutomate.
 * Executes validation, build, test, security, SEO/GEO, and deploy-guard checks
 * and writes reports/qa-evidence-report.json + reports/qa-evidence-report.md.
 * Zero external dependencies (Node 20+ ESM).
 *
 * Usage:
 *   node scripts/run-all-checks.mjs [--fast | --ci]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const MAX_JS_CHUNK_BYTES = 380 * 1024;

const args = new Set(process.argv.slice(2));
const isFast = args.has('--fast');
const mode = isFast ? 'fast' : args.has('--ci') ? 'ci' : 'full';

function getNodeBinDir() {
  try {
    return path.dirname(fs.realpathSync(process.execPath));
  } catch {
    return path.dirname(process.execPath);
  }
}

function buildChildEnv() {
  const nodeBinDir = getNodeBinDir();
  const currentPath = process.env.PATH || '';
  const pathParts = currentPath.split(path.delimiter).filter(Boolean);
  const nextPath = pathParts.includes(nodeBinDir)
    ? currentPath
    : [nodeBinDir, ...pathParts].join(path.delimiter);
  return { ...process.env, PATH: nextPath };
}

function resolveTool(name) {
  const candidate = path.join(getNodeBinDir(), name);
  if (fs.existsSync(candidate)) {
    return candidate;
  }
  return name;
}

function runCommand(command, cmdArgs, cwd = ROOT_DIR) {
  const start = Date.now();
  const resolved = command === 'npm' || command === 'npx' ? resolveTool(command) : command;
  try {
    const stdout = execFileSync(resolved, cmdArgs, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: buildChildEnv(),
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      exitCode: 0,
      durationMs: Date.now() - start,
      output: stdout || '',
    };
  } catch (err) {
    const stdout = typeof err?.stdout === 'string' ? err.stdout : '';
    const stderr = typeof err?.stderr === 'string' ? err.stderr : '';
    const msg = !stdout && !stderr && err?.message ? err.message : '';
    const exitCode = typeof err?.status === 'number' ? err.status : 1;
    return {
      exitCode,
      durationMs: Date.now() - start,
      output: [stdout, stderr, msg].filter(Boolean).join('\n'),
    };
  }
}

function findFilesRecursive(dir, predicate) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === 'playwright-report' ||
        entry.name === 'test-results'
      ) {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && predicate(full, entry.name)) {
        found.push(full);
      }
    }
  }
  walk(dir);
  return found;
}

function tailLines(text, maxLines = 25) {
  const lines = String(text || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (lines.length <= maxLines) return lines.join('\n');
  return lines.slice(-maxLines).join('\n');
}

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return String(text || '').replace(/\x1b\[[0-9;]*m/g, '');
}

function checkFlowsAndSync() {
  const start = Date.now();
  const subCommands = [
    [process.execPath, ['scripts/validate-flows.mjs']],
    [process.execPath, ['scripts/generate-badges.mjs']],
    [process.execPath, ['scripts/build-flows-manifest.mjs']],
    [process.execPath, ['scripts/package-extension.mjs']],
  ];

  const seoScript = path.join(ROOT_DIR, 'scripts', 'generate-seo-geo-assets.mjs');
  const hasSeoScript = fs.existsSync(seoScript);
  if (hasSeoScript) {
    subCommands.push([process.execPath, ['scripts/generate-seo-geo-assets.mjs']]);
  }

  let combinedOutput = '';
  let exitCode = 0;
  for (const [cmd, cmdArgs] of subCommands) {
    const res = runCommand(cmd, cmdArgs, ROOT_DIR);
    combinedOutput += `$ node ${cmdArgs.join(' ')}\n${res.output}\n`;
    if (res.exitCode !== 0) {
      exitCode = res.exitCode;
      break;
    }
  }

  const flowsDir = path.join(ROOT_DIR, 'flows');
  const flowCount = fs.existsSync(flowsDir)
    ? fs
        .readdirSync(flowsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.')).length
    : 0;

  const zipPath = path.join(
    ROOT_DIR,
    'web',
    'public',
    'downloads',
    'sheetautomate-chrome-extension.zip'
  );
  const zipSizeKb = fs.existsSync(zipPath)
    ? Number((fs.statSync(zipPath).size / 1024).toFixed(1))
    : 0;

  return {
    id: 'flows-sync',
    name: 'Validate Flows, Badges, Manifest, Extension & SEO/GEO Sync',
    command: hasSeoScript
      ? 'validate-flows + generate-badges + build-flows-manifest + package-extension + generate-seo-geo-assets'
      : 'validate-flows + generate-badges + build-flows-manifest + package-extension',
    status: exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode,
    durationMs: Date.now() - start,
    metrics: {
      flowCount,
      extensionZipKb: zipSizeKb,
      seoAssetGeneratorPresent: hasSeoScript,
    },
    summary:
      exitCode === 0
        ? `${flowCount} flows validated & bundled; extension zip ${zipSizeKb} KB${hasSeoScript ? '; SEO/GEO assets generated' : ' (SEO/GEO generator pending)'}`
        : 'Flow validation or sync failed',
    outputSnippet: tailLines(stripAnsi(combinedOutput)),
  };
}

function checkNodeTests() {
  const testFiles = findFilesRecursive(path.join(ROOT_DIR, 'tests'), (_, name) =>
    name.endsWith('.test.mjs')
  ).sort();

  if (testFiles.length === 0) {
    return {
      id: 'node-tests',
      name: 'Node Test Suites (tests/*.test.mjs)',
      command: 'node --test tests/*.test.mjs',
      status: 'SKIPPED',
      exitCode: 0,
      durationMs: 0,
      metrics: { testFiles: 0, tests: 0, pass: 0, fail: 0 },
      summary: 'No *.test.mjs files found under tests/',
      outputSnippet: '',
    };
  }

  const relFiles = testFiles.map((f) => path.relative(ROOT_DIR, f));
  const res = runCommand(process.execPath, ['--test', ...relFiles], ROOT_DIR);
  const clean = stripAnsi(res.output);

  const totalMatch = clean.match(/(?:#|ℹ)\s+tests\s+(\d+)/);
  const passMatch = clean.match(/(?:#|ℹ)\s+pass\s+(\d+)/);
  const failMatch = clean.match(/(?:#|ℹ)\s+fail\s+(\d+)/);

  const tests = totalMatch ? Number(totalMatch[1]) : 0;
  const pass = passMatch ? Number(passMatch[1]) : 0;
  const fail = failMatch ? Number(failMatch[1]) : 0;

  return {
    id: 'node-tests',
    name: 'Node Test Suites (tests/*.test.mjs)',
    command: `node --test ${relFiles.join(' ')}`,
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: { testFiles: relFiles.length, tests, pass, fail },
    summary: `${pass}/${tests} tests passed across ${relFiles.length} file(s)`,
    outputSnippet: tailLines(clean),
  };
}

function checkProductionBuild() {
  const res = runCommand('npm', ['run', 'build'], WEB_DIR);
  const clean = stripAnsi(res.output);

  const assetsDir = path.join(WEB_DIR, 'dist', 'assets');
  const jsChunks = [];
  if (fs.existsSync(assetsDir)) {
    for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.js')) {
        const sizeBytes = fs.statSync(path.join(assetsDir, entry.name)).size;
        jsChunks.push({
          name: entry.name,
          sizeBytes,
          sizeKb: Number((sizeBytes / 1024).toFixed(2)),
        });
      }
    }
  }
  jsChunks.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const largestChunk = jsChunks[0] || null;
  const oversized = jsChunks.filter((c) => c.sizeBytes > MAX_JS_CHUNK_BYTES);
  const totalJsKb = Number(
    (jsChunks.reduce((acc, c) => acc + c.sizeBytes, 0) / 1024).toFixed(2)
  );

  return {
    id: 'web-build',
    name: 'Production Build & Code-Split Size Audit',
    command: 'cd web && npm run build',
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: {
      jsChunkCount: jsChunks.length,
      totalJsKb,
      largestChunkName: largestChunk?.name || null,
      largestChunkKb: largestChunk?.sizeKb || 0,
      oversizedChunks: oversized.map((c) => `${c.name} (${c.sizeKb} KB)`),
      chunks: jsChunks,
    },
    summary:
      res.exitCode === 0
        ? `Built ${jsChunks.length} JS chunk(s), total ${totalJsKb} KB, largest ${largestChunk?.sizeKb ?? 0} KB (${oversized.length} over 380 KB)`
        : 'TypeScript or Vite production build failed',
    outputSnippet: tailLines(clean),
  };
}

function checkVitestSuite() {
  const testFiles = findFilesRecursive(WEB_DIR, (_, name) =>
    /\.(test|spec)\.(ts|tsx|js|jsx|mts|mjs)$/.test(name)
  ).filter((p) => !p.includes(`${path.sep}e2e${path.sep}`) && !p.endsWith('.spec.ts'));

  if (testFiles.length === 0) {
    return {
      id: 'vitest-a11y',
      name: 'Vitest Unit & Accessibility (axe-core) Suite',
      command: 'cd web && npx vitest run',
      status: 'SKIPPED',
      exitCode: 0,
      durationMs: 0,
      metrics: { testFiles: 0, passed: 0, failed: 0 },
      summary: 'No Vitest unit/a11y test files found in web/ yet',
      outputSnippet: '',
    };
  }

  const res = runCommand('npx', ['vitest', 'run'], WEB_DIR);
  const clean = stripAnsi(res.output);

  const filesMatch = clean.match(/Test Files\s+(\d+)\s+passed/);
  const testsMatch = clean.match(/Tests\s+(\d+)\s+passed/);
  const failTestsMatch = clean.match(/Tests\s+(\d+)\s+failed/);

  const passed = testsMatch ? Number(testsMatch[1]) : 0;
  const failed = failTestsMatch ? Number(failTestsMatch[1]) : 0;
  const filesPassed = filesMatch ? Number(filesMatch[1]) : testFiles.length;

  return {
    id: 'vitest-a11y',
    name: 'Vitest Unit & Accessibility (axe-core) Suite',
    command: 'cd web && npx vitest run',
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: { testFiles: filesPassed, passed, failed },
    summary:
      res.exitCode === 0
        ? `${passed} Vitest test(s) passed across ${filesPassed} file(s)`
        : `Vitest suite failed (${failed} failed)`,
    outputSnippet: tailLines(clean),
  };
}

function checkModernWebGuidance() {
  if (isFast) {
    return {
      id: 'modern-web-guidance',
      name: 'Modern Web Guidance Legacy Scan',
      command: 'npx --yes modern-web-guidance@latest legacy-scan web',
      status: 'SKIPPED',
      exitCode: 0,
      durationMs: 0,
      metrics: { skippedReason: 'fast-mode' },
      summary: 'Skipped in --fast mode',
      outputSnippet: '',
    };
  }

  const res = runCommand(
    'npx',
    ['--yes', 'modern-web-guidance@latest', 'legacy-scan', 'web'],
    ROOT_DIR
  );
  const clean = stripAnsi(res.output);

  return {
    id: 'modern-web-guidance',
    name: 'Modern Web Guidance Legacy Scan',
    command: 'npx --yes modern-web-guidance@latest legacy-scan web',
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: { exitCode: res.exitCode },
    summary:
      res.exitCode === 0
        ? 'modern-web-guidance legacy-scan passed cleanly'
        : `modern-web-guidance legacy-scan exited with code ${res.exitCode}`,
    outputSnippet: tailLines(clean),
  };
}

function checkPlaywrightE2E() {
  if (isFast) {
    return {
      id: 'playwright-e2e',
      name: 'Playwright Headless E2E + SEO/GEO/Stability/Reflow/CLS',
      command: 'cd web && npx playwright test',
      status: 'SKIPPED',
      exitCode: 0,
      durationMs: 0,
      metrics: { skippedReason: 'fast-mode' },
      summary: 'Skipped in --fast mode',
      outputSnippet: '',
    };
  }

  const hasPlaywrightConfig =
    fs.existsSync(path.join(WEB_DIR, 'playwright.config.ts')) ||
    fs.existsSync(path.join(WEB_DIR, 'playwright.config.js')) ||
    fs.existsSync(path.join(WEB_DIR, 'playwright.config.mjs'));

  const specFiles = findFilesRecursive(WEB_DIR, (_, name) =>
    /\.spec\.(ts|tsx|js|jsx|mjs)$/.test(name)
  );

  if (!hasPlaywrightConfig && specFiles.length === 0) {
    return {
      id: 'playwright-e2e',
      name: 'Playwright Headless E2E + SEO/GEO/Stability/Reflow/CLS',
      command: 'cd web && npx playwright test',
      status: 'SKIPPED',
      exitCode: 0,
      durationMs: 0,
      metrics: { specFiles: 0, passed: 0, failed: 0 },
      summary: 'No Playwright config or *.spec.* files found in web/ yet',
      outputSnippet: '',
    };
  }

  const res = runCommand('npx', ['playwright', 'test'], WEB_DIR);
  const clean = stripAnsi(res.output);
  const passMatch = clean.match(/(\d+)\s+passed/);
  const failMatch = clean.match(/(\d+)\s+failed/);
  const skipMatch = clean.match(/(\d+)\s+skipped/);

  const passed = passMatch ? Number(passMatch[1]) : 0;
  const failed = failMatch ? Number(failMatch[1]) : 0;
  const skipped = skipMatch ? Number(skipMatch[1]) : 0;

  return {
    id: 'playwright-e2e',
    name: 'Playwright Headless E2E + SEO/GEO/Stability/Reflow/CLS',
    command: 'cd web && npx playwright test',
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: { specFiles: specFiles.length, passed, failed, skipped },
    summary:
      res.exitCode === 0
        ? `${passed} Playwright E2E test(s) passed (${skipped} skipped)`
        : `Playwright E2E failed (${failed} failed, ${passed} passed)`,
    outputSnippet: tailLines(clean),
  };
}

function checkPreflightGuard() {
  const guardMode = isFast ? 'commit' : 'deploy';
  const res = runCommand(
    process.execPath,
    ['scripts/preflight-guard.mjs', `--mode=${guardMode}`],
    ROOT_DIR
  );
  const clean = stripAnsi(res.output);
  const passCount = (clean.match(/\[PASS\]/g) || []).length;
  const failCount = (clean.match(/\[FAIL\]/g) || []).length;

  return {
    id: 'preflight-guard',
    name: `Preflight Accident Guard (--mode=${guardMode})`,
    command: `node scripts/preflight-guard.mjs --mode=${guardMode}`,
    status: res.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: res.exitCode,
    durationMs: res.durationMs,
    metrics: { guardMode, guardsPassed: passCount, guardsFailed: failCount },
    summary:
      res.exitCode === 0
        ? `${passCount} preflight guard group(s) passed in ${guardMode} mode`
        : `${failCount} preflight guard group(s) failed in ${guardMode} mode`,
    outputSnippet: tailLines(clean),
  };
}

function checkWorkflowAndDeployDryRun() {
  const start = Date.now();
  const yamlCheckScript = `
import yaml
with open('.github/workflows/flows-audit-and-deploy.yml', 'r', encoding='utf-8') as f:
    raw = f.read()
data = yaml.safe_load(raw)
assert isinstance(data, dict) and 'jobs' in data, 'Missing jobs key'
assert 'concurrency' in data, 'Missing concurrency key'
assert 'permissions' in data, 'Missing permissions key'
def scan_if(node):
    if isinstance(node, dict):
        if 'if' in node and 'secrets.' in str(node['if']):
            raise AssertionError(f"secrets.* used in if condition: {node['if']}")
        for v in node.values():
            scan_if(v)
    elif isinstance(node, list):
        for item in node:
            scan_if(item)
scan_if(data)
print('YAML OK; jobs=' + ','.join(data['jobs'].keys()))
`;

  const yamlRes = runCommand('python3', ['-c', yamlCheckScript], ROOT_DIR);
  let combinedOutput = `$ python3 PyYAML validation\n${yamlRes.output}\n`;
  let exitCode = yamlRes.exitCode;
  let dryRunPassed = null;

  if (exitCode === 0 && !isFast) {
    const dryRes = runCommand(
      process.execPath,
      ['scripts/deploy-pages.mjs', '--dry-run'],
      ROOT_DIR
    );
    combinedOutput += `$ node scripts/deploy-pages.mjs --dry-run\n${dryRes.output}\n`;
    exitCode = dryRes.exitCode;
    dryRunPassed = dryRes.exitCode === 0;
  }

  return {
    id: 'ci-yaml-and-deploy-dry-run',
    name: 'GitHub Actions YAML & Deploy Dry-Run Check',
    command: isFast
      ? 'python3 PyYAML check on .github/workflows/flows-audit-and-deploy.yml'
      : 'python3 PyYAML check + node scripts/deploy-pages.mjs --dry-run',
    status: exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode,
    durationMs: Date.now() - start,
    metrics: {
      yamlValid: yamlRes.exitCode === 0,
      deployDryRun: isFast ? 'skipped-in-fast' : dryRunPassed,
    },
    summary:
      exitCode === 0
        ? isFast
          ? 'GitHub Actions YAML validated (deploy dry-run skipped in --fast mode)'
          : 'GitHub Actions YAML validated & deploy-pages.mjs --dry-run READY'
        : 'GitHub Actions YAML validation or deploy dry-run failed',
    outputSnippet: tailLines(stripAnsi(combinedOutput)),
  };
}

function buildScorecard(checksById) {
  const aggregateStatus = (ids) => {
    const linked = ids.map((id) => checksById[id]).filter(Boolean);
    if (linked.some((c) => c.status === 'FAIL')) return 'FAIL';
    if (linked.some((c) => c.status === 'SKIPPED')) return 'PARTIAL';
    return 'PASS';
  };

  const build = checksById['web-build'];
  const vitest = checksById['vitest-a11y'];
  const pw = checksById['playwright-e2e'];
  const sync = checksById['flows-sync'];
  const mwg = checksById['modern-web-guidance'];
  const guard = checksById['preflight-guard'];
  const ciDry = checksById['ci-yaml-and-deploy-dry-run'];
  const nodeTests = checksById['node-tests'];

  const seoFiles = [
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
    'og-image.png',
  ].filter((f) => fs.existsSync(path.join(WEB_DIR, 'dist', f)));

  return [
    {
      criterion: '1. Website Stability & Zero Errors',
      status: aggregateStatus(['web-build', 'vitest-a11y', 'playwright-e2e']),
      checks: ['web-build', 'vitest-a11y', 'playwright-e2e'],
      evidence: `Build: ${build.status} (${build.metrics.jsChunkCount} JS chunks, largest ${build.metrics.largestChunkKb} KB); Vitest/axe: ${vitest.status} (${vitest.summary}); Playwright: ${pw.status} (${pw.summary})`,
    },
    {
      criterion: '2. SEO & GEO + Modern Web Guidance',
      status: aggregateStatus(['flows-sync', 'modern-web-guidance', 'playwright-e2e']),
      checks: ['flows-sync', 'modern-web-guidance', 'playwright-e2e'],
      evidence: `Dist SEO/GEO artifacts: ${seoFiles.length}/5 present (${seoFiles.join(', ') || 'none'}); Legacy scan: ${mwg.status}; E2E SEO/GEO: ${pw.status}`,
    },
    {
      criterion: '3. GitHub Actions Zero-Error Workflow',
      status: aggregateStatus(['ci-yaml-and-deploy-dry-run', 'node-tests']),
      checks: ['ci-yaml-and-deploy-dry-run', 'node-tests'],
      evidence: `Workflow YAML valid=${ciDry.metrics.yamlValid}; secrets-in-if=0; Node tests: ${nodeTests.status} (${nodeTests.summary})`,
    },
    {
      criterion: '4. Flows & Extension Functionality',
      status: aggregateStatus(['flows-sync', 'node-tests', 'preflight-guard']),
      checks: ['flows-sync', 'node-tests', 'preflight-guard'],
      evidence: `Flows validated: ${sync.metrics.flowCount}; Extension zip: ${sync.metrics.extensionZipKb} KB; Guard sync: ${guard.status}`,
    },
    {
      criterion: '5. Dev/Deploy Accident Guardrails',
      status: aggregateStatus(['preflight-guard', 'ci-yaml-and-deploy-dry-run', 'node-tests']),
      checks: ['preflight-guard', 'ci-yaml-and-deploy-dry-run', 'node-tests'],
      evidence: `Preflight (${guard.metrics.guardMode}): ${guard.status} (${guard.metrics.guardsPassed} passed); Deploy dry-run: ${ciDry.metrics.deployDryRun}`,
    },
  ];
}

function renderMarkdown(report) {
  const lines = [
    '# SheetAutomate QA & Verification Evidence Report',
    '',
    `- **Generated At:** ${report.generatedAt}`,
    `- **Mode:** \`${report.mode}\``,
    `- **Overall Status:** **${report.overallStatus}**`,
    `- **Total Duration:** ${(report.totalDurationMs / 1000).toFixed(2)}s`,
    '',
    '## Evaluation Scorecard',
    '',
    '| Criterion | Verdict | Quantitative Evidence |',
    '| --- | --- | --- |',
  ];

  for (const item of report.scorecard) {
    lines.push(`| ${item.criterion} | **${item.status}** | ${item.evidence} |`);
  }

  lines.push(
    '',
    '## Detailed Check Results',
    '',
    '| # | Check | Status | Duration | Summary |',
    '| --- | --- | --- | --- | --- |'
  );

  report.checks.forEach((c, idx) => {
    lines.push(
      `| ${idx + 1} | ${c.name} | **${c.status}** | ${(c.durationMs / 1000).toFixed(2)}s | ${c.summary} |`
    );
  });

  const buildCheck = report.checks.find((c) => c.id === 'web-build');
  const chunks = buildCheck?.metrics?.chunks || [];
  if (chunks.length > 0) {
    lines.push(
      '',
      '## Production JS Bundle Chunks (`web/dist/assets/*.js`)',
      '',
      '| Chunk | Size (KB) | Limit (380 KB) |',
      '| --- | --- | --- |'
    );
    for (const chunk of chunks) {
      const ok = chunk.sizeBytes <= MAX_JS_CHUNK_BYTES ? 'OK' : 'OVER LIMIT';
      lines.push(`| \`${chunk.name}\` | ${chunk.sizeKb} KB | ${ok} |`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function main() {
  const pipelineStart = Date.now();
  console.log(`Running SheetAutomate QA & Verification Pipeline [mode=${mode}]...`);

  const checks = [
    checkFlowsAndSync(),
    checkNodeTests(),
    checkProductionBuild(),
    checkVitestSuite(),
    checkModernWebGuidance(),
    checkPlaywrightE2E(),
    checkPreflightGuard(),
    checkWorkflowAndDeployDryRun(),
  ];

  const checksById = Object.fromEntries(checks.map((c) => [c.id, c]));
  const scorecard = buildScorecard(checksById);
  const hasFailures = checks.some((c) => c.status === 'FAIL');

  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    overallStatus: hasFailures ? 'FAIL' : 'PASS',
    totalDurationMs: Date.now() - pipelineStart,
    scorecard,
    checks,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const jsonPath = path.join(REPORTS_DIR, 'qa-evidence-report.json');
  const mdPath = path.join(REPORTS_DIR, 'qa-evidence-report.md');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(mdPath, renderMarkdown(report), 'utf8');

  console.log('\n=== Verification Summary ===');
  for (const c of checks) {
    console.log(`  [${c.status}] ${c.name} (${(c.durationMs / 1000).toFixed(2)}s) — ${c.summary}`);
  }
  console.log(`\nReports written to:`);
  console.log(`  - ${path.relative(ROOT_DIR, jsonPath)}`);
  console.log(`  - ${path.relative(ROOT_DIR, mdPath)}`);

  if (hasFailures) {
    process.exit(1);
  }
}

main();
