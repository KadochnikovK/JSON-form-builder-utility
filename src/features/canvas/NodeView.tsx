import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useBuilder } from '@/features/document-model/store';
import type { ControlNode, DocumentNode, LayoutNode } from '@/features/document-model/types';
import { useT } from '@/shared/i18n';
import { cx } from '@/shared/lib/cx';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { ControlPreview } from './ControlPreview';

export function NodeView({ node }: { node: DocumentNode }) {
  const { t } = useT();
  const selected = useBuilder((s) => s.selectedId === node.id);
  const select = useBuilder((s) => s.select);
  const removeNode = useBuilder((s) => s.removeNode);
  const duplicateNode = useBuilder((s) => s.duplicateNode);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { type: 'node', nodeId: node.id },
  });

  return (
    <div
      ref={setNodeRef}
      data-node-id={node.id}
      {...listeners}
      {...attributes}
      onPointerDown={(e: ReactPointerEvent) => {
        e.stopPropagation();
        listeners?.onPointerDown?.(e as never);
      }}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        select(node.id);
      }}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cx(
        'group relative min-w-44 cursor-grab rounded-md border bg-white p-2 shadow-sm active:cursor-grabbing',
        selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent hover:border-zinc-300',
        isDragging && 'opacity-40',
      )}
    >
      {node.kind === 'control' ? (
        <ControlPreview node={node} />
      ) : node.kind === 'static' ? (
        <div className="pointer-events-none text-base font-semibold text-zinc-800">
          {node.text || t('palette.item.label')}
        </div>
      ) : (
        <LayoutView node={node} />
      )}
      <div className={cx('absolute right-2 top-2 z-10 hidden gap-1 group-hover:flex', selected && '!flex')}>
        <QuickButton
          icon="copy"
          title={t('inspector.duplicate')}
          onClick={(e) => {
            e.stopPropagation();
            duplicateNode(node.id);
          }}
        />
        <QuickButton
          icon="trash"
          title={t('inspector.delete')}
          onClick={(e) => {
            e.stopPropagation();
            removeNode(node.id);
          }}
        />
      </div>
    </div>
  );
}

export function LayoutView({ node, isRoot = false }: { node: LayoutNode; isRoot?: boolean }) {
  const { t } = useT();
  if (node.layoutType === 'tabs') return <TabsView node={node} />;
  if (node.layoutType === 'group') {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
        <div className="mb-2 text-xs font-medium text-zinc-500">
          {node.label || t('canvas.groupUntitled')}
        </div>
        <ChildrenHost container={node} horizontal={false} />
      </div>
    );
  }
  return <ChildrenHost container={node} horizontal={node.layoutType === 'horizontal'} isRoot={isRoot} />;
}

export function ChildrenHost({
  container,
  horizontal,
  isRoot = false,
}: {
  container: LayoutNode;
  horizontal: boolean;
  isRoot?: boolean;
}) {
  const { t } = useT();
  const { setNodeRef, isOver } = useDroppable({ id: container.id, data: { type: 'container' } });
  const dropTarget = useBuilder((s) => s.dropTarget);
  const isTarget = dropTarget?.containerId === container.id;
  const insertIndex = isTarget ? Math.min(dropTarget.index, container.children.length) : -1;

  const parts: ReactNode[] = [];
  container.children.forEach((child, i) => {
    if (isTarget && i === insertIndex) {
      parts.push(<InsertionIndicator key={`ind-${i}`} horizontal={horizontal} />);
    }
    parts.push(<NodeView key={child.id} node={child} />);
  });
  if (isTarget && insertIndex >= container.children.length) {
    parts.push(<InsertionIndicator key="ind-end" horizontal={horizontal} />);
  }

  const minH = isRoot ? 'min-h-64' : 'min-h-14';

  return (
    <div
      ref={setNodeRef}
      data-container-id={container.id}
      className={cx(
        'flex gap-2 rounded-md',
        horizontal ? 'flex-row' : 'flex-col',
        horizontal && container.options?.wrap && 'flex-wrap',
        minH,
        isOver && 'bg-blue-50/40',
      )}
    >
      {parts.length > 0 ? (
        parts
      ) : (
        <div
          className={cx(
            'flex w-full items-center justify-center rounded-md border border-dashed border-zinc-300 text-xs text-zinc-400',
            minH,
          )}
        >
          {t('canvas.empty')}
        </div>
      )}
    </div>
  );
}

function TabsView({ node }: { node: LayoutNode }) {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const { setNodeRef } = useDroppable({ id: node.id, data: { type: 'container' } });
  const categories = node.children.filter(
    (child): child is LayoutNode => child.kind === 'layout',
  );
  const activeIndex = Math.min(active, Math.max(categories.length - 1, 0));
  const activeCategory = categories[activeIndex];

  return (
    <div ref={setNodeRef} data-container-id={node.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 px-2 pt-2">
        {categories.map((category, i) => (
          <button
            key={category.id}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setActive(i);
            }}
            className={cx(
              'rounded-t-md px-3 py-1.5 text-xs',
              i === activeIndex
                ? 'border border-b-0 border-zinc-200 bg-white font-medium text-zinc-800'
                : 'text-zinc-500 hover:bg-white/60',
            )}
          >
            {category.label || `${t('canvas.tab')} ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="p-3">
        {activeCategory ? <ChildrenHost container={activeCategory} horizontal={false} /> : null}
      </div>
    </div>
  );
}

function QuickButton({
  icon,
  title,
  onClick,
}: {
  icon: IconName;
  title: string;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-100"
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
    </button>
  );
}

function InsertionIndicator({ horizontal }: { horizontal: boolean }) {
  return horizontal ? (
    <div className="w-1 shrink-0 self-stretch rounded bg-blue-500/80" />
  ) : (
    <div className="h-1 w-full shrink-0 rounded bg-blue-500/80" />
  );
}
