import { useDraggable } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { createNodeForItem, PALETTE_ITEMS, type PaletteCategory, type PaletteItemDef } from './registry';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';

const CATEGORY_ORDER: PaletteCategory[] = ['input', 'choice', 'layout'];
const CATEGORY_LABEL_KEYS: Record<PaletteCategory, string> = {
  input: 'palette.category.input',
  choice: 'palette.category.choice',
  layout: 'palette.category.layout',
};

export function Palette() {
  const { t } = useT();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PALETTE_ITEMS.filter(
      (item) => q === '' || t(item.labelKey).toLowerCase().includes(q),
    );
  }, [query, t]);

  const grouped = useMemo(() => {
    const map = new Map<PaletteCategory, PaletteItemDef[]>();
    CATEGORY_ORDER.forEach((category) => map.set(category, []));
    filtered.forEach((item) => map.get(item.category)?.push(item));
    return map;
  }, [filtered]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-3">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.search')}
            className="w-full rounded-md border border-zinc-300 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-blue-400"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t(CATEGORY_LABEL_KEYS[category])}
              </div>
              <div className="flex flex-col gap-1">
                {items.map((item) => (
                  <PaletteItem key={item.key} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaletteItem({ item }: { item: PaletteItemDef }) {
  const { t } = useT();
  const insertNode = useBuilder((s) => s.insertNode);
  const root = useBuilder((s) => s.root);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.key}`,
    data: { type: 'palette', itemKey: item.key },
  });

  const addToEnd = () => {
    const taken = new Set<string>();
    const node = createNodeForItem(item, t, taken);
    insertNode(node, root.id, root.children.length);
  };

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={addToEnd}
      style={{ opacity: isDragging ? 0.5 : undefined }}
      className="flex cursor-grab items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-left text-xs text-zinc-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing"
    >
      <Icon name={item.icon} className="h-4 w-4 shrink-0 text-zinc-400" />
      <span className="truncate">{t(item.labelKey)}</span>
    </button>
  );
}
