export type WidgetVariableType =
  | 'text'
  | 'secret'
  | 'number'
  | 'boolean'
  | 'color';

export interface WidgetVariableDefinition {
  name: string;
  type: WidgetVariableType;
  title: string;
  description?: string;
  default?: string | number | boolean;
  required?: boolean;
  placeholder?: string;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetManifest {
  name: string;
  version: string;
  title: string;
  description?: string;
  icon?: string;
  author?: string;
  size: WidgetSize;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
  resizable?: boolean;
  variables?: WidgetVariableDefinition[];
}

export interface WidgetVariableValues {
  [key: string]: string | number | boolean;
}

export interface WidgetInstance {
  id: string;
  widgetName: string;
  position: WidgetPosition;
  size: WidgetSize;
  variables: WidgetVariableValues;
  enabled: boolean;
  refreshInterval?: number;
}

export interface WidgetState {
  manifest: WidgetManifest;
  path: string;
  sourceCode: string;
  isBuilt: boolean;
  buildError?: string;
  instances: WidgetInstance[];
}

export interface WidgetConfig {
  widgets: WidgetInstance[];
}

export type WidgetBuildStatus = 'pending' | 'building' | 'success' | 'error';

export interface WidgetBuildResult {
  status: WidgetBuildStatus;
  error?: string;
  outputPath?: string;
}

export interface WidgetWindowPayload {
  instanceId: string;
  widgetName: string;
  sourceCode: string;
  variables: WidgetVariableValues;
  size: WidgetSize;
  refreshInterval?: number;
}
