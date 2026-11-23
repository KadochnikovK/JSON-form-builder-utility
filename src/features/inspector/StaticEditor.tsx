import { useBuilder } from '@/features/document-model/store';
import type { StaticNode } from '@/features/document-model/types';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { SectionTitle, TextField } from './fields';

export function StaticEditor({ node }: { node: StaticNode }) {
  const { t } = useT();
  const updateStatic = useBuilder((s) => s.updateStatic);
  const duplicateNode = useBuilder((s) => s.duplicateNode);
  const removeNode = useBuilder((s) => s.removeNode);

  return (
    <div>
      <SectionTitle>{t('inspector.basic')}</SectionTitle>
      <TextField
        label={t('inspector.text')}
        value={node.text}
        onChange={(text) => updateStatic(node.id, { text })}
      />
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
