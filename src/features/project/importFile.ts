import { fromSchemas, generateDefaultUiSchema, type LooseSchema, type LooseUiSchema } from '@/features/document-model/import';
import type { LayoutNode, ThemeSettings } from '@/features/document-model/types';

export interface ParsedImport {
  kind: 'project' | 'schemas';
  root: LayoutNode;
  name: string;
  theme?: ThemeSettings;
  id: string | null;
}

type CheckResult = ParsedImport | null;

function asLoose(value: unknown): LooseSchema | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (obj.type !== 'object' || !obj.properties || typeof obj.properties !== 'object') return null;
  return obj as LooseSchema;
}

export function parseImportedFile(text: string): CheckResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (obj.schemaVersion === 1 && obj.root) {
    return {
      kind: 'project',
      root: obj.root as LayoutNode,
      name: typeof obj.name === 'string' ? obj.name : '',
      theme: obj.theme as ThemeSettings | undefined,
      id: null,
    };
  }

  let schema: LooseSchema | null = null;
  let uischema: LooseUiSchema | null = null;

  if (obj.schema && obj.uischema) {
    schema = asLoose(obj.schema);
    uischema = obj.uischema as LooseUiSchema;
  } else if (obj.properties) {
    schema = asLoose(obj);
  }

  if (!schema) return null;
  const ui = uischema ?? generateDefaultUiSchema(schema);
  return {
    kind: 'schemas',
    root: fromSchemas(schema, ui),
    name: '',
    id: null,
  };
}
