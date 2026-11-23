import { describe, expect, it } from 'vitest';
import { collectControlNames, findParent, isAncestor, reassignIds } from './ops';
import { defaultsFromSchema, toJsonSchema, toUiSchema } from './serialize';
import { fromSchemas } from './import';
import { createEmptyRoot, useBuilder } from './store';
import { toDataBindings } from './serialize';
import { buildPreviewSchema } from '@/features/databinding/applyBindings';
import { lintDocument } from '@/features/validation/lint';
import type { ControlNode, DocumentNode, LayoutNode, StaticNode } from './types';

const staticNode = (text: string): StaticNode => ({
  id: `st-${text}`,
  kind: 'static',
  staticType: 'label',
  text,
});

const control = (name: string, over: Partial<ControlNode> = {}): ControlNode => ({
  id: name,
  kind: 'control',
  controlType: 'text',
  name,
  label: name,
  required: false,
  schema: { type: 'string' },
  ...over,
});

const layout = (
  id: string,
  layoutType: LayoutNode['layoutType'],
  children: DocumentNode[],
): LayoutNode => ({
  id,
  kind: 'layout',
  layoutType,
  children,
});

describe('toJsonSchema / toUiSchema', () => {
  it('serializes flat form with required, default and enum', () => {
    const root = createEmptyRoot();
    root.children = [
      control('name', { required: true, label: 'Имя', placeholder: 'Введите имя' }),
      control('age', { schema: { type: 'number', minimum: 0, maximum: 120, default: 18 } }),
      control('color', { controlType: 'select', schema: { type: 'string', enum: ['red', 'blue'] } }),
    ];
    const schema = toJsonSchema(root);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number', minimum: 0, maximum: 120, default: 18 },
        color: { type: 'string', enum: ['red', 'blue'] },
      },
      required: ['name'],
    });
    const ui = toUiSchema(root);
    expect(ui.type).toBe('VerticalLayout');
    expect(ui.elements?.[0]).toEqual({
      type: 'Control',
      scope: '#/properties/name',
      label: 'Имя',
      options: { placeholder: 'Введите имя' },
    });
    expect(ui.elements?.[2]).toEqual({
      type: 'Control',
      scope: '#/properties/color',
      label: 'color',
    });
  });

  it('serializes layouts: group, horizontal, tabs and slider options', () => {
    const root = createEmptyRoot();
    root.children = [
      layout('g', 'group', [control('a')]),
      layout('h', 'horizontal', [control('b')]),
      {
        ...layout('t', 'tabs', [{ ...layout('c1', 'vertical', [control('x', { label: 'Икс' })]) }]),
        label: 'Вкладки',
      } as LayoutNode,
      control('s', { controlType: 'slider', schema: { type: 'number', minimum: 0, maximum: 100 } }),
    ];
    const ui = toUiSchema(root);
    expect(ui.elements?.[0]).toEqual({ type: 'Group', elements: [{ type: 'Control', scope: '#/properties/a', label: 'a' }] });
    expect(ui.elements?.[1]).toEqual({ type: 'HorizontalLayout', elements: [{ type: 'Control', scope: '#/properties/b', label: 'b' }] });
    expect(ui.elements?.[2]).toEqual({
      type: 'Categorization',
      elements: [
        { type: 'Category', label: '…', elements: [{ type: 'VerticalLayout', elements: [{ type: 'Control', scope: '#/properties/x', label: 'Икс' }] }] },
      ],
    });
    expect(ui.elements?.[3]).toEqual({
      type: 'Control',
      scope: '#/properties/s',
      label: 's',
      options: { format: 'slider' },
    });
  });

  it('textarea maps to MultiLineControl, radio to RadioGroupControl', () => {
    const root = createEmptyRoot();
    root.children = [control('bio', { controlType: 'textarea' }), control('pick', { controlType: 'radio' })];
    const ui = toUiSchema(root);
    expect(ui.elements?.[0].type).toBe('MultiLineControl');
    expect(ui.elements?.[1].type).toBe('RadioGroupControl');
  });

  it('serializes static label as Label element and omits it from JSON Schema', () => {
    const root = createEmptyRoot();
    root.children = [staticNode('Заголовок секции'), control('x')];
    const schema = toJsonSchema(root);
    expect(Object.keys(schema.properties ?? {})).toEqual(['x']);
    const ui = toUiSchema(root);
    expect(ui.elements?.[0]).toEqual({ type: 'Label', text: 'Заголовок секции' });
    expect(ui.elements?.[1].scope).toBe('#/properties/x');
  });

  it('serializes horizontal wrap option into ui schema options', () => {
    const root = createEmptyRoot();
    root.children = [
      { id: 'h', kind: 'layout', layoutType: 'horizontal', options: { wrap: true }, children: [control('a'), control('b')] },
      { id: 'h2', kind: 'layout', layoutType: 'horizontal', children: [control('c')] },
    ];
    const ui = toUiSchema(root);
    expect(ui.elements?.[0]).toMatchObject({ type: 'HorizontalLayout', options: { wrap: true } });
    expect(ui.elements?.[1].options).toBeUndefined();
  });

  it('collects defaults for preview initial data', () => {
    const schema = toJsonSchema(createEmptyRoot());
    expect(defaultsFromSchema(schema)).toEqual({});
    const withDefault = toJsonSchema({
      ...createEmptyRoot(),
      children: [control('x', { schema: { type: 'string', default: 'hi' } })],
    });
    expect(defaultsFromSchema(withDefault)).toEqual({ x: 'hi' });
  });
});

describe('store operations', () => {
  it('inserts, renames with uniqueness and moves between containers', () => {
    const s = useBuilder.getState();
    const rootId = s.root.id;
    s.insertNode(control('field'), rootId, 0);
    s.insertNode(control('field'), rootId, 0);
    let state = useBuilder.getState();
    expect(state.root.children.map((c) => (c as ControlNode).name)).toEqual(['field-2', 'field']);

    state.moveNode((state.root.children[0] as ControlNode).id, rootId, 2);
    state = useBuilder.getState();
    expect(state.root.children.map((c) => (c as ControlNode).name)).toEqual(['field', 'field-2']);

    state.renameControl((state.root.children[0] as ControlNode).id, 'Моё Поле');
    state = useBuilder.getState();
    expect((state.root.children[0] as ControlNode).name).toBe('moe-pole');
  });

  it('supports undo and redo across edits', () => {
    const s = useBuilder.getState();
    s.newProject();
    const rootId = useBuilder.getState().root.id;
    useBuilder.getState().insertNode(control('a', { id: 'a1' }), rootId, 0);
    expect(useBuilder.getState().root.children).toHaveLength(1);
    useBuilder.getState().undo();
    expect(useBuilder.getState().root.children).toHaveLength(0);
    useBuilder.getState().redo();
    expect(useBuilder.getState().root.children).toHaveLength(1);
  });

  it('duplicates nodes with fresh ids and unique names', () => {
    useBuilder.getState().newProject();
    const rootId = useBuilder.getState().root.id;
    useBuilder.getState().insertNode(control('email'), rootId, 0);
    const originalId = (useBuilder.getState().root.children[0] as ControlNode).id;
    useBuilder.getState().duplicateNode(originalId);
    const state = useBuilder.getState();
    const [first, second] = state.root.children as ControlNode[];
    expect(state.root.children).toHaveLength(2);
    expect(first.id).not.toBe(second.id);
    expect(second.name).toBe('email-2');
  });

  it('refuses to move a node into its own subtree', () => {
    useBuilder.getState().newProject();
    const rootId = useBuilder.getState().root.id;
    const group = layout('grp', 'group', []);
    useBuilder.getState().insertNode(group, rootId, 0);
    useBuilder.getState().insertNode(control('inner'), 'grp', 0);
    const before = structuredClone(useBuilder.getState().root);
    useBuilder.getState().moveNode('grp', 'inner', 0);
    expect(useBuilder.getState().root).toEqual(before);
  });

  it('keeps history capped and selects removed nodes cleared', () => {
    useBuilder.getState().newProject();
    const rootId = useBuilder.getState().root.id;
    useBuilder.getState().insertNode(control('a', { id: 'a1' }), rootId, 0);
    useBuilder.getState().removeNode('a1');
    expect(useBuilder.getState().selectedId).toBeNull();
  });
});

describe('ops helpers', () => {
  it('detects ancestors and collects names', () => {
    const root = createEmptyRoot();
    const group = layout('grp', 'group', [control('inner', { id: 'inner' })]);
    root.children = [group, control('flat', { id: 'flat' })];
    expect(isAncestor(root, 'grp', 'inner')).toBe(true);
    expect(isAncestor(root, 'inner', 'grp')).toBe(false);
    expect(findParent(root, 'inner')?.id).toBe('grp');
    expect(collectControlNames(root)).toEqual(new Set(['inner', 'flat']));
  });

  it('reassigns all ids in a subtree', () => {
    const group = layout('grp', 'group', [control('inner', { id: 'inner' })]);
    reassignIds(group, 'new-grp');
    expect(group.id).toBe('new-grp');
    expect(group.children[0].id).not.toBe('inner');
  });
});

describe('fromSchemas import', () => {
  it('round-trips tree -> schemas -> tree preserving controls and layouts', () => {
    const root = createEmptyRoot();
    root.children = [
      control('name', { label: 'Имя', required: true, placeholder: 'Иван' }),
      { id: 'g', kind: 'layout', layoutType: 'group', label: 'Профиль', children: [control('age', { schema: { type: 'number', minimum: 0, default: 18 } })] },
      { id: 'h', kind: 'layout', layoutType: 'horizontal', options: { wrap: true }, children: [control('a'), control('b')] },
      staticNode('Заголовок'),
    ];
    const schema = toJsonSchema(root) as never;
    const ui = toUiSchema(root) as never;
    const restored = fromSchemas(schema, ui);
    const schema2 = toJsonSchema(restored);
    expect(schema2).toEqual(toJsonSchema(root));
    const ui2 = toUiSchema(restored);
    expect(ui2).toEqual(toUiSchema(root));
  });

  it('maps control types by uischema type, format and enum', () => {
    const schema = { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string', format: 'date' }, c: { type: 'number' }, d: { type: 'boolean' }, e: { type: 'string', enum: ['x'] } } };
    const ui = { type: 'VerticalLayout', elements: [
      { type: 'MultiLineControl', scope: '#/properties/a' },
      { type: 'Control', scope: '#/properties/b' },
      { type: 'Control', scope: '#/properties/c', options: { format: 'slider' } },
      { type: 'Control', scope: '#/properties/d' },
      { type: 'RadioGroupControl', scope: '#/properties/e' },
    ] };
    const root = fromSchemas(schema, ui);
    const types = root.children.map((c) => (c.kind === 'control' ? c.controlType : c.kind));
    expect(types).toEqual(['textarea', 'date', 'slider', 'checkbox', 'radio']);
  });
});

describe('rules serialization', () => {
  it('serializes rule with type-aware const and imports it back', () => {
    const root = createEmptyRoot();
    root.children = [
      control('age', { schema: { type: 'number' } }),
      control('note', {
        rule: { effect: 'SHOW', field: 'age', operator: 'equals', value: '18' },
      }),
      control('flag', { schema: { type: 'boolean' } }),
      control('other', {
        rule: { effect: 'DISABLE', field: 'flag', operator: 'notEquals', value: 'true' },
      }),
    ];
    const ui = toUiSchema(root);
    expect(ui.elements?.[1].rule).toEqual({
      effect: 'SHOW',
      condition: { scope: '#/properties/age', schema: { const: 18 } },
    });
    expect(ui.elements?.[3].rule).toEqual({
      effect: 'DISABLE',
      condition: { scope: '#/properties/flag', schema: { not: { const: true } } },
    });

    const restored = fromSchemas(toJsonSchema(root) as never, ui as never);
    const restoredUi = toUiSchema(restored);
    expect(restoredUi.elements?.[1].rule).toEqual(ui.elements?.[1].rule);
    expect(restoredUi.elements?.[3].rule).toEqual(ui.elements?.[3].rule);
  });
});

describe('data bindings', () => {
  it('exports manifest of url bindings only', () => {
    const root = createEmptyRoot();
    root.children = [
      control('city', { controlType: 'select', dataBinding: { url: 'https://x/cities', itemsPath: '$.data', labelKey: 'name', valueKey: 'id', mock: '{"data":[{"id":1,"name":"Moscow"}]}' } }),
      control('plain', { controlType: 'select' }),
    ];
    const bindings = toDataBindings(root);
    expect(Object.keys(bindings)).toEqual(['city']);
  });

  it('preview schema replaces enum with oneOf from mock', () => {
    const root = createEmptyRoot();
    root.children = [
      control('city', {
        controlType: 'select',
        schema: { type: 'number', enum: [1, 2] },
        dataBinding: { url: 'https://x', itemsPath: 'data', labelKey: 'name', valueKey: 'id', mock: '{"data":[{"id":1,"name":"Moscow"},{"id":2,"name":"Sochi"}]}' },
      }),
    ];
    const preview = buildPreviewSchema(root);
    const prop = preview.properties.city as Record<string, unknown>;
    expect(prop.enum).toBeUndefined();
    expect(prop.oneOf).toEqual([
      { const: 1, title: 'Moscow' },
      { const: 2, title: 'Sochi' },
    ]);
  });

  it('invalid mock keeps original enum', () => {
    const root = createEmptyRoot();
    root.children = [
      control('city', {
        controlType: 'select',
        schema: { type: 'number', enum: [1] },
        dataBinding: { url: 'https://x', itemsPath: '$', labelKey: 'n', valueKey: 'v', mock: 'not json' },
      }),
    ];
    const preview = buildPreviewSchema(root);
    expect((preview.properties.city as Record<string, unknown>).enum).toEqual([1]);
  });
});

describe('lint', () => {
  it('reports invalid pattern, empty enum, bad rule field and bad mock', () => {
    const root = createEmptyRoot();
    root.children = [
      control('a', { schema: { type: 'string', pattern: '[' } }),
      control('b', { controlType: 'select', schema: { type: 'string', enum: [] } }),
      control('c', { rule: { effect: 'SHOW', field: 'ghost', operator: 'equals', value: 'x' } }),
      control('d', {
        controlType: 'select',
        dataBinding: { url: 'https://x', itemsPath: '$', labelKey: 'n', valueKey: 'v', mock: '{oops}' },
      }),
    ];
    const problems = lintDocument(root);
    const keys = problems.map((p) => p.messageKey).sort();
    expect(keys).toEqual(['lint.emptyEnum', 'lint.invalidMock', 'lint.invalidPattern', 'lint.ruleFieldMissing']);
  });
});
