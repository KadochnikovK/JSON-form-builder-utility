import type { DocumentNode } from '@/features/document-model/types';
import type { Translate } from '@/shared/i18n';
import type { IconName } from '@/shared/ui/Icon';

const CONTROL_ICONS: Record<string, IconName> = {
  text: 'text',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  slider: 'slider',
  checkbox: 'checkbox',
  select: 'select',
  radio: 'radio',
};

const LAYOUT_ICONS: Record<string, IconName> = {
  vertical: 'vertical',
  horizontal: 'horizontal',
  group: 'group',
  tabs: 'tabs',
};

const STATIC_ICONS: Record<string, IconName> = {
  label: 'heading',
};

export function nodeIcon(node: DocumentNode): IconName {
  if (node.kind === 'control') return CONTROL_ICONS[node.controlType] ?? 'text';
  if (node.kind === 'layout') return LAYOUT_ICONS[node.layoutType] ?? 'vertical';
  return STATIC_ICONS[node.staticType] ?? 'text';
}

export function nodeLabel(node: DocumentNode, t: Translate): string {
  if (node.kind === 'control') return node.label || node.name;
  if (node.kind === 'layout') return node.label || t(`palette.layout.${node.layoutType}`);
  return node.text || t('palette.item.label');
}
