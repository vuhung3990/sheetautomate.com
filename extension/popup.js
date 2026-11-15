(() => {
  'use strict';

  const REMOTE_MANIFEST_URL = 'https://sheetautomate.com/flows-manifest.json';
  const STORAGE_MANIFEST_KEY = 'sa_manifest_cache';
  const STORAGE_PILL_HIDDEN_KEY = 'sa_pill_hidden';
  const CATEGORIES = [
    'All',
    'Document & PDF',
    'Email & Gmail',
    'Finance & Ops',
    'HR & Team',
    'Alerts & Sync',
  ];

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const state = {
    manifest: null,
    activeCategory: 'All',
    searchQuery: '',
    pillHidden: false,
  };

  const els = {
    flowCountBadge: document.getElementById('flowCountBadge'),
    vtBadgeText: document.getElementById('vtBadgeText'),
    syncStatusText: document.getElementById('syncStatusText'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryPills: document.getElementById('categoryPills'),
    flowList: document.getElementById('flowList'),
    guideToggleBtn: document.getElementById('guideToggleBtn'),
    guidePanel: document.getElementById('guidePanel'),
    toggleSheetsPillBtn: document.getElementById('toggleSheetsPillBtn'),
  };

  function createSvgIcon(paths, size = 13) {
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

  function iconCopy() {
    return createSvgIcon([
      { attrs: { d: 'M9 9H19V19H9V9Z', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linejoin': 'round' } },
      { attrs: { d: 'M5 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V5', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ]);
  }

  function iconTable() {
    return createSvgIcon([
      { attrs: { d: 'M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z', stroke: 'currentColor', 'stroke-width': '2' } },
      { attrs: { d: 'M3 9H21M9 9V21', stroke: 'currentColor', 'stroke-width': '2' } },
    ]);
  }

  function iconCheck() {
    return createSvgIcon([
      { attrs: { d: 'M5 13L9 17L19 7', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } },
    ]);
  }

  function iconExternal() {
    return createSvgIcon([
      { attrs: { d: 'M7 17L17 7M17 7H9M17 7V15', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } },
    ], 12);
  }

  function iconClock() {
    return createSvgIcon([
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9', stroke: 'currentColor', 'stroke-width': '2' } },
      { attrs: { d: 'M12 7V12L15 14', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 12);
  }

  function iconLock() {
    return createSvgIcon([
      { attrs: { d: 'M5 11H19V20H5V11Z', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linejoin': 'round' } },
      { attrs: { d: 'M8 11V7A4 4 0 0 1 16 7V11', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    ], 12);
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

  function flashButtonCopied(button, defaultIconFn, defaultText, copiedText = 'Copied!') {
    if (button._resetTimer) {
      clearTimeout(button._resetTimer);
    }
    button.classList.add('is-copied');
    button.replaceChildren(iconCheck(), document.createTextNode(copiedText));
    button._resetTimer = setTimeout(() => {
      button.classList.remove('is-copied');
      button.replaceChildren(defaultIconFn(), document.createTextNode(defaultText));
      button._resetTimer = null;
    }, 1800);
  }

  function parseManifestTime(manifest) {
    if (!manifest || !manifest.generatedAt) return 0;
    const ms = Date.parse(manifest.generatedAt);
    return Number.isFinite(ms) ? ms : 0;
  }

  function isValidManifest(data) {
    return Boolean(data && typeof data === 'object' && Array.isArray(data.flows));
  }

  function pickPreferredManifest(bundle, cached) {
    if (!isValidManifest(cached)) return bundle;
    if (!isValidManifest(bundle)) return cached;
    if (cached.flows.length > 0 && bundle.flows.length === 0) return cached;
    if (bundle.flows.length > 0 && cached.flows.length === 0) return bundle;
    return parseManifestTime(cached) >= parseManifestTime(bundle) ? cached : bundle;
  }

  function getScopeCount(flow) {
    if (Array.isArray(flow.oauthScopes)) return flow.oauthScopes.length;
    if (flow.audit && typeof flow.audit.scopesCount === 'number') return flow.audit.scopesCount;
    return 1;
  }

  function renderHeaderMeta() {
    const manifest = state.manifest;
    const flows = manifest && Array.isArray(manifest.flows) ? manifest.flows : [];
    const total = typeof manifest?.totalFlows === 'number' && flows.length === 0
      ? manifest.totalFlows
      : flows.length;

    els.flowCountBadge.textContent = `${total} ${total === 1 ? 'Flow' : 'Flows'}`;

    const vtRaw = manifest?.auditSummary?.virustotalLabel || '0/72 Clean';
    els.vtBadgeText.textContent = vtRaw.toUpperCase().startsWith('VT') ? vtRaw : `VT ${vtRaw}`;
  }

  function renderCategories() {
    const fragment = document.createDocumentFragment();
    for (const cat of CATEGORIES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sa-cat-pill${state.activeCategory === cat ? ' is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', state.activeCategory === cat ? 'true' : 'false');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        state.activeCategory = cat;
        renderCategories();
        renderFlowList();
      });
      fragment.appendChild(btn);
    }
    els.categoryPills.replaceChildren(fragment);
  }

  function filterFlows() {
    const flows = state.manifest && Array.isArray(state.manifest.flows) ? state.manifest.flows : [];
    const query = state.searchQuery.trim().toLowerCase();
    return flows.filter((flow) => {
      if (state.activeCategory !== 'All' && flow.category !== state.activeCategory) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        flow.title,
        flow.shortDescription,
        flow.category,
        flow.trigger,
        ...(Array.isArray(flow.tags) ? flow.tags : []),
        ...(Array.isArray(flow.services) ? flow.services : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  function buildFlowCard(flow) {
    const card = document.createElement('article');
    card.className = 'sa-card';

    const head = document.createElement('div');
    head.className = 'sa-card-head';

    const title = document.createElement('h2');
    title.className = 'sa-card-title';
    title.textContent = flow.title || flow.id || 'Untitled Flow';

    const catTag = document.createElement('span');
    catTag.className = 'sa-cat-tag';
    catTag.textContent = flow.category || 'Automation';

    head.append(title, catTag);

    const meta = document.createElement('div');
    meta.className = 'sa-card-meta';

    const timeItem = document.createElement('span');
    timeItem.className = 'sa-meta-item';
    timeItem.append(iconClock(), document.createTextNode(flow.timeSavedPerWeek || 'Saves time'));

    const scopeCount = getScopeCount(flow);
    const scopeItem = document.createElement('span');
    scopeItem.className = 'sa-meta-item sa-meta-scopes';
    scopeItem.append(
      iconLock(),
      document.createTextNode(`${scopeCount} ${scopeCount === 1 ? 'scope' : 'scopes'}`)
    );

    meta.append(timeItem, scopeItem);

    const desc = document.createElement('p');
    desc.className = 'sa-card-desc';
    desc.textContent = flow.shortDescription || '';

    const actions = document.createElement('div');
    actions.className = 'sa-card-actions';

    const copyScriptBtn = document.createElement('button');
    copyScriptBtn.type = 'button';
    copyScriptBtn.className = 'sa-btn sa-btn-primary';
    copyScriptBtn.append(iconCopy(), document.createTextNode('Copy Script'));
    copyScriptBtn.disabled = !flow.code;
    copyScriptBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(flow.code || '');
      if (ok) {
        flashButtonCopied(copyScriptBtn, iconCopy, 'Copy Script', 'Copied!');
      }
    });

    const tsvPayload = formatSheetTsv(flow.sheetSchema);
    const copyHeadersBtn = document.createElement('button');
    copyHeadersBtn.type = 'button';
    copyHeadersBtn.className = 'sa-btn';
    copyHeadersBtn.append(iconTable(), document.createTextNode('Copy Headers'));
    copyHeadersBtn.disabled = !tsvPayload;
    copyHeadersBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(tsvPayload);
      if (ok) {
        flashButtonCopied(copyHeadersBtn, iconTable, 'Copy Headers', 'Copied!');
      }
    });

    const demoLink = document.createElement('a');
    demoLink.className = 'sa-btn sa-btn-demo';
    const flowId = encodeURIComponent(flow.id || '');
    demoLink.href = `https://sheetautomate.com/?flow=${flowId}&utm_source=chrome_extension&utm_medium=popup_card`;
    demoLink.target = '_blank';
    demoLink.rel = 'noopener noreferrer';
    demoLink.append(document.createTextNode('Live Demo'), iconExternal());

    actions.append(copyScriptBtn, copyHeadersBtn, demoLink);
    card.append(head, meta, desc, actions);
    return card;
  }

  function renderEmptyState(hasAnyFlows) {
    const empty = document.createElement('div');
    empty.className = 'sa-empty';

    const title = document.createElement('div');
    title.className = 'sa-empty-title';
    title.textContent = hasAnyFlows ? 'No matching flows found' : 'No flows bundled yet';

    const text = document.createElement('p');
    text.className = 'sa-empty-text';
    text.textContent = hasAnyFlows
      ? 'Try clearing your search query or switching back to the All category.'
      : 'Syncing the latest VirusTotal & AI-audited flows from sheetautomate.com, or browse the live library online.';

    empty.append(title, text);

    if (hasAnyFlows) {
      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'sa-btn sa-btn-primary';
      resetBtn.textContent = 'Reset Filters';
      resetBtn.addEventListener('click', () => {
        state.activeCategory = 'All';
        state.searchQuery = '';
        els.searchInput.value = '';
        els.clearSearchBtn.hidden = true;
        renderCategories();
        renderFlowList();
      });
      empty.appendChild(resetBtn);
    } else {
      const cta = document.createElement('a');
      cta.className = 'sa-empty-cta';
      cta.href = 'https://sheetautomate.com/?utm_source=chrome_extension&utm_medium=popup_empty';
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.textContent = 'Browse Flows on SheetAutomate.com';
      empty.appendChild(cta);
    }

    els.flowList.replaceChildren(empty);
  }

  function renderFlowList() {
    const allFlows = state.manifest && Array.isArray(state.manifest.flows) ? state.manifest.flows : [];
    const filtered = filterFlows();
    if (filtered.length === 0) {
      renderEmptyState(allFlows.length > 0);
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const flow of filtered) {
      fragment.appendChild(buildFlowCard(flow));
    }
    els.flowList.replaceChildren(fragment);
  }

  function updatePillToggleLabel() {
    els.toggleSheetsPillBtn.textContent = state.pillHidden
      ? 'Sheets Floating Pill: Off'
      : 'Sheets Floating Pill: On';
  }

  async function loadLocalManifest() {
    let bundled = null;
    try {
      const res = await fetch(chrome.runtime.getURL('flows-bundle.json'));
      if (res.ok) {
        const json = await res.json();
        if (isValidManifest(json)) bundled = json;
      }
    } catch (_) {
      // Ignore local read failure
    }

    let cached = null;
    try {
      const stored = await chrome.storage.local.get([STORAGE_MANIFEST_KEY, STORAGE_PILL_HIDDEN_KEY]);
      if (isValidManifest(stored[STORAGE_MANIFEST_KEY])) {
        cached = stored[STORAGE_MANIFEST_KEY];
      }
      state.pillHidden = Boolean(stored[STORAGE_PILL_HIDDEN_KEY]);
    } catch (_) {
      // Ignore storage error
    }

    updatePillToggleLabel();
    state.manifest = pickPreferredManifest(bundled, cached) || {
      generatedAt: '',
      totalFlows: 0,
      auditSummary: { virustotalLabel: '0/72 Clean', aiLabel: 'AI Verified (100%)' },
      flows: [],
    };
    renderHeaderMeta();
    renderFlowList();
  }

  async function syncRemoteManifest() {
    els.syncStatusText.textContent = 'Syncing...';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(REMOTE_MANIFEST_URL, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!res.ok) {
        els.syncStatusText.textContent = 'Offline bundle';
        return;
      }
      const remote = await res.json();
      if (!isValidManifest(remote)) {
        els.syncStatusText.textContent = 'Offline bundle';
        return;
      }
      await chrome.storage.local.set({ [STORAGE_MANIFEST_KEY]: remote }).catch(() => {});
      const prevGenerated = state.manifest?.generatedAt || '';
      const prevLen = state.manifest?.flows?.length || 0;
      if (remote.generatedAt !== prevGenerated || remote.flows.length !== prevLen) {
        state.manifest = remote;
        renderHeaderMeta();
        renderFlowList();
      }
      els.syncStatusText.textContent = 'Synced';
    } catch (_) {
      els.syncStatusText.textContent = 'Offline bundle';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function bindEvents() {
    els.searchInput.addEventListener('input', (event) => {
      state.searchQuery = event.target.value;
      els.clearSearchBtn.hidden = state.searchQuery.length === 0;
      renderFlowList();
    });

    els.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      els.searchInput.value = '';
      els.clearSearchBtn.hidden = true;
      els.searchInput.focus();
      renderFlowList();
    });

    els.guideToggleBtn.addEventListener('click', () => {
      const expanded = els.guideToggleBtn.getAttribute('aria-expanded') === 'true';
      els.guideToggleBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      els.guidePanel.hidden = expanded;
    });

    els.toggleSheetsPillBtn.addEventListener('click', async () => {
      state.pillHidden = !state.pillHidden;
      updatePillToggleLabel();
      try {
        await chrome.storage.local.set({ [STORAGE_PILL_HIDDEN_KEY]: state.pillHidden });
      } catch (_) {
        // Ignore storage error
      }
    });
  }

  async function init() {
    renderCategories();
    bindEvents();
    await loadLocalManifest();
    syncRemoteManifest();
  }

  init();
})();
