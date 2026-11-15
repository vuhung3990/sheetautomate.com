# SheetAutomate Open-Source Google Apps Script Flows

Every directory inside `flows/` represents a standalone, MIT-licensed Google Workspace automation flow that is automatically discovered and published to **SheetAutomate.com** and the **SheetAutomate Chrome Extension**.

## Directory Convention

```text
flows/<slug>/
├── flow.json         # Catalog metadata, Sheet schema, and interactive demo config
├── Code.gs           # Unminified, production-ready Google Apps Script (V8)
├── appsscript.json   # Explicit least-privilege OAuth scopes manifest
├── thumbnail.svg     # Standalone 400x220 vector workflow diagram
└── README.md         # Setup instructions and OAuth permission breakdown
```

## Contributing a New Flow

1. Copy an existing flow folder (e.g. `flows/b2b-client-invoice`) to `flows/<your-slug>`.
2. Keep OAuth scopes in `appsscript.json` strictly minimal (`spreadsheets.currentonly`, `drive.file`, etc.) and guard execution with `LockService.getScriptLock()`.
3. Validate locally before opening a Pull Request:
   ```bash
   node scripts/validate-flows.mjs
   ```
4. Once merged to `main`, GitHub Actions automatically runs VirusTotal scanning, AI security auditing, badge generation, and Cloudflare Pages deployment.
