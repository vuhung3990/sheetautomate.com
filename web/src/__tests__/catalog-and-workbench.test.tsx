import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import App from '../App';
import { buildSheetTsv, FLOWS } from '../lib/flowRegistry';

function stripJsComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, '');
}

describe('Dynamic Flow Registry integrity', () => {
  it('discovers >= 12 valid, unique, least-privilege flows without dangerous patterns', () => {
    expect(FLOWS.length).toBeGreaterThanOrEqual(12);

    const slugs = new Set<string>();
    const forbiddenScopes = new Set([
      'https://mail.google.com/',
      'https://mail.google.com',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts',
    ]);

    for (const flow of FLOWS) {
      expect(flow.id).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.has(flow.id)).toBe(false);
      slugs.add(flow.id);

      expect(flow.title.trim().length).toBeGreaterThan(4);
      expect(flow.codeGs.trim().length).toBeGreaterThan(20);
      expect(flow.codeGs).not.toContain('// Code.gs loading from repository...');

      expect(flow.oauthScopes.length).toBeGreaterThanOrEqual(1);
      for (const scope of flow.oauthScopes) {
        expect(forbiddenScopes.has(scope)).toBe(false);
      }

      expect(flow.thumbnailSvg).toContain('<svg');
      expect(flow.thumbnailSvg).toContain('</svg>');
      expect(flow.thumbnailSvg).not.toMatch(/<script\b/i);
      expect(flow.thumbnailSvg).not.toMatch(/\bon(?:load|error)\s*=/i);
      expect(flow.thumbnailSvg).not.toMatch(/javascript:/i);

      const strippedCode = stripJsComments(flow.codeGs);
      expect(strippedCode).not.toMatch(/\beval\s*\(/);
      expect(strippedCode).not.toMatch(/\bnew\s+Function\s*\(/);
      expect(strippedCode).not.toMatch(/\bdocument\.write\s*\(/);
      expect(strippedCode).not.toMatch(/\bset(?:Timeout|Interval)\s*\(\s*['"`]/);
    }
  });
});

describe('SheetAutomate App catalog, workbench, and accessibility', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const uncaughtErrors: unknown[] = [];

  const handleWindowError = (event: ErrorEvent) => {
    uncaughtErrors.push(event.error ?? event.message);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    uncaughtErrors.push(event.reason);
  };

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    uncaughtErrors.length = 0;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  });

  afterEach(() => {
    cleanup();
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);

    // Filter out React 18 dev-mode notices for HTML5 <search> and fetchPriority
    // which are valid in modern browsers and TypeScript DOM libs.
    const unexpectedConsoleErrors = consoleErrorSpy.mock.calls.filter((args: unknown[]) => {
      const joined = args.map((a: unknown) => String(a)).join(' ');
      if (joined.includes('The tag <%s> is unrecognized') && joined.includes('search')) {
        return false;
      }
      if (joined.includes('does not recognize the `%s` prop') && joined.includes('fetchPriority')) {
        return false;
      }
      return true;
    });

    expect(unexpectedConsoleErrors).toHaveLength(0);
    expect(uncaughtErrors).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  it('renders all catalog cards, filters by search, and restores all flows on Reset All Filters', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const catalogSection = container.querySelector('#catalog');
    expect(catalogSection).not.toBeNull();
    expect(catalogSection!.querySelectorAll('article')).toHaveLength(FLOWS.length);

    const searchInput = screen.getByPlaceholderText(/Search flows/i);
    await user.type(searchInput, 'invoice');

    await waitFor(() => {
      const cards = catalogSection!.querySelectorAll('article');
      expect(cards.length).toBeGreaterThanOrEqual(1);
      expect(cards.length).toBeLessThan(FLOWS.length);
    });

    await user.clear(searchInput);
    await user.type(searchInput, 'nonexistent-flow-query-xyz-999');

    const resetButton = await screen.findByRole('button', { name: /Reset All Filters/i });
    expect(catalogSection!.querySelectorAll('article')).toHaveLength(0);

    await user.click(resetButton);

    await waitFor(() => {
      expect(catalogSection!.querySelectorAll('article')).toHaveLength(FLOWS.length);
    });
  });

  it('toggles category pill aria-pressed and filters by category, trigger, and sort order', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const catalogSection = container.querySelector('#catalog')!;

    const categoryGroup = screen.getByRole('group', { name: /Filter flows by category/i });
    const allPill = within(categoryGroup).getByRole('button', { name: /^All\d*$/i });
    const docPill = within(categoryGroup).getByRole('button', { name: /Document & PDF/i });

    expect(allPill).toHaveAttribute('aria-pressed', 'true');
    expect(docPill).toHaveAttribute('aria-pressed', 'false');

    await user.click(docPill);

    expect(docPill).toHaveAttribute('aria-pressed', 'true');
    expect(allPill).toHaveAttribute('aria-pressed', 'false');

    const expectedDocCount = FLOWS.filter((f) => f.category === 'Document & PDF').length;
    await waitFor(() => {
      expect(catalogSection.querySelectorAll('article')).toHaveLength(expectedDocCount);
    });

    await user.click(allPill);
    await waitFor(() => {
      expect(catalogSection.querySelectorAll('article')).toHaveLength(FLOWS.length);
    });

    // Trigger filter
    const triggerSelect = screen.getByLabelText(/Filter by trigger type/i);
    const targetTrigger = FLOWS[0].trigger;
    await user.selectOptions(triggerSelect, targetTrigger);

    const expectedTriggerCount = FLOWS.filter((f) => f.trigger === targetTrigger).length;
    await waitFor(() => {
      expect(catalogSection.querySelectorAll('article')).toHaveLength(expectedTriggerCount);
    });

    await user.selectOptions(triggerSelect, 'All');
    await waitFor(() => {
      expect(catalogSection.querySelectorAll('article')).toHaveLength(FLOWS.length);
    });

    // Sort selector: alphabetical, least-scopes, featured
    const sortSelect = screen.getByLabelText(/Sort flows/i);

    await user.selectOptions(sortSelect, 'alphabetical');
    await waitFor(() => {
      const titles = Array.from(catalogSection.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      const expectedAlpha = [...FLOWS]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((f) => f.title);
      expect(titles).toEqual(expectedAlpha);
    });

    await user.selectOptions(sortSelect, 'least-scopes');
    await waitFor(() => {
      const titles = Array.from(catalogSection.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      const expectedLeastScopes = [...FLOWS]
        .sort((a, b) => {
          const diff = a.oauthScopes.length - b.oauthScopes.length;
          return diff !== 0 ? diff : a.title.localeCompare(b.title);
        })
        .map((f) => f.title);
      expect(titles).toEqual(expectedLeastScopes);
    });

    await user.selectOptions(sortSelect, 'featured');
    await waitFor(() => {
      const titles = Array.from(catalogSection.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      const expectedFeatured = [...FLOWS]
        .sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return a.title.localeCompare(b.title);
        })
        .map((f) => f.title);
      expect(titles).toEqual(expectedFeatured);
    });
  });

  it('opens FlowWorkbenchModal, syncs ?flow=<slug>, switches tabs via click & arrow keys, runs all 3 simulator scenarios, copies Code.gs/TSV, and closes on Escape', async () => {
    const user = userEvent.setup();
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const targetFlow = FLOWS[0];

    render(<App />);

    const liveDemoButtons = screen.getAllByRole('button', { name: /Live Demo/i });
    await user.click(liveDemoButtons[0]);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: targetFlow.title })).toBeInTheDocument();
    expect(window.location.search).toContain(`flow=${encodeURIComponent(targetFlow.id)}`);

    // Switch tabs with click & ArrowRight / ArrowLeft keyboard navigation
    const demoTab = within(dialog).getByRole('tab', { name: /Interactive Demo/i });
    const codeTab = within(dialog).getByRole('tab', { name: /Code & Starter Sheet/i });
    const setupTab = within(dialog).getByRole('tab', { name: /60s Setup & Audit/i });

    expect(demoTab).toHaveAttribute('aria-selected', 'true');
    demoTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(codeTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(setupTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(codeTab).toHaveAttribute('aria-selected', 'true');

    // Copy Code.gs and TSV in Code tab
    await user.click(within(dialog).getByRole('button', { name: /Copy Code\.gs/i }));
    expect(clipboardSpy).toHaveBeenCalledWith(targetFlow.codeGs);
    expect(within(dialog).getByText(/Copied Code\.gs!/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /Copy Sample Table \(TSV\)/i }));
    expect(clipboardSpy).toHaveBeenCalledWith(buildSheetTsv(targetFlow));
    expect(within(dialog).getByText(/Copied TSV!/i)).toBeInTheDocument();

    // Switch back to Interactive Demo and run all 3 scenarios
    await user.click(demoTab);
    expect(demoTab).toHaveAttribute('aria-selected', 'true');

    // 1. Standard Valid
    await user.click(within(dialog).getByRole('button', { name: /Simulate Automation Run/i }));
    await waitFor(
      () => {
        expect(within(dialog).getByText('COMPLETED')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // 2. Missing Required Field
    await user.click(within(dialog).getByRole('button', { name: /Missing Required Field/i }));
    await user.click(within(dialog).getByRole('button', { name: /Simulate Automation Run/i }));
    await waitFor(
      () => {
        expect(within(dialog).getByText('NEEDS_CORRECTION')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // 3. Duplicate Lock
    await user.click(within(dialog).getByRole('button', { name: /Duplicate Lock/i }));
    await user.click(within(dialog).getByRole('button', { name: /Simulate Automation Run/i }));
    await waitFor(
      () => {
        expect(within(dialog).getByText('SKIPPED')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Close on Escape
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).not.toContain('flow=');
  });

  it('opens Privacy Policy and MIT License dialogs from Footer and closes cleanly', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Privacy Policy/i }));
    let dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: /Privacy Policy & Zero-Tracking Guarantee/i })
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /Close dialog/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /MIT License & Terms/i }));
    dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: /Open Source License \(MIT\) & Terms/i })
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /I Understand/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders RoiCalculator projections and recalculates cleanly without NaN', () => {
    render(<App />);

    expect(screen.getByText('~15 hrs/mo')).toBeInTheDocument();
    expect(screen.getByText('~$5,040')).toBeInTheDocument();

    const docSlider = screen.getByLabelText(/Documents or emails automated per month/i);
    const minSlider = screen.getByLabelText(/Current manual minutes spent per run/i);
    const rateSlider = screen.getByLabelText(/Estimated internal staff hourly rate/i);

    fireEvent.change(docSlider, { target: { value: '200' } });
    fireEvent.change(minSlider, { target: { value: '13' } });
    fireEvent.change(rateSlider, { target: { value: '40' } });

    expect(screen.getByText('200 runs')).toBeInTheDocument();
    expect(screen.getByText('13 mins')).toBeInTheDocument();
    expect(screen.getByText('$40/hr')).toBeInTheDocument();

    // (200 * (13 - 1)) / 60 = 40 hrs/mo -> 40 * 40 * 12 + 540 = $19,740
    expect(screen.getByText('~40 hrs/mo')).toBeInTheDocument();
    expect(screen.getByText('~$19,740')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('NaN');
  });

  it('toggles Faq accordion buttons and aria-expanded state cleanly', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstFaq = screen.getByRole('button', {
      name: /Is SheetAutomate really 100% free with zero catch\?/i,
    });
    const secondFaq = screen.getByRole('button', {
      name: /How does adding a folder in flows\/ auto-update/i,
    });

    expect(firstFaq).toHaveAttribute('aria-expanded', 'true');
    expect(secondFaq).toHaveAttribute('aria-expanded', 'false');

    await user.click(secondFaq);
    expect(secondFaq).toHaveAttribute('aria-expanded', 'true');
    expect(firstFaq).toHaveAttribute('aria-expanded', 'false');

    await user.click(secondFaq);
    expect(secondFaq).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles theme between light and dark mode cleanly', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const toDarkButtons = screen.getAllByRole('button', { name: /Switch to dark mode/i });
    await user.click(toDarkButtons[0]);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('sheetautomate_theme')).toBe('dark');

    const toLightButtons = screen.getAllByRole('button', { name: /Switch to light mode/i });
    await user.click(toLightButtons[0]);

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('sheetautomate_theme')).toBeNull();
  });

  it('has zero serious or critical axe-core accessibility violations on main view and open modal dialog', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const mainAudit = await axe.run(container, {
      rules: {
        // jsdom does not compute external Tailwind CSSStylesheet colors
        'color-contrast': { enabled: false },
      },
    });

    const mainSeriousOrCritical = mainAudit.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(mainSeriousOrCritical).toEqual([]);

    // Open FlowWorkbenchModal and run axe-core on open dialog state
    const liveDemoButtons = screen.getAllByRole('button', { name: /Live Demo/i });
    await user.click(liveDemoButtons[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const modalAudit = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    const modalSeriousOrCritical = modalAudit.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(modalSeriousOrCritical).toEqual([]);
  });
});
