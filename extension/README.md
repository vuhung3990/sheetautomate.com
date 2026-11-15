# SheetAutomate Chrome Extension (Manifest V3)

Browse, copy, and deploy 100% free, VirusTotal & AI-audited Google Apps Script automations directly from your browser or inside Google Sheets.

## Features

- **Offline-first flow library (`flows-bundle.json`)** with silent background sync from `https://sheetautomate.com/flows-manifest.json`.
- **1-Click Copy Script**: Copies the audited `Code.gs` Apps Script directly to your clipboard.
- **1-Click Copy Headers (TSV)**: Copies tab-separated sheet headers and sample rows so you can paste directly into cell `A1` of a new Google Sheet.
- **Google Sheets Floating Assistant**: Non-intrusive bottom-right pill on `https://docs.google.com/spreadsheets/*` with a quick-search drawer, paste instructions (`Extensions > Apps Script`), and instant dismiss/restore preference stored in `chrome.storage.local`.
- **Strict Least-Privilege Manifest V3**:
  - `permissions`: `["storage", "clipboardWrite"]` (no `tabs`, no `scripting`, no `<all_urls>`)
  - `host_permissions`: `["https://sheetautomate.com/*"]`
  - `content_scripts`: strictly `https://docs.google.com/spreadsheets/*`

## Directory Structure

```text
extension/
├── manifest.json         # Manifest V3 configuration
├── flows-bundle.json     # Offline bundled flows (populated by scripts/build-flows-manifest.mjs)
├── popup.html            # 420x580 extension popup markup
├── popup.css             # Dark-slate & emerald popup theme
├── popup.js              # Popup search, category filters, clipboard & background sync
├── content-sheets.css    # Isolated (.sa-ext-*) styles for Google Sheets overlay
├── content-sheets.js     # Floating pill & quick drawer injected on docs.google.com/spreadsheets/*
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Loading Unpacked in Chrome

1. *(Optional, from the repository root)* Build the latest flows bundle if `extension/flows-bundle.json` only has the placeholder:
   ```bash
   node scripts/build-flows-manifest.mjs
   ```
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `extension/` folder.
5. Pin **SheetAutomate** to your Chrome toolbar and click the icon to open the 420x580 popup.

## Testing Inside Google Sheets

1. Open any spreadsheet at `https://docs.google.com/spreadsheets/` (or `https://sheets.new`).
2. Confirm the **SheetAutomate** pill appears in the bottom-right corner without colliding with Google Sheets UI styles.
3. Click the pill to open the quick drawer, test searching a flow, click **Copy Headers**, and paste into cell `A1`.
4. Open **Extensions > Apps Script**, paste the code copied via **Copy Script** into `Code.gs`, save, and reload the sheet.
5. Click the `×` button on the pill to dismiss it (`sa_pill_hidden = true`), and verify it stays hidden across reloads. You can re-enable it anytime from the **How to paste into Google Sheets** footer inside the extension popup.

## Submitting to the Chrome Web Store

1. Ensure `extension/flows-bundle.json` is freshly built with the latest flows:
   ```bash
   node scripts/build-flows-manifest.mjs
   ```
2. Package the `extension/` directory into a `.zip` archive (with `manifest.json` at the root of the zip):
   ```bash
   cd extension && zip -r ../sheetautomate-extension-v1.0.0.zip . -x "*.DS_Store" "README.md"
   ```
3. In the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):
   - **Single purpose**: Help Google Sheets users discover, copy, and set up free open-source Google Apps Script automations.
   - **Permission justifications**:
     - `storage`: Stores cached flow metadata (`sa_manifest_cache`) and user preference (`sa_pill_hidden`) for dismissing the floating pill.
     - `clipboardWrite`: Enables 1-click copying of Apps Script (`Code.gs`) and tab-separated sheet headers (`A1` paste).
     - Host permission `https://sheetautomate.com/*`: Fetches `https://sheetautomate.com/flows-manifest.json` to keep bundled flows up to date.
   - **Data usage**: Zero user tracking, zero analytics, and zero spreadsheet data collection. All code runs locally in the browser.
