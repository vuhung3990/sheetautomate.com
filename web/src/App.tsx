import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useDeferredValue,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FlowCatalogGrid } from './components/FlowCatalogGrid';
import { ExtensionPromo } from './components/ExtensionPromo';
import { SecurityArchitecture } from './components/SecurityArchitecture';
import { HowItWorks } from './components/HowItWorks';
import { WhenFit } from './components/WhenFit';
import { RoiCalculator } from './components/RoiCalculator';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import type { WorkbenchTab } from './components/FlowWorkbenchModal';
import { CATEGORIES, FLOWS, getFlowById } from './lib/flowRegistry';
import type { FlowCategory, FlowItem, FlowSortOption } from './types/flow';

const FlowWorkbenchModal = lazy(() =>
  import('./components/FlowWorkbenchModal').then((m) => ({
    default: m.FlowWorkbenchModal,
  }))
);

const LegalModals = lazy(() =>
  import('./components/LegalModals').then((m) => ({
    default: m.LegalModals,
  }))
);

type ThemeOverride = 'light' | 'dark' | null;

function readStoredTheme(): ThemeOverride {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('sheetautomate_theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Fallback gracefully if localStorage is restricted
  }
  return null;
}

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function App() {
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>(() => readStoredTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    getSystemPrefersDark()
  );

  const resolvedTheme: 'light' | 'dark' =
    themeOverride ?? (systemPrefersDark ? 'dark' : 'light');

  // Catalog filter state (synced with ?q=)
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('q') ?? '';
  });
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<FlowCategory | 'All'>('All');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('All');
  const [sortBy, setSortBy] = useState<FlowSortOption>('featured');

  // Workbench Modal state (synced with ?flow=<slug>)
  const [activeFlow, setActiveFlow] = useState<FlowItem | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return getFlowById(params.get('flow')) ?? null;
  });
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('demo');

  // Legal Modal state
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  const isModalOpen = Boolean(activeFlow || legalType);

  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerWrapperRef = useRef<HTMLDivElement>(null);

  const defaultSeoRef = useRef<{
    title: string;
    description: string;
    canonical: string;
  } | null>(null);

  // Sync theme classes & <meta name="color-scheme">
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = themeOverride ?? 'light dark';
    }
  }, [resolvedTheme, themeOverride]);

  // Listen for OS color-scheme changes and cross-tab localStorage updates
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery?.addEventListener?.('change', handleMediaChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sheetautomate_theme') {
        if (e.newValue === 'dark' || e.newValue === 'light') {
          setThemeOverride(e.newValue);
        } else {
          setThemeOverride(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery?.removeEventListener?.('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleToggleTheme = useCallback(() => {
    const target: 'light' | 'dark' = resolvedTheme === 'dark' ? 'light' : 'dark';
    const systemScheme: 'light' | 'dark' = systemPrefersDark ? 'dark' : 'light';
    const nextOverride: ThemeOverride = target === systemScheme ? null : target;

    setThemeOverride(nextOverride);
    try {
      if (nextOverride) {
        localStorage.setItem('sheetautomate_theme', nextOverride);
      } else {
        localStorage.removeItem('sheetautomate_theme');
      }
    } catch {
      // Storage unavailable
    }
  }, [resolvedTheme, systemPrefersDark]);

  // Apply inert to background regions when a modal is open
  useLayoutEffect(() => {
    const targets = [headerWrapperRef.current, mainRef.current, footerWrapperRef.current];
    for (const el of targets) {
      if (!el) continue;
      if (isModalOpen) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    }
  }, [isModalOpen]);

  // Sync ?q= search query parameter in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [searchQuery]);

  // Listen to browser back/forward navigation for ?flow=<slug> and ?q=
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveFlow(getFlowById(params.get('flow')) ?? null);
      setSearchQuery(params.get('q') ?? '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically update document.title, meta description & canonical URL for activeFlow
  useEffect(() => {
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!defaultSeoRef.current) {
      defaultSeoRef.current = {
        title: document.title,
        description: metaDesc?.content ?? '',
        canonical: canonicalLink?.href ?? 'https://sheetautomate.com/',
      };
    }

    if (activeFlow) {
      document.title = `${activeFlow.title} — SheetAutomate Free Google Sheets Flow`;
      if (metaDesc) {
        metaDesc.content = activeFlow.shortDescription;
      }
      if (canonicalLink) {
        canonicalLink.href = `https://sheetautomate.com/?flow=${encodeURIComponent(activeFlow.id)}`;
      }
    } else if (defaultSeoRef.current) {
      document.title = defaultSeoRef.current.title;
      if (metaDesc) {
        metaDesc.content = defaultSeoRef.current.description;
      }
      if (canonicalLink) {
        canonicalLink.href = defaultSeoRef.current.canonical;
      }
    }
  }, [activeFlow]);

  const syncFlowUrl = useCallback((flowId: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (flowId) {
      url.searchParams.set('flow', flowId);
    } else {
      url.searchParams.delete('flow');
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const handleOpenWorkbench = useCallback(
    (flow: FlowItem, initialTab: WorkbenchTab = 'demo') => {
      setWorkbenchTab(initialTab);
      setActiveFlow(flow);
      syncFlowUrl(flow.id);
    },
    [syncFlowUrl]
  );

  const handleCloseWorkbench = useCallback(() => {
    setActiveFlow(null);
    syncFlowUrl(null);
  }, [syncFlowUrl]);

  const handleExploreFlows = useCallback(() => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTrigger('All');
    setSortBy('featured');
  }, []);

  const triggers = useMemo(() => {
    const set = new Set<string>();
    for (const flow of FLOWS) {
      if (flow.trigger) set.add(flow.trigger);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) counts[cat] = 0;
    for (const flow of FLOWS) {
      counts[flow.category] = (counts[flow.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredFlows = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();

    const matching = FLOWS.filter((flow) => {
      if (selectedCategory !== 'All' && flow.category !== selectedCategory) {
        return false;
      }
      if (selectedTrigger !== 'All' && flow.trigger !== selectedTrigger) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        flow.id,
        flow.title,
        flow.shortDescription,
        flow.category,
        flow.trigger,
        ...flow.tags,
        ...flow.services,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });

    const sorted = [...matching];
    if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'least-scopes') {
      sorted.sort((a, b) => {
        const diff = a.oauthScopes.length - b.oauthScopes.length;
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      });
    } else {
      sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [deferredSearch, selectedCategory, selectedTrigger, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-800 dark:selection:text-brand-300 transition-colors duration-200">
      <a
        href="#main-content"
        className="visually-hidden fixed top-3 left-3 z-50 px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm shadow-lg"
      >
        Skip to main content
      </a>

      <div ref={headerWrapperRef}>
        <Navbar
          theme={resolvedTheme}
          onToggleTheme={handleToggleTheme}
          onExploreFlows={handleExploreFlows}
        />
      </div>

      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-grow">
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTrigger={selectedTrigger}
          onTriggerChange={setSelectedTrigger}
          triggers={triggers}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryCounts={categoryCounts}
          filteredCount={filteredFlows.length}
        />

        <FlowCatalogGrid
          flows={filteredFlows}
          onOpenWorkbench={handleOpenWorkbench}
          onResetFilters={handleResetFilters}
        />

        <ExtensionPromo />
        <SecurityArchitecture />
        <HowItWorks />
        <WhenFit />
        <RoiCalculator onExploreFlows={handleExploreFlows} />
        <Faq />
      </main>

      <div ref={footerWrapperRef}>
        <Footer
          onExploreFlows={handleExploreFlows}
          onOpenLegal={(type) => setLegalType(type)}
        />
      </div>

      {activeFlow && (
        <Suspense fallback={null}>
          <FlowWorkbenchModal
            flow={activeFlow}
            initialTab={workbenchTab}
            onClose={handleCloseWorkbench}
          />
        </Suspense>
      )}

      {legalType && (
        <Suspense fallback={null}>
          <LegalModals type={legalType} onClose={() => setLegalType(null)} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
