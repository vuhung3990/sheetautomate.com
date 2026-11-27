(() => {
  'use strict';

  if (document.getElementById('sa-ext-root')) {
    return;
  }

  const STORAGE_MANIFEST_KEY = 'sa_manifest_cache';
  const STORAGE_PILL_HIDDEN_KEY = 'sa_pill_hidden';
  const CTA_URL = 'https://sheetautomate.com/?utm_source=chrome_extension&utm_medium=sheets_overlay';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const state = {
    manifest: null,
    isOpen: false,
    isHidden: false,
    searchQuery: '',
  };

  function createSvgIcon(paths, size = 14) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    for (const def of paths) {
      const el = document.createElementNS(SVG_NS, def.tag || 'path');
      for (const [k, v] of Object.entries(def.attrs)) {
        el.setAttribute(k, v);
      }
      svg.appendChild(el);
    }
    return svg;
  }

  function iconBrand(size = 18) {
    return createSvgIcon([
      { tag: 'rect', attrs: { x: '2', y: '2', width: '20', height: '20', rx: '5', fill: '#0F172A', stroke: '#10B981', 'stroke-width': '1.6' } },
      { attrs: { d: 'M5 7.5H19V10H5V7.5Z', fill: '#10B981' } },
      { attrs: { d: 'M5 10H19V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V10Z', stroke: '#34D399', 'stroke-width': '1.2' } },
      { attrs: { d: 'M16.2 10.2L12.8 14.8H15.3L14.1 19.6L18.8 13.7H16.1L16.2 10.2Z', fill: '#ECFDF5', stroke: '#0F172A', 'stroke-width': '0.9', 'stroke-linejoin': 'round' } },
    ], size);
  }

  function iconClose() {
    return createSvgIcon([
      { attrs: { d: 'M18 6L6 18M6 6L18 18', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 13);
  }

  function iconSearch() {
    return createSvgIcon([
      { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7', stroke: 'currentColor', 'stroke-width': '2' } },
      { attrs: { d: 'M20 20L16.2 16.2', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 13);
  }

  function iconCopy() {
    return createSvgIcon([
      { attrs: { d: 'M9 9H19V19H9V9Z', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linejoin': 'round' } },
      { attrs: { d: 'M5 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V5', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 12);
  }

  function iconTable() {
    return createSvgIcon([
      { attrs: { d: 'M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z', stroke: 'currentColor', 'stroke-width': '2' } },
      { attrs: { d: 'M3 9H21M9 9V21', stroke: 'currentColor', 'stroke-width': '2' } },
    ], 12);
  }

  function iconCheck() {
    return createSvgIcon([
      { attrs: { d: 'M5 13L9 17L19 7', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } },
    ], 12);
  }

  function iconExternal() {
    return createSvgIcon([
      { attrs: { d: 'M7 17L17 7M17 7H9M17 7V15', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } },
    ], 12);
  }

  function iconInfo() {
    return createSvgIcon([
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9', stroke: '#34D399', 'stroke-width': '2' } },
      { attrs: { d: 'M12 16V12M12 8H12.01', stroke: '#34D399', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 13);
  }

  function cleanTsvCell(value) {
    return String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  }

  function formatSheetTsv(sheetSchema) {
    if (!sheetSchema || !Array.isArray(sheetSchema.headers) || sheetSchema.headers.length === 0) {
      return '';
    }
    const rows = [sheetSchema.headers.map(cleanTsvCell).join('\t')];
    if (Array.isArray(sheetSchema.sampleRows)) {
      for (const row of sheetSchema.sampleRows) {
        if (Array.isArray(row)) {
          rows.push(row.map(cleanTsvCell).join('\t'));
        }
      }
    }
    return rows.join('\n');
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // Fall back to execCommand below
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function flashButtonCopied(button, defaultIconFn, defaultText) {
    if (button._resetTimer) {
      clearTimeout(button._resetTimer);
    }
    button.classList.add('is-copied');
    button.replaceChildren(iconCheck(), document.createTextNode('Copied!'));
    button._resetTimer = setTimeout(() => {
      button.classList.remove('is-copied');
      button.replaceChildren(defaultIconFn(), document.createTextNode(defaultText));
      button._resetTimer = null;
    }, 1800);
  }

  function isValidManifest(data) {
    return Boolean(data && typeof data === 'object' && Array.isArray(data.flows));
  }

  function parseManifestTime(manifest) {
    if (!manifest || !manifest.generatedAt) return 0;
    const ms = Date.parse(manifest.generatedAt);
    return Number.isFinite(ms) ? ms : 0;
  }

  function pickPreferredManifest(bundle, cached) {
    if (!isValidManifest(cached)) return bundle;
    if (!isValidManifest(bundle)) return cached;
    if (cached.flows.length > 0 && bundle.flows.length === 0) return cached;
    if (bundle.flows.length > 0 && cached.flows.length === 0) return bundle;
    return parseManifestTime(cached) >= parseManifestTime(bundle) ? cached : bundle;
  }

  // Build isolated UI container
  const root = document.createElement('div');
  root.id = 'sa-ext-root';
  root.className = 'sa-ext-root';
  root.hidden = true;

  // Quick Drawer
  const drawer = document.createElement('section');
  drawer.className = 'sa-ext-drawer';
  drawer.setAttribute('aria-label', 'SheetAutomate Quick Flows');
  drawer.hidden = true;

  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'sa-ext-drawer-header';

  const drawerBrand = document.createElement('div');
  drawerBrand.className = 'sa-ext-drawer-brand';
  const brandTitleWrap = document.createElement('div');
  const drawerTitle = document.createElement('div');
  drawerTitle.className = 'sa-ext-drawer-title';
  drawerTitle.textContent = 'SheetAutomate Flows';
  const drawerSub = document.createElement('div');
  drawerSub.className = 'sa-ext-drawer-sub';
  drawerSub.textContent = 'Free, VT & AI-audited • Runs in your account';
  brandTitleWrap.append(drawerTitle, drawerSub);
  drawerBrand.append(iconBrand(20), brandTitleWrap);

  const headerActions = document.createElement('div');
  headerActions.className = 'sa-ext-header-actions';
  const closeDrawerBtn = document.createElement('button');
  closeDrawerBtn.type = 'button';
  closeDrawerBtn.className = 'sa-ext-icon-btn';
  closeDrawerBtn.title = 'Minimize drawer';
  closeDrawerBtn.setAttribute('aria-label', 'Minimize drawer');
  closeDrawerBtn.appendChild(iconClose());
  headerActions.appendChild(closeDrawerBtn);
  drawerHeader.append(drawerBrand, headerActions);

  const searchBox = document.createElement('div');
  searchBox.className = 'sa-ext-search-box';
  const searchWrap = document.createElement('div');
  searchWrap.className = 'sa-ext-search-wrap';
  const searchIconSpan = document.createElement('span');
  searchIconSpan.className = 'sa-ext-search-icon';
  searchIconSpan.appendChild(iconSearch());
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'sa-ext-search-input';
  searchInput.placeholder = 'Search flows (invoice, Gmail, OT, stock...)';
  searchInput.autocomplete = 'off';
  searchInput.spellcheck = false;
  searchWrap.append(searchIconSpan, searchInput);
  searchBox.appendChild(searchWrap);

  const tipBar = document.createElement('div');
  tipBar.className = 'sa-ext-tip-bar';
  const tipText = document.createElement('span');
  tipText.append(
    document.createTextNode('Paste headers in '),
    (() => { const s = document.createElement('strong'); s.textContent = 'A1'; return s; })(),
    document.createTextNode(', then script in '),
    (() => { const s = document.createElement('strong'); s.textContent = 'Extensions > Apps Script'; return s; })(),
    document.createTextNode(' (runs only when you click)')
  );
  tipBar.append(iconInfo(), tipText);

  const listEl = document.createElement('div');
  listEl.className = 'sa-ext-list';

  const drawerFooter = document.createElement('div');
  drawerFooter.className = 'sa-ext-drawer-footer';
  const ctaLink = document.createElement('a');
  ctaLink.className = 'sa-ext-cta';
  ctaLink.href = CTA_URL;
  ctaLink.target = '_blank';
  ctaLink.rel = 'noopener noreferrer';
  ctaLink.append(document.createTextNode('Explore All Flows on SheetAutomate.com'), iconExternal());
  drawerFooter.appendChild(ctaLink);

  drawer.append(drawerHeader, searchBox, tipBar, listEl, drawerFooter);

  // Floating Pill
  const pillWrap = document.createElement('div');
  pillWrap.className = 'sa-ext-pill-wrap';

  const pillBtn = document.createElement('button');
  pillBtn.type = 'button';
  pillBtn.className = 'sa-ext-pill-btn';
  pillBtn.setAttribute('aria-expanded', 'false');
  const pillLabel = document.createElement('span');
  pillLabel.textContent = 'SheetAutomate';
  const pillBadge = document.createElement('span');
  pillBadge.className = 'sa-ext-pill-badge';
  pillBadge.textContent = 'Flows';
  pillBtn.append(iconBrand(17), pillLabel, pillBadge);

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'sa-ext-pill-dismiss';
  dismissBtn.title = 'Hide SheetAutomate assistant on Sheets';
  dismissBtn.setAttribute('aria-label', 'Hide SheetAutomate assistant');
  dismissBtn.appendChild(iconClose());

  pillWrap.append(pillBtn, dismissBtn);
  root.append(drawer, pillWrap);

  function getDisplayedFlows() {
    const flows = state.manifest && Array.isArray(state.manifest.flows) ? state.manifest.flows : [];
    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      return flows.filter((flow) => {
        const text = [
          flow.title,
          flow.shortDescription,
          flow.category,
          ...(Array.isArray(flow.tags) ? flow.tags : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }
    const featured = flows.filter((f) => f.featured);
    return (featured.length > 0 ? featured : flows).slice(0, 6);
  }

  function renderList() {
    const flows = getDisplayedFlows();
    if (flows.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sa-ext-empty';
      empty.textContent = state.searchQuery
        ? 'No flows match your search. Try another keyword or browse all flows below.'
        : 'Open the SheetAutomate extension popup to sync flows, or explore the full library below.';
      listEl.replaceChildren(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const flow of flows) {
      const card = document.createElement('article');
      card.className = 'sa-ext-card';

      const top = document.createElement('div');
      top.className = 'sa-ext-card-top';
      const title = document.createElement('div');
      title.className = 'sa-ext-card-title';
      title.textContent = flow.title || flow.id || 'Untitled Flow';
      const timeBadge = document.createElement('span');
      timeBadge.className = 'sa-ext-card-time';
      timeBadge.textContent = flow.timeSavedPerWeek || flow.category || 'Free';
      top.append(title, timeBadge);

      const desc = document.createElement('div');
      desc.className = 'sa-ext-card-desc';
      desc.textContent = flow.shortDescription || '';

      const actions = document.createElement('div');
      actions.className = 'sa-ext-card-actions';

      const copyScriptBtn = document.createElement('button');
      copyScriptBtn.type = 'button';
      copyScriptBtn.className = 'sa-ext-btn sa-ext-btn-primary';
      copyScriptBtn.append(iconCopy(), document.createTextNode('Copy Script'));
      copyScriptBtn.disabled = !flow.code;
      copyScriptBtn.addEventListener('click', async () => {
        const ok = await copyToClipboard(flow.code || '');
        if (ok) flashButtonCopied(copyScriptBtn, iconCopy, 'Copy Script');
      });

      const tsvPayload = formatSheetTsv(flow.sheetSchema);
      const copyHeadersBtn = document.createElement('button');
      copyHeadersBtn.type = 'button';
      copyHeadersBtn.className = 'sa-ext-btn';
      copyHeadersBtn.append(iconTable(), document.createTextNode('Copy Headers'));
      copyHeadersBtn.disabled = !tsvPayload;
      copyHeadersBtn.addEventListener('click', async () => {
        const ok = await copyToClipboard(tsvPayload);
        if (ok) flashButtonCopied(copyHeadersBtn, iconTable, 'Copy Headers');
      });

      const demoLink = document.createElement('a');
      demoLink.className = 'sa-ext-btn';
      demoLink.href = `https://sheetautomate.com/?flow=${encodeURIComponent(flow.id || '')}&utm_source=chrome_extension&utm_medium=sheets_overlay`;
      demoLink.target = '_blank';
      demoLink.rel = 'noopener noreferrer';
      demoLink.title = 'Open interactive demo';
      demoLink.append(document.createTextNode('Demo'), iconExternal());

      actions.append(copyScriptBtn, copyHeadersBtn, demoLink);
      card.append(top, desc, actions);
      fragment.appendChild(card);
    }
    listEl.replaceChildren(fragment);
  }

  function syncVisibility() {
    root.hidden = state.isHidden;
    drawer.hidden = !state.isOpen;
    pillBtn.setAttribute('aria-expanded', state.isOpen ? 'true' : 'false');
    const total = state.manifest?.flows?.length || 0;
    pillBadge.textContent = total > 0 ? `${total} Flows` : 'Flows';
  }

  async function loadManifestAndPrefs() {
    let bundled = null;
    try {
      const res = await fetch(chrome.runtime.getURL('flows-bundle.json'));
      if (res.ok) {
        const json = await res.json();
        if (isValidManifest(json)) bundled = json;
      }
    } catch (_) {
      // Ignore bundled load error
    }

    let cached = null;
    try {
      const stored = await chrome.storage.local.get([STORAGE_MANIFEST_KEY, STORAGE_PILL_HIDDEN_KEY]);
      if (isValidManifest(stored[STORAGE_MANIFEST_KEY])) {
        cached = stored[STORAGE_MANIFEST_KEY];
      }
      state.isHidden = Boolean(stored[STORAGE_PILL_HIDDEN_KEY]);
    } catch (_) {
      // Ignore storage error
    }

    state.manifest = pickPreferredManifest(bundled, cached) || { flows: [] };
    renderList();
    syncVisibility();
  }

  pillBtn.addEventListener('click', () => {
    state.isOpen = !state.isOpen;
    syncVisibility();
    if (state.isOpen) {
      searchInput.focus();
    }
  });

  closeDrawerBtn.addEventListener('click', () => {
    state.isOpen = false;
    syncVisibility();
  });

  dismissBtn.addEventListener('click', async () => {
    state.isOpen = false;
    state.isHidden = true;
    syncVisibility();
    try {
      await chrome.storage.local.set({ [STORAGE_PILL_HIDDEN_KEY]: true });
    } catch (_) {
      // Ignore storage error
    }
  });

  searchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value;
    renderList();
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      if (changes[STORAGE_PILL_HIDDEN_KEY]) {
        state.isHidden = Boolean(changes[STORAGE_PILL_HIDDEN_KEY].newValue);
        if (state.isHidden) state.isOpen = false;
        syncVisibility();
      }
      if (changes[STORAGE_MANIFEST_KEY] && isValidManifest(changes[STORAGE_MANIFEST_KEY].newValue)) {
        state.manifest = pickPreferredManifest(state.manifest, changes[STORAGE_MANIFEST_KEY].newValue);
        renderList();
        syncVisibility();
      }
    });
  }

  document.body.appendChild(root);
  loadManifestAndPrefs();
})();
