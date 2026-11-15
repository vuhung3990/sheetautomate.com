import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

test.describe('Site stability, runtime hygiene, and user workflows', () => {
  test('renders home, filters catalog, runs workbench simulation, toggles theme, and opens legal modals with zero runtime errors', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedSameOriginRequests: string[] = [];

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', (res) => {
      const url = res.url();
      const baseOrigin = new URL(page.url() || 'http://127.0.0.1:4173').origin;
      if (url.startsWith(baseOrigin) && res.status() >= 400) {
        failedSameOriginRequests.push(`${res.status()} ${url}`);
      }
    });

    await page.goto('/');
    const initialCount = await page.locator('#catalog article').count();
    expect(initialCount).toBeGreaterThanOrEqual(12);

    // Filter search
    const searchInput = page.getByPlaceholder(/Search flows/i);
    await searchInput.fill('invoice');
    await expect
      .poll(async () => page.locator('#catalog article').count())
      .toBeLessThan(initialCount);
    await expect
      .poll(async () => page.locator('#catalog article').count())
      .toBeGreaterThanOrEqual(1);

    await searchInput.fill('');
    await expect(page.locator('#catalog article')).toHaveCount(initialCount);

    // Open Flow Workbench Modal
    await page.getByRole('button', { name: /Live Demo/i }).first().click();
    const workbenchDialog = page.getByRole('dialog');
    await expect(workbenchDialog).toBeVisible();

    // Switch tabs
    await workbenchDialog.getByRole('tab', { name: /Code & Starter Sheet/i }).click();
    await expect(
      workbenchDialog.getByRole('button', { name: /Copy Code\.gs/i })
    ).toBeVisible();

    await workbenchDialog.getByRole('tab', { name: /60s Setup & Audit/i }).click();
    await expect(
      workbenchDialog.getByRole('heading', { name: /60-Second Workspace Deployment/i })
    ).toBeVisible();

    await workbenchDialog.getByRole('tab', { name: /Interactive Demo/i }).click();

    // Run Live Demo simulation
    await workbenchDialog.getByRole('button', { name: /Simulate Automation Run/i }).click();
    await expect(workbenchDialog.getByText('COMPLETED', { exact: true })).toBeVisible({
      timeout: 5000,
    });

    // Close workbench modal
    await workbenchDialog.getByRole('button', { name: /Close flow workbench/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Toggle theme
    const darkToggle = page.getByRole('button', { name: /Switch to dark mode/i }).first();
    await darkToggle.click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);

    const lightToggle = page.getByRole('button', { name: /Switch to light mode/i }).first();
    await lightToggle.click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);

    // Open & close Legal modal
    await page.getByRole('button', { name: /Privacy Policy/i }).click();
    const legalDialog = page.getByRole('dialog');
    await expect(legalDialog).toBeVisible();
    await expect(
      legalDialog.getByRole('heading', { name: /Privacy Policy & Zero-Tracking Guarantee/i })
    ).toBeVisible();
    await legalDialog.getByRole('button', { name: /Close dialog/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    expect(pageErrors, 'Expected zero uncaught page errors').toEqual([]);
    expect(consoleErrors, 'Expected zero console.error messages').toEqual([]);
    expect(failedSameOriginRequests, 'Expected zero >=400 same-origin responses').toEqual([]);
  });
});

test.describe('Core Web Vitals & responsive layout reflow', () => {
  test('maintains CLS < 0.1 on initial load', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __clsScore: number }).__clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        >) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') {
            (window as unknown as { __clsScore: number }).__clsScore += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const cls = await page.evaluate(
      () => (window as unknown as { __clsScore: number }).__clsScore
    );
    expect(cls).toBeLessThan(0.1);
  });

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 1440, height: 900 },
  ]) {
    test(`has zero horizontal overflow at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    });
  }
});

test.describe('Deep-link routing & semantic SEO DOM', () => {
  test('opens workbench directly via ?flow=b2b-client-invoice deep link', async ({
    page,
  }) => {
    await page.goto('/?flow=b2b-client-invoice');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('heading', { name: /B2B Client Invoice PDF Generator/i })
    ).toBeVisible();
  });

  test('pre-filters catalog via ?q=invoice deep link', async ({ page }) => {
    await page.goto('/?q=invoice');
    await expect(page.getByPlaceholder(/Search flows/i)).toHaveValue('invoice');
    const cardCount = await page.locator('#catalog article').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
    expect(cardCount).toBeLessThan(12);
  });

  test('exposes valid semantic landmarks, single h1/main, and core SEO head metadata', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(10);

    const viewportContent = await page
      .locator('meta[name="viewport"]')
      .getAttribute('content');
    expect(viewportContent).toContain('width=device-width');

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description?.trim().length).toBeGreaterThan(30);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(canonicalHref).toMatch(/^https?:\/\/.+/);
  });
});

test.describe('SEO, GEO, and static asset delivery', () => {
  test('serves /flows-manifest.json, trust badges, and extension zip with valid payloads', async ({
    request,
  }) => {
    const manifestRes = await request.get('/flows-manifest.json');
    expect(manifestRes.status()).toBe(200);
    const manifest = (await manifestRes.json()) as {
      totalFlows: number;
      flows: Array<{ id: string }>;
    };
    expect(manifest.totalFlows).toBeGreaterThanOrEqual(12);
    expect(manifest.flows.length).toBeGreaterThanOrEqual(12);

    for (const badgePath of [
      '/badges/virustotal.svg',
      '/badges/ai-security.svg',
      '/badges/flows-count.svg',
    ]) {
      const badgeRes = await request.get(badgePath);
      expect(badgeRes.status()).toBe(200);
      const svgText = await badgeRes.text();
      expect(svgText).toContain('<svg');
    }

    const zipRes = await request.get('/downloads/sheetautomate-chrome-extension.zip');
    expect(zipRes.status()).toBe(200);
    const zipBytes = await zipRes.body();
    expect(zipBytes.length).toBeGreaterThan(100);
    // ZIP magic bytes: "PK" (0x50, 0x4B)
    expect(zipBytes[0]).toBe(0x50);
    expect(zipBytes[1]).toBe(0x4b);
  });

  test('serves /robots.txt, /sitemap.xml, /llms.txt, /llms-full.txt, and /og-image.png for search and AI crawlers', async ({
    request,
  }) => {
    const manifestRes = await request.get('/flows-manifest.json');
    expect(manifestRes.status()).toBe(200);
    const manifest = (await manifestRes.json()) as {
      flows: Array<{ id: string }>;
    };

    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toMatch(/Sitemap:\s*https?:\/\//i);
    expect(robotsTxt).toMatch(/Allow:\s*\//i);
    expect(robotsTxt).toMatch(/GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot/i);

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain('<urlset');
    expect(sitemapXml).toContain('<loc>');
    for (const flow of manifest.flows) {
      expect(sitemapXml).toContain(flow.id);
    }

    const llmsRes = await request.get('/llms.txt');
    expect(llmsRes.status()).toBe(200);
    const llmsTxt = await llmsRes.text();
    expect(llmsTxt).toContain('SheetAutomate');

    const llmsFullRes = await request.get('/llms-full.txt');
    expect(llmsFullRes.status()).toBe(200);
    const llmsFullTxt = await llmsFullRes.text();
    expect(llmsFullTxt.length).toBeGreaterThan(llmsTxt.length);
    for (const flow of manifest.flows) {
      expect(llmsFullTxt).toContain(flow.id);
    }

    const ogRes = await request.get('/og-image.png');
    expect(ogRes.status()).toBe(200);
    const ogBytes = await ogRes.body();
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    expect(ogBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      true
    );
  });

  test('declares required security headers in public/_headers', () => {
    const headersPath = path.join(PUBLIC_DIR, '_headers');
    expect(fs.existsSync(headersPath)).toBe(true);
    const headersContent = fs.readFileSync(headersPath, 'utf8');
    expect(headersContent).toContain('X-Frame-Options: DENY');
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    expect(headersContent).toContain('Referrer-Policy:');
    expect(headersContent).toContain('Permissions-Policy:');
  });
});
