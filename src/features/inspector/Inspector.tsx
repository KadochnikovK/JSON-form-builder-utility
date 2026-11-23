import { findNode } from '@/features/document-model/ops';
import { useBuilder } from '@/features/document-model/store';
import { useT } from '@/shared/i18n';
import { ProblemsPanel } from '@/features/validation/ProblemsPanel';
import { ControlEditor } from './ControlEditor';
import { LayoutEditor } from './LayoutEditor';
import { StaticEditor } from './StaticEditor';

export function Inspector() {
  const { t } = useT();
  const root = useBuilder((s) => s.root);
  const selectedId = useBuilder((s) => s.selectedId);
  const selected = selectedId ? findNode(root, selectedId) : null;

  return (
    <div className="p-3">
      <div className="mb-3 border-b border-zinc-200 pb-2 text-sm font-semibold text-zinc-700">
        {t('app.title')}
      </div>
      {!selected ? (
        <div className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-400">
          {t('inspector.empty')}
        </div>
      ) : selected.kind === 'control' ? (
        <ControlEditor node={selected} />
      ) : selected.kind === 'static' ? (
        <StaticEditor node={selected} />
      ) : (
        <LayoutEditor node={selected} />
      )}
      <ProblemsPanel />
    </div>
  );
}
