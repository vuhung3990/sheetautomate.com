# Catalog Page Design Override — SheetAutomate

> **Inherits:** `web/design-system/sheetautomate/MASTER.md`
> **Scope:** Above-the-fold Hero Search/Filter Bar, Bento Flow Catalog Grid (`#catalog`), Flow Card anatomy, and Flow Workbench Modal.

---

## 1. Above-the-Fold Hierarchy

1. **Compact Hero Header:**
   - Maximum vertical footprint so row 1 of `#catalog` appears immediately on desktop viewports without scrolling past marketing filler.
   - Contains: Live Triple-Audit pills (VirusTotal, AI Verified, MIT Open Source), concise headline, inline Search input (`useDeferredValue`), Category filter pills with live counts, and Trigger / Sort selectors.
2. **Responsive Bento Grid (`#catalog`):**
   - Breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6`.
   - Ordering: Featured flows first, then alphabetical by `title` (user-selectable via Sort dropdown).

---

## 2. Flow Card Anatomy (`FlowCard.tsx`)

| Zone | Content | Tokens & Rules |
| :--- | :--- | :--- |
| **Visual Header** | `thumbnail.svg` rendered via safe `data:image/svg+xml;utf8,...` `<img>` | `aspect-video` frame on `#0F172A` (`bg-slate-900`), subtle `border-b`, zero inline SVG script risk |
| **Meta Strip** | Category pill, Trigger chip, `timeSavedPerWeek` pill | Single-line compact pills; emerald for time saved, sky for trigger |
| **Security Micro-Badges** | `VT 0/72` (or `VT Clean`), `AI 100%`, `N Scopes` | Monospace `text-[11px]`, >= 4.5:1 contrast in light & dark |
| **Body** | Title (`text-lg font-bold`) + 2-line description (`line-clamp-2`) | Max 2 lines description for uniform card heights |
| **Services Row** | Google Workspace service chips (`Sheets`, `Drive`, `Gmail`, etc.) | Crisp bordered pills with Lucide icons |
| **Action Footer** | 3 immediate action buttons | `min-h-[40px]` touch targets: `Live Demo`, `Copy Script`, `GitHub` |

---

## 3. Empty State & Contributor Bento Card

- **Empty Search State:** Shown when search/filters return 0 flows; displays a clear explanation and a `min-h-[44px]` **Reset Filters** button.
- **Contributor PR Bento Card:** Placed at the end of the catalog grid inviting developers to submit a PR to `flows/<slug>/`, explaining that GitHub Actions automatically validates, security-audits, and publishes new flows to both the web catalog and Chrome Extension.

---

## 4. Flow Workbench Modal (`FlowWorkbenchModal.tsx`)

- **Dialog Semantics:** `role="dialog"`, `aria-modal="true"`, Escape key handler, backdrop click close, body scroll lock, `?flow=<slug>` URL sync.
- **3 Tabs (`role="tablist"`):**
  1. **Interactive Demo:** Dynamic `field1..field4` inputs, 3 scenario buttons (`Standard Valid`, `Missing Required Field`, `Duplicate Lock`), `Simulate Automation Run` button (confetti respects `prefers-reduced-motion`), Spreadsheet Audit Log table, and tailored Output Preview (`pdf-document`, `email-dispatch`, `sheet-ops`, `alert-webhook`).
  2. **Code & Starter Sheet:** Unminified `Code.gs` viewer + 1-click copy, `appsscript.json` OAuth scope breakdown with plain-English rationale, and Starter Google Sheet preview (`tabName`, `headers`, `sampleRows`) with `Copy Sample Table (TSV)` + `Open sheets.new & Paste`.
  3. **60s Setup & Audit:** 3-step `setupSteps`, SHA-256 checksum, AI security score & notes, VirusTotal clean status, and direct GitHub folder link.
