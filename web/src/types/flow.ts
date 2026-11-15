export type FlowCategory =
  | 'Document & PDF'
  | 'Email & Gmail'
  | 'Finance & Ops'
  | 'HR & Team'
  | 'Alerts & Sync';

export type FlowService =
  | 'Sheets'
  | 'Docs'
  | 'Drive'
  | 'Gmail'
  | 'Forms'
  | 'Chat/Webhook';

export type FlowOutputType =
  | 'pdf-document'
  | 'email-dispatch'
  | 'sheet-ops'
  | 'alert-webhook';

export interface FlowDemoField {
  key: 'field1' | 'field2' | 'field3' | 'field4';
  label: string;
  defaultValue: string;
  required?: boolean;
  highlight?: boolean;
  multiline?: boolean;
}

export interface FlowSheetSchema {
  tabName: string;
  headers: string[];
  sampleRows: string[][];
}

export interface FlowDemoConfig {
  recordId: string;
  fields: FlowDemoField[];
  outputType: FlowOutputType;
  outputTitle: string;
  outputSubtitle: string;
  auditColumn: string;
}

export interface FlowMetadata {
  id: string;
  title: string;
  shortDescription: string;
  category: FlowCategory;
  tags: string[];
  trigger: string;
  difficulty: 'Beginner' | 'Intermediate';
  timeSavedPerWeek: string;
  featured: boolean;
  copySheetUrl: string;
  services: FlowService[];
  setupSteps: string[];
  sheetSchema: FlowSheetSchema;
  demo: FlowDemoConfig;
}

export interface AppsScriptManifest {
  timeZone?: string;
  dependencies?: Record<string, unknown>;
  exceptionLogging?: string;
  runtimeVersion?: string;
  oauthScopes?: string[];
}

export interface FlowAuditEntry {
  sha256: string;
  scopesCount: number;
  vtClean: boolean;
  aiStatus: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  aiScore: number;
  notes: string;
}

export interface AuditStatusManifest {
  version: string;
  updatedAt: string;
  repository: string;
  totalFlows: number;
  virustotal: {
    status: 'clean' | 'pending' | 'flagged';
    detections: number;
    engines: number;
    label: string;
    bundleSha256: string;
    reportUrl: string;
  };
  aiSecurity: {
    status: 'passed' | 'warning' | 'failed';
    provider: string;
    score: number;
    label: string;
    summary: string;
  };
  flows: Record<string, FlowAuditEntry>;
}

export interface FlowItem extends FlowMetadata {
  codeGs: string;
  appsScriptJson: string;
  oauthScopes: string[];
  thumbnailSvg: string;
  audit: FlowAuditEntry;
  githubUrl: string;
}

export type FlowSortOption = 'featured' | 'alphabetical' | 'least-scopes';

export interface OAuthScopeExplanation {
  scope: string;
  shortName: string;
  rationale: string;
  level: 'Minimal' | 'Standard';
}
