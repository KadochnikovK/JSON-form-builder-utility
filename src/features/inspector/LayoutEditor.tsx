import { useT } from '@/shared/i18n';
import { useBuilder } from '@/features/document-model/store';
import type { LayoutNode } from '@/features/document-model/types';
import { newId } from '@/shared/lib/id';
import { Icon } from '@/shared/ui/Icon';
import { SectionTitle, TextField, ToggleRow } from './fields';

export function LayoutEditor({ node }: { node: LayoutNode }) {
  const { t } = useT();
  const updateLayout = useBuilder((s) => s.updateLayout);
  const duplicateNode = useBuilder((s) => s.duplicateNode);
  const removeNode = useBuilder((s) => s.removeNode);

  const categories = node.children.filter(
    (child): child is LayoutNode => child.kind === 'layout',
  );

  return (
    <div>
      <SectionTitle>{t('inspector.basic')}</SectionTitle>
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium text-zinc-500">{t('inspector.layoutType')}</label>
        <div className="rounded-md bg-zinc-100 px-2 py-1.5 text-xs text-zinc-600">
          {t(`inspector.layout.${node.layoutType}`)}
        </div>
      </div>
      {(node.layoutType === 'group') && (
        <TextField
          label={t('inspector.sectionLabel')}
          value={node.label ?? ''}
          onChange={(label) => updateLayout(node.id, { label: label || undefined })}
          hint={t('inspector.sectionLabelHint')}
        />
      )}
      {node.layoutType === 'horizontal' && (
        <ToggleRow
          label={t('inspector.wrap')}
          checked={node.options?.wrap === true}
          onChange={(wrap) => updateLayout(node.id, { options: { ...node.options, wrap } })}
        />
      )}
      {node.layoutType === 'tabs' && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] font-medium text-zinc-500">{t('inspector.tabsCategories')}</div>
          <div className="flex flex-col gap-1">
            {categories.map((category, i) => (
              <div key={category.id} className="flex items-center gap-1">
                <input
                  value={category.label ?? ''}
                  onChange={(e) => {
                    const nextChildren = node.children.map((child) =>
                      child.id === category.id && child.kind === 'layout'
                        ? { ...child, label: e.target.value || undefined }
                        : child,
                    );
                    updateLayout(node.id, { children: nextChildren });
                  }}
                  placeholder={`${t('canvas.tab')} ${i + 1}`}
                  className="w-full rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => {
                    updateLayout(node.id, { children: node.children.filter((child) => child.id !== category.id) });
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  title={t('inspector.delete')}
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              updateLayout(node.id, {
                children: [...node.children, { id: newId(), kind: 'layout', layoutType: 'vertical', children: [] }],
              });
            }}
            className="mt-1.5 flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-50"
          >
            <Icon name="plus" className="h-3 w-3" />
            {t('inspector.addCategory')}
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => duplicateNode(node.id)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
          {t('inspector.duplicate')}
        </button>
        <button
          onClick={() => removeNode(node.id)}
          className="flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          {t('inspector.delete')}
        </button>
      </div>
    </div>
  );
}
