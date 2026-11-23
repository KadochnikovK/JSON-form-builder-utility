import { newId } from '@/shared/lib/id';
import type {
  ControlNode,
  DocumentNode,
  LayoutNode,
  RuleEffect,
  RuleOperator,
  SchemaFragment,
  UiRule,
} from './types';
import { createEmptyRoot } from './store';

export interface LooseSchema {
  properties?: Record<
    string,
    {
      type?: string;
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
      description?: string;
    }
  >;
  required?: string[];
}

export interface LooseUiSchema {
  type?: string;
  scope?: string;
  label?: string | Record<string, unknown>;
  text?: string;
  elements?: LooseUiSchema[];
  options?: Record<string, unknown>;
  rule?: {
    effect?: string;
    condition?: {
      scope?: string;
      schema?: { const?: unknown; not?: { const?: unknown } };
    };
  };
}

function ruleFromUi(ui: LooseUiSchema): UiRule | undefined {
  const rule = ui.rule;
  const field = (rule?.condition?.scope ?? '').replace('#/properties/', '');
  const effects: RuleEffect[] = ['SHOW', 'HIDE', 'ENABLE', 'DISABLE'];
  const effect = effects.includes(rule?.effect as RuleEffect)
    ? (rule?.effect as RuleEffect)
    : 'SHOW';
  if (!rule || !field) return undefined;
  const rawConst = rule.condition?.schema?.const;
  const rawNotConst = rule.condition?.schema?.not?.const;
  const isNot = rawConst === undefined && rawNotConst !== undefined;
  const rawValue = isNot ? rawNotConst : rawConst;
  if (rawValue === undefined) return undefined;
  return {
    effect,
    field,
    operator: (isNot ? 'notEquals' : 'equals') as RuleOperator,
    value: String(rawValue),
  };
}

function fragmentFromProperty(
  prop: NonNullable<LooseSchema['properties']>[string],
): SchemaFragment {
  const fragment: SchemaFragment = { type: (prop.type as SchemaFragment['type']) || 'string' };
  if (prop.format) fragment.format = prop.format;
  if (prop.enum) fragment.enum = [...prop.enum];
  if (prop.minimum !== undefined) fragment.minimum = prop.minimum;
  if (prop.maximum !== undefined) fragment.maximum = prop.maximum;
  if (prop.multipleOf !== undefined) fragment.multipleOf = prop.multipleOf;
  if (prop.minLength !== undefined) fragment.minLength = prop.minLength;
  if (prop.maxLength !== undefined) fragment.maxLength = prop.maxLength;
  if (prop.pattern) fragment.pattern = prop.pattern;
  if (prop.readOnly) fragment.readOnly = true;
  if (prop.default !== undefined) fragment.default = prop.default;
  return fragment;
}

function makeControlNode(
  name: string,
  ui: LooseUiSchema,
  schema: LooseSchema,
): ControlNode {
  const prop = schema.properties?.[name] ?? {};
  const fragment = fragmentFromProperty(prop);
  const label =
    typeof ui.label === 'string' ? ui.label : typeof ui.label?.text === 'string' ? ui.label.text : '';
  const options = (ui.options ?? {}) as Record<string, unknown>;

  let controlType: ControlNode['controlType'] = 'text';
  if (ui.type === 'MultiLineControl') controlType = 'textarea';
  else if (ui.type === 'RadioGroupControl') controlType = 'radio';
  else if (options.format === 'slider') controlType = 'slider';
  else if (fragment.format === 'date') controlType = 'date';
  else if (fragment.format === 'time') controlType = 'time';
  else if (fragment.format === 'date-time') controlType = 'datetime';
  else if (fragment.enum) controlType = 'select';
  else if (fragment.type === 'boolean') controlType = 'checkbox';
  else if (fragment.type === 'number' || fragment.type === 'integer') controlType = 'number';

  const node: ControlNode = {
    id: newId(),
    kind: 'control',
    controlType,
    name,
    label,
    required: Boolean(schema.required?.includes(name)),
    schema: fragment,
  };
  if (typeof options.placeholder === 'string') node.placeholder = options.placeholder;
  if (prop.description) node.description = prop.description;
  const rule = ruleFromUi(ui);
  if (rule) node.rule = rule;
  return node;
}

function convertElements(elements: LooseUiSchema[], schema: LooseSchema): DocumentNode[] {
  const out: DocumentNode[] = [];
  for (const ui of elements) {
    if (ui.type === 'Control' || ui.type === 'MultiLineControl' || ui.type === 'RadioGroupControl') {
      const name = (ui.scope ?? '').replace('#/properties/', '');
      if (name) out.push(makeControlNode(name, ui, schema));
    } else if (ui.type === 'VerticalLayout' || ui.type === 'HorizontalLayout') {
      const layoutType = ui.type === 'HorizontalLayout' ? 'horizontal' : 'vertical';
      const wrap = Boolean((ui.options as { wrap?: boolean } | undefined)?.wrap);
      out.push({
        id: newId(),
        kind: 'layout',
        layoutType,
        ...(wrap ? { options: { wrap: true } } : {}),
        children: convertElements(ui.elements ?? [], schema),
      });
    } else if (ui.type === 'Group') {
      out.push({
        id: newId(),
        kind: 'layout',
        layoutType: 'group',
        ...(typeof ui.label === 'string' ? { label: ui.label } : {}),
        children: convertElements(ui.elements ?? [], schema),
      });
    } else if (ui.type === 'Categorization') {
      const categories = (ui.elements ?? [])
        .filter((cat) => cat.type === 'Category')
        .map((cat) => ({
          id: newId(),
          kind: 'layout' as const,
          layoutType: 'vertical' as const,
          ...(typeof cat.label === 'string' ? { label: cat.label } : {}),
          children: convertElements(cat.elements ?? [], schema),
        }));
      out.push({ id: newId(), kind: 'layout', layoutType: 'tabs', children: categories });
    } else if (ui.type === 'Label') {
      out.push({
        id: newId(),
        kind: 'static',
        staticType: 'label',
        text: typeof ui.text === 'string' ? ui.text : '',
      });
    }
  }
  return out;
}

export function fromSchemas(schema: LooseSchema, uischema: LooseUiSchema): LayoutNode {
  const root = createEmptyRoot();
  root.children = uischema.elements ? convertElements(uischema.elements, schema) : [];
  return root;
}

export function generateDefaultUiSchema(schema: LooseSchema): LooseUiSchema {
  const names = Object.keys(schema.properties ?? {});
  return {
    type: 'VerticalLayout',
    elements: names.map((name) => ({ type: 'Control', scope: `#/properties/${name}` })),
  };
}
