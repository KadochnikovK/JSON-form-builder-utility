import type {
  ControlNode,
  DataBinding,
  DocumentNode,
  LayoutNode,
  SchemaFragment,
  StaticNode,
} from './types';

export interface UiSchemaElement {
  type: string;
  scope?: string;
  label?: string;
  text?: string;
  elements?: UiSchemaElement[];
  options?: Record<string, unknown>;
  rule?: Record<string, unknown>;
}

export function toJsonSchema(root: LayoutNode): {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const visit = (node: DocumentNode) => {
    if (node.kind === 'control') {
      properties[node.name] = controlToJsonSchema(node);
      if (node.required) required.push(node.name);
    } else if (node.kind === 'layout') {
      node.children.forEach(visit);
    }
  };
  visit(root);
  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function controlToJsonSchema(node: ControlNode): Record<string, unknown> {
  const out: Record<string, unknown> = { ...schemaFragmentToJson(node.schema) };
  if (node.description) out.description = node.description;
  return out;
}

function schemaFragmentToJson(fragment: SchemaFragment): Record<string, unknown> {
  const out: Record<string, unknown> = { type: fragment.type };
  if (fragment.format) out.format = fragment.format;
  if (fragment.enum && fragment.enum.length > 0) out.enum = [...fragment.enum];
  if (fragment.minimum !== undefined) out.minimum = fragment.minimum;
  if (fragment.maximum !== undefined) out.maximum = fragment.maximum;
  if (fragment.multipleOf !== undefined) out.multipleOf = fragment.multipleOf;
  if (fragment.minLength !== undefined) out.minLength = fragment.minLength;
  if (fragment.maxLength !== undefined) out.maxLength = fragment.maxLength;
  if (fragment.pattern) out.pattern = fragment.pattern;
  if (fragment.readOnly) out.readOnly = true;
  if (fragment.default !== undefined) out.default = fragment.default;
  return out;
}

export function toUiSchema(root: LayoutNode): UiSchemaElement {
  const schemaTypes = buildSchemaTypeMap(root);
  return { type: 'VerticalLayout', elements: root.children.map((c) => nodeToUi(c, schemaTypes)) };
}

function buildSchemaTypeMap(root: LayoutNode): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (node: DocumentNode) => {
    if (node.kind === 'control') map.set(node.name, node.schema.type);
    else if (node.kind === 'layout') node.children.forEach(walk);
  };
  walk(root);
  return map;
}

function nodeToUi(node: DocumentNode, schemaTypes: Map<string, string>): UiSchemaElement {
  if (node.kind === 'static') return staticToUi(node);
  if (node.kind === 'layout') {
    switch (node.layoutType) {
      case 'vertical':
        return { type: 'VerticalLayout', elements: node.children.map((c) => nodeToUi(c, schemaTypes)) };
      case 'horizontal':
        return {
          type: 'HorizontalLayout',
          ...(node.options?.wrap ? { options: { wrap: true } } : {}),
          elements: node.children.map((c) => nodeToUi(c, schemaTypes)),
        };
      case 'group':
        return {
          type: 'Group',
          ...(node.label ? { label: node.label } : {}),
          elements: node.children.map((c) => nodeToUi(c, schemaTypes)),
        };
      case 'tabs':
        return {
          type: 'Categorization',
          elements: node.children
            .filter((child): child is LayoutNode => child.kind === 'layout')
            .map((category) => ({
              type: 'Category',
              label: category.label || '…',
              elements: [
                {
                  type: 'VerticalLayout',
                  elements: category.children.map((c) => nodeToUi(c, schemaTypes)),
                },
              ],
            })),
        };
    }
  }
  return controlToUi(node, schemaTypes);
}

function staticToUi(node: StaticNode): UiSchemaElement {
  return { type: 'Label', text: node.text };
}

function ruleValueFor(rule: ControlNode['rule'], schemaTypes: Map<string, string>): unknown {
  if (!rule) return undefined;
  const targetType = schemaTypes.get(rule.field);
  if (targetType === 'number' || targetType === 'integer') {
    const num = Number(rule.value);
    return rule.value !== '' && !Number.isNaN(num) ? num : rule.value;
  }
  if (targetType === 'boolean') {
    return rule.value === 'true';
  }
  return rule.value;
}

function ruleToUi(node: ControlNode, schemaTypes: Map<string, string>): Record<string, unknown> | undefined {
  const rule = node.rule;
  if (!rule || !rule.field) return undefined;
  const value = ruleValueFor(rule, schemaTypes);
  const conditionSchema =
    rule.operator === 'notEquals' ? { not: { const: value } } : { const: value };
  return {
    effect: rule.effect,
    condition: {
      scope: `#/properties/${rule.field}`,
      schema: conditionSchema,
    },
  };
}

function controlToUi(node: ControlNode, schemaTypes: Map<string, string>): UiSchemaElement {
  const options: Record<string, unknown> = {};
  let type = 'Control';
  if (node.controlType === 'textarea') {
    type = 'MultiLineControl';
  } else if (node.controlType === 'radio') {
    type = 'RadioGroupControl';
  } else if (node.controlType === 'slider') {
    options.format = 'slider';
  }
  if (node.placeholder) options.placeholder = node.placeholder;
  if (node.schema.readOnly) options.readOnly = true;
  const rule = ruleToUi(node, schemaTypes);
  return {
    type,
    scope: `#/properties/${node.name}`,
    label: node.label || node.name,
    ...(Object.keys(options).length > 0 ? { options } : {}),
    ...(rule ? { rule } : {}),
  };
}

export function toDataBindings(root: LayoutNode): Record<string, DataBinding> {
  const bindings: Record<string, DataBinding> = {};
  const walk = (node: DocumentNode) => {
    if (node.kind === 'control' && node.dataBinding?.url) {
      bindings[node.name] = node.dataBinding;
    } else if (node.kind === 'layout') {
      node.children.forEach(walk);
    }
  };
  walk(root);
  return bindings;
}

export function defaultsFromSchema(
  schema: { properties?: Record<string, unknown> },
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    if (
      prop &&
      typeof prop === 'object' &&
      (prop as { default?: unknown }).default !== undefined
    ) {
      out[name] = structuredClone((prop as { default: unknown }).default);
    }
  }
  return out;
}
