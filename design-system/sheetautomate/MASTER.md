# Design System Master File — SheetAutomate

> **Source of Truth:** Authoritative design tokens, visual hierarchy, and component rules for SheetAutomate.com.
> **Theme Support:** Light Mode (Default) + Dark Mode (Toggleable via Sun/Moon icon in Navbar, persisted in localStorage).
> **Pricing Model:** Fixed one-time purchase per workflow starting from $5 (Zero recurring SaaS subscriptions).
> **Accessibility Standard:** WCAG 2.2 AA compliant across all interactive controls, text contrast ratios, and states.

---

**Project:** SheetAutomate.com  
**Category:** Productized Google Workspace Document Automation & Templates  
**Theme:** Crisp Professional Light (Default) / High-Tech Slate Dark  

---

## 1. Color Palette & Dual-Mode Token Mapping

| Token Role | Light Mode (Default) | Dark Mode | Semantic Usage & Contrast Verification |
| :--- | :--- | :--- | :--- |
| **Page Background** | `#F8FAFC` (`bg-slate-50`) | `#080C14` (`bg-dark-950`) | Root body background |
| **Card / Surface** | `#FFFFFF` (`bg-white`) | `#0F172A` (`bg-dark-900`) | Main containers, feature blocks, panels |
| **Sub-panel / Input** | `#F1F5F9` (`bg-slate-100`) | `#131D35` (`bg-dark-850`) | Input fields, code rows, table headers |
| **Borders** | `#E2E8F0` (`border-slate-200`) | `#1E293B` (`border-slate-800`) | Card boundaries, dividers (>= 3:1 non-text) |
| **Text Primary** | `#0F172A` (`text-slate-900`) | `#FFFFFF` (`text-white`) | Headings, high-contrast titles (>= 15:1) |
| **Text Body** | `#334155` (`text-slate-700`) | `#CBD5E1` (`text-slate-300`) | Paragraph copy, descriptions (>= 9.6:1) |
| **Text Muted** | `#475569` (`text-slate-600`) | `#94A3B8` (`text-slate-400`) | Secondary captions, timestamps (>= 5.6:1) |
| **Primary Brand CTA** | `#10B981` (`bg-brand-500`) | `#10B981` (`bg-brand-500`) | Google Sheets Emerald — Primary CTA buttons |
| **Brand CTA Text** | `#020617` (`text-slate-950`) | `#020617` (`text-slate-950`) | Deep slate text on brand green (7.95:1) |
| **Accent Text / Links**| `#047857` (`text-emerald-700`)| `#34D399` (`text-brand-400`) | Accent badges and text links (>= 4.5:1) |
| **Secondary Accent** | `#0369A1` (`text-sky-700`) | `#38BDF8` (`text-accent-400`)| Cloud Blue — Informational chips (>= 4.5:1) |
| **Focus Indicator** | `#047857` (`outline-emerald-700`)| `#10B981` (`outline-brand-500`)| 2px outline-offset-2 (>= 3:1 non-text) |

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
| `text-slate-400` on `#080c14` (Dark) | **6.3:1** | Minimum 4.5:1 | Passed |
| `text-brand-400` on `#080c14` (Dark) | **8.2:1** | Minimum 4.5:1 | Passed |
| Focus ring `#047857` on `#ffffff` | **4.53:1** | Minimum 3.0:1 | Passed |
| Focus ring `#10b981` on `#080c14` | **8.2:1** | Minimum 3.0:1 | Passed |

---

## 3. Productized Pricing Tiers & Scope Definitions

1. **Self-Deploy Template ($5 one-time):**
   - Instant copy link to production-ready Google Sheet + matching Google Doc template + Apps Script.
   - Choose 1 document type: Invoice, Work Order, or Certificate.
   - Includes idempotency duplicate prevention, custom sheet menu button, and quickstart guide.
   - Unlimited exports within Google Workspace quotas, $0/month forever.
2. **Configured Workflow ($35 one-time):**
   - 1 production workflow configured by an engineer in your Google Workspace.
   - Custom branding: company logo, typography, color scheme.
   - Mapped to your existing spreadsheet columns or Google Form questions.
   - Folder auto-sorting in Google Drive + Sheet audit logging.
   - 14-day bug warranty & 1 test revision cycle. Delivered within 48 hours.
3. **Turnkey Custom Workflow ($95 one-time):**
   - 1 advanced workflow with dynamic multi-row line items (itemized invoices, quotes).
   - Automated Google Form instant trigger or conditional routing logic.
   - Optional webhook alert (Slack or Gmail dispatch).
   - 30-day bug warranty & staff video walkthrough. Delivered within 3–5 business days.

---

## 4. Architectural Comparison Against Recurring SaaS

- **Pricing:** Fixed $5–$35 one-time purchase vs $30–$80/mo ($360–$960/yr) recurring on multi-app subscription tools.
- **Privacy:** 100% In-tenant Google Drive & Apps Script processing. No external middleware databases.
- **Quotas:** Zero SheetAutomate document caps or per-export fees. Standard Google Workspace Apps Script execution limits apply.
- **Ownership:** Complete editable source code inside your Google Sheet with perpetual internal-use rights.
