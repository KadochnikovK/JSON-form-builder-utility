export type ControlType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'slider'
  | 'date'
  | 'time'
  | 'datetime';

export type LayoutType = 'vertical' | 'horizontal' | 'group' | 'tabs';

export type StaticType = 'label';

export interface SchemaFragment {
  type: 'string' | 'number' | 'integer' | 'boolean';
  format?: string;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  readOnly?: boolean;
  default?: unknown;
}

export type RuleEffect = 'SHOW' | 'HIDE' | 'ENABLE' | 'DISABLE';
export type RuleOperator = 'equals' | 'notEquals';

export interface UiRule {
  effect: RuleEffect;
  field: string;
  operator: RuleOperator;
  value: string;
}

export interface DataBinding {
  url: string;
  itemsPath: string;
  labelKey: string;
  valueKey: string;
  mock: string;
}

export interface ControlNode {
  id: string;
  kind: 'control';
  controlType: ControlType;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  schema: SchemaFragment;
  rule?: UiRule;
  dataBinding?: DataBinding;
}

export interface LayoutOptions {
  wrap?: boolean;
}

export interface LayoutNode {
  id: string;
  kind: 'layout';
  layoutType: LayoutType;
  label?: string;
  options?: LayoutOptions;
  children: DocumentNode[];
}

export interface StaticNode {
  id: string;
  kind: 'static';
  staticType: StaticType;
  text: string;
}

export type DocumentNode = ControlNode | LayoutNode | StaticNode;

export interface DropTarget {
  containerId: string;
  index: number;
}

export interface ThemeSettings {
  accent?: string;
  radius?: number;
  density?: 'comfortable' | 'compact';
}

export const DEFAULT_THEME: ThemeSettings = {
  accent: '#2563eb',
  radius: 6,
  density: 'comfortable',
};
