export interface GeneratedApp {
  flutterCode: FlutterProject;
  amplifyCode: AmplifyProject;
  githubActions: string;
  adminDashboard: string;
  generatedAt: Date;
}

export interface FlutterProject {
  [fileName: string]: string;
}

export interface AmplifyProject {
  [fileName: string]: string;
}

export interface GenerationStatus {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  updatedAt?: Date;
  errorMessage?: string;
}

export interface GenerationLogs {
  logs: string[];
  updatedAt: Date;
}

export interface Component {
  id: string;
  type: string;
  position?: Position;
  size?: Size;
  properties?: ComponentProperties;
  actions?: Action[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ComponentProperties {
  [key: string]: any;
}

export interface Action {
  trigger: string;
  type: string;
  target?: string;
  parameters?: any;
}

export interface Screen {
  id: string;
  name: string;
  isDefault: boolean;
  components: Component[];
  navigation?: any;
}

export interface DatabaseTable {
  id: string;
  name: string;
  fields: DatabaseField[];
}

export interface DatabaseField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: any;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface CodeValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface BuildArtifact {
  type: 'apk' | 'ipa' | 'web' | 'source';
  url: string;
  size: number;
  checksum: string;
  createdAt: Date;
}