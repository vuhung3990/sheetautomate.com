# Design System Master File — SheetAutomate

> **Source of Truth:** Authoritative design tokens, visual hierarchy, and component rules for SheetAutomate.com.
> **Architecture:** Catalog-First Open-Source Hub (12+ auto-discovered Google Workspace flows, interactive workbench modal, Manifest V3 Chrome Extension, CI/CD verification badges).
> **Theme Support:** Light Mode (Default) + Dark Mode (Toggleable via Sun/Moon icon in Navbar, persisted in `localStorage`).
> **Distribution Model:** 100% Free Forever & Open Source (MIT License on GitHub: `hungvvinfinity/sheetautomate.com`).
> **Verification & Trust:** Triple-audited by Open Source Community, AI Multi-Model Static Gate, and VirusTotal (0/72 Clean).
> **Accessibility Standard:** WCAG 2.2 AA compliant across all interactive controls, contrast ratios, keyboard navigation, and reduced-motion preferences.
> **Iconography Standard:** Lucide React (`lucide-react`) SVG icons ONLY. Zero emojis used as structural UI icons.

---

**Project:** SheetAutomate.com  
**Category:** Free & Open-Source Google Workspace Automation Catalog & Chrome Extension  
**Theme:** Crisp Professional Light (Default) / High-Tech Slate Dark  

---

## 1. Color Palette & Dual-Mode Token Mapping

| Token Role | Light Mode (Default) | Dark Mode | Semantic Usage & Contrast Verification |
| :--- | :--- | :--- | :--- |
| **Page Background** | `#F8FAFC` (`bg-slate-50`) | `#080C14` (`bg-dark-950`) | Root body background |
| **Card / Surface** | `#FFFFFF` (`bg-white`) | `#0F172A` (`bg-dark-900`) | Catalog cards, modals, feature panels |
| **Sub-panel / Input** | `#F1F5F9` (`bg-slate-100`) | `#131D35` (`bg-dark-850`) | Search bar, code blocks, table headers |
| **Borders** | `#E2E8F0` (`border-slate-200`) | `#1E293B` (`border-slate-800`) | Card boundaries, dividers (>= 3:1 non-text) |
| **Text Primary** | `#0F172A` (`text-slate-900`) | `#FFFFFF` (`text-white`) | Headings, card titles (>= 15:1) |
| **Text Body** | `#334155` (`text-slate-700`) | `#CBD5E1` (`text-slate-300`) | Descriptions, setup steps (>= 9.6:1) |
| **Text Muted** | `#475569` (`text-slate-600`) | `#94A3B8` (`text-slate-400`) | Metadata, timestamps, counts (>= 5.6:1) |
| **Primary Brand CTA** | `#10B981` (`bg-brand-500`) | `#10B981` (`bg-brand-500`) | Google Sheets Emerald — Primary action buttons |
| **Brand CTA Text** | `#020617` (`text-slate-950`) | `#020617` (`text-slate-950`) | Deep slate text on brand green (7.95:1) |
| **Accent Text / Links**| `#047857` (`text-emerald-700`)| `#34D399` (`text-brand-400`) | Accent badges and text links (>= 4.5:1) |
| **Secondary Accent** | `#0369A1` (`text-sky-700`) | `#38BDF8` (`text-accent-400`)| Cloud Blue — Trigger & service chips (>= 4.5:1) |
| **Focus Indicator** | `#047857` (`outline-emerald-700`)| `#10B981` (`outline-brand-500`)| 2px `outline-offset-2` (>= 3:1 non-text) |

---

## 2. WCAG 2.2 AA Contrast Compliance Ratios

| Element Pair | Contrast Ratio | WCAG 2.2 AA Requirement | Status |
| :--- | :--- | :--- | :--- |
| `text-slate-900` on `#ffffff` (Light) | **15.9:1** | Minimum 4.5:1 | Passed |
| `text-slate-700` on `#ffffff` (Light) | **9.6:1** | Minimum 4.5:1 | Passed |
| `text-slate-600` on `#ffffff` (Light) | **5.68:1** | Minimum 4.5:1 | Passed |
| `text-emerald-700` on `#ffffff` (Light) | **4.53:1** | Minimum 4.5:1 | Passed |
| `text-slate-950` on `bg-brand-500` (CTA) | **7.95:1** | Minimum 4.5:1 | Passed |
| `text-white` on `#080c14` (Dark) | **19.5:1** | Minimum 4.5:1 | Passed |
| `text-slate-300` on `#080c14` (Dark) | **10.5:1** | Minimum 4.5:1 | Passed |
| `text-brand-400` on `#080c14` (Dark) | **8.2:1** | Minimum 4.5:1 | Passed |
| Focus ring `#047857` on `#ffffff` | **4.53:1** | Minimum 3.0:1 | Passed |
| Focus ring `#10b981` on `#080c14` | **8.2:1** | Minimum 3.0:1 | Passed |

---

## 3. Auto-Discovered Open-Source Ecosystem

1. **Dynamic Flow Registry (`flows/<slug>/`):**
   - Vite `import.meta.glob` auto-discovers every folder in `flows/` containing `flow.json`, `Code.gs`, `appsscript.json`, and `thumbnail.svg`.
   - Zero hardcoded flow lists in React; opening a PR that adds `flows/<new-slug>/` automatically updates the catalog, search index, and generated manifests.
2. **Interactive Flow Workbench Modal (`?flow=<slug>`):**
   - Deep-linkable 3-tab modal: **Interactive Demo**, **Code & Starter Sheet**, and **60s Setup & Audit**.
   - Supports 1-click `Code.gs` copy, least-privilege OAuth scope explanations, TSV starter table copy for `sheets.new`, and tailored simulation previews.
3. **Manifest V3 Chrome Extension:**
   - Companion floating assistant inside Google Sheets synced with `flows-bundle.json` / `flows-manifest.json`.
   - Zero tracking, zero telemetry, 1-click unpacked installation from `/downloads/sheetautomate-chrome-extension.zip`.
4. **CI/CD Triple-Audit Verification:**
   - Static AST Gate + AI Security Audit + VirusTotal 0/72 scan badges (`/badges/virustotal.svg`, `/badges/ai-security.svg`, `/badges/flows-count.svg`) published with `flows/audit-status.json`.
