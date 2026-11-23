import type {
  ControlNode,
  ControlType,
  DocumentNode,
  LayoutNode,
  LayoutType,
  StaticNode,
  StaticType,
} from '@/features/document-model/types';
import { newId } from '@/shared/lib/id';
import { slugify, uniqueName } from '@/shared/lib/slug';
import type { IconName } from '@/shared/ui/Icon';
import type { Translate } from '@/shared/i18n';

export type PaletteCategory = 'input' | 'choice' | 'layout';

export interface PaletteItemDef {
  key: string;
  category: PaletteCategory;
  labelKey: string;
  icon: IconName;
  build: (t: Translate) => DocumentNode;
}

function makeControl(controlType: ControlType, t: Translate, labelKey: string): ControlNode {
  const label = t(labelKey);
  const base: ControlNode = {
    id: newId(),
    kind: 'control',
    controlType,
    name: slugify(label),
    label,
    required: false,
    schema: { type: 'string' },
  };
  switch (controlType) {
    case 'number':
      base.schema = { type: 'number' };
      break;
    case 'checkbox':
      base.schema = { type: 'boolean' };
      break;
    case 'select':
    case 'radio':
      base.schema = {
        type: 'string',
        enum: [t('default.option1'), t('default.option2'), t('default.option3')],
      };
      break;
    case 'slider':
      base.schema = { type: 'number', minimum: 0, maximum: 100 };
      break;
    case 'date':
      base.schema = { type: 'string', format: 'date' };
      break;
    case 'time':
      base.schema = { type: 'string', format: 'time' };
      break;
    case 'datetime':
      base.schema = { type: 'string', format: 'date-time' };
      break;
    default:
      break;
  }
  return base;
}

function makeStatic(staticType: StaticType, t: Translate, labelKey: string): StaticNode {
  return { id: newId(), kind: 'static', staticType, text: t(labelKey) };
}

function makeLayout(layoutType: LayoutType): LayoutNode {
  return { id: newId(), kind: 'layout', layoutType, children: [] };
}

export const PALETTE_ITEMS: PaletteItemDef[] = [
  { key: 'text', category: 'input', labelKey: 'palette.item.text', icon: 'text', build: (t) => makeControl('text', t, 'palette.item.text') },
  { key: 'textarea', category: 'input', labelKey: 'palette.item.textarea', icon: 'textarea', build: (t) => makeControl('textarea', t, 'palette.item.textarea') },
  { key: 'number', category: 'input', labelKey: 'palette.item.number', icon: 'number', build: (t) => makeControl('number', t, 'palette.item.number') },
  { key: 'date', category: 'input', labelKey: 'palette.item.date', icon: 'date', build: (t) => makeControl('date', t, 'palette.item.date') },
  { key: 'time', category: 'input', labelKey: 'palette.item.time', icon: 'time', build: (t) => makeControl('time', t, 'palette.item.time') },
  { key: 'datetime', category: 'input', labelKey: 'palette.item.datetime', icon: 'datetime', build: (t) => makeControl('datetime', t, 'palette.item.datetime') },
  { key: 'slider', category: 'input', labelKey: 'palette.item.slider', icon: 'slider', build: (t) => makeControl('slider', t, 'palette.item.slider') },
  { key: 'checkbox', category: 'choice', labelKey: 'palette.item.checkbox', icon: 'checkbox', build: (t) => makeControl('checkbox', t, 'palette.item.checkbox') },
  { key: 'select', category: 'choice', labelKey: 'palette.item.select', icon: 'select', build: (t) => makeControl('select', t, 'palette.item.select') },
  { key: 'radio', category: 'choice', labelKey: 'palette.item.radio', icon: 'radio', build: (t) => makeControl('radio', t, 'palette.item.radio') },
  { key: 'label', category: 'layout', labelKey: 'palette.item.label', icon: 'heading', build: (t) => makeStatic('label', t, 'palette.item.label') },
  { key: 'vertical', category: 'layout', labelKey: 'palette.layout.vertical', icon: 'vertical', build: () => makeLayout('vertical') },
  { key: 'horizontal', category: 'layout', labelKey: 'palette.layout.horizontal', icon: 'horizontal', build: () => makeLayout('horizontal') },
  { key: 'group', category: 'layout', labelKey: 'palette.layout.group', icon: 'group', build: () => makeLayout('group') },
  { key: 'tabs', category: 'layout', labelKey: 'palette.layout.tabs', icon: 'tabs', build: () => makeLayout('tabs') },
];

export function getItemDef(key: string): PaletteItemDef | undefined {
  return PALETTE_ITEMS.find((item) => item.key === key);
}

export function createNodeForItem(
  def: PaletteItemDef,
  t: Translate,
  takenNames: Set<string>,
): DocumentNode {
  const node = def.build(t);
  if (node.kind === 'control') {
    node.name = uniqueName(node.name || 'field', takenNames);
  }
  return node;
}
