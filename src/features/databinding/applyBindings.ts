import { toJsonSchema } from '@/features/document-model/serialize';
import type { ControlNode, DataBinding, DocumentNode, LayoutNode } from '@/features/document-model/types';

function resolveItemsPath(value: unknown, itemsPath: string): unknown {
  const clean = itemsPath.replace(/^\$\.?/, '').replace(/\.$/, '');
  if (clean === '') return value;
  return clean.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

export function bindingItems(binding: DataBinding): { label: string; value: string | number }[] | null {
  if (!binding.mock.trim()) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(binding.mock);
  } catch {
    return null;
  }
  const items = resolveItemsPath(parsed, binding.itemsPath || '');
  if (!Array.isArray(items)) return null;
  return items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      label: String(item[binding.labelKey] ?? item[binding.valueKey] ?? ''),
      value: (item[binding.valueKey] ?? item[binding.labelKey]) as string | number,
    }));
}

export interface BoundSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

export function buildPreviewSchema(root: LayoutNode): BoundSchema {
  const base = toJsonSchema(root);
  const bound: Record<string, ControlNode> = {};
  const walk = (node: DocumentNode) => {
    if (node.kind === 'control' && node.dataBinding?.url) bound[node.name] = node;
    else if (node.kind === 'layout') node.children.forEach(walk);
  };
  walk(root);
  if (Object.keys(bound).length === 0) return base;

  const properties: Record<string, unknown> = { ...base.properties };
  for (const [name, control] of Object.entries(bound)) {
    const items = bindingItems(control.dataBinding as DataBinding);
    if (!items || items.length === 0) continue;
    const prop = { ...(properties[name] as Record<string, unknown>) };
    delete prop.enum;
    prop.oneOf = items.map((item) => ({ const: item.value, title: item.label }));
    properties[name] = prop;
  }
  return { ...base, properties };
}
