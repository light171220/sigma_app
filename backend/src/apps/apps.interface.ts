export interface AppConfig {
  id: string;
  name: string;
  packageName: string;
  description?: string;
  category?: string;
  theme: ThemeConfig;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface Screen {
  id: string;
  name: string;
  isDefault: boolean;
  components: Component[];
  navigation?: NavigationConfig;
}

export interface Component {
  id: string;
  type: string;
  position: Position;
  size: Size;
  properties: ComponentProperties;
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

export interface NavigationConfig {
  [key: string]: any;
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
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

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  actions: WorkflowAction[];
}

export interface WorkflowAction {
  type: string;
  parameters: any;
}