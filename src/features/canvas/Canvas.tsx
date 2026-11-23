import type { MouseEvent } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { CodeView } from '@/features/codeeditor/CodeView';
import { Preview } from '@/features/preview/Preview';
import { VSplit } from '@/shared/ui/Split';
import { LayoutView } from './NodeView';

export function Canvas() {
  const mode = useBuilder((s) => s.mode);
  const codePanelOpen = useBuilder((s) => s.codePanelOpen);
  const toggleCodePanel = useBuilder((s) => s.toggleCodePanel);
  const root = useBuilder((s) => s.root);
  const select = useBuilder((s) => s.select);

  const content =
    mode === 'preview' ? <Preview /> : <EditCanvas root={root} select={select} />;

  if (codePanelOpen) {
    return (
      <VSplit
        initial={0.6}
        first={content}
        second={<CodeView onClose={toggleCodePanel} />}
      />
    );
  }
  return content;
}

function EditCanvas({
  root,
  select,
}: {
  root: ReturnType<typeof useBuilder.getState>['root'];
  select: (id: string | null) => void;
}) {
  const deselect = (e: MouseEvent) => {
    if (e.target === e.currentTarget) select(null);
  };

  return (
    <div className="h-full overflow-auto p-6" onClick={deselect}>
      <div className="mx-auto max-w-3xl" onClick={deselect}>
        <LayoutView node={root} isRoot />
      </div>
    </div>
  );
}
