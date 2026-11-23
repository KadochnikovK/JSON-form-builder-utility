import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { findNode, isAncestor, layoutDepthMap } from '@/features/document-model/ops';
import { useBuilder } from '@/features/document-model/store';
import type { DocumentNode, LayoutNode } from '@/features/document-model/types';
import { createNodeForItem, getItemDef, type PaletteItemDef } from '@/features/palette/registry';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { nodeIcon, nodeLabel } from './nodeViewUtils';

type ActiveDrag =
  | { kind: 'palette'; def: PaletteItemDef }
  | { kind: 'node'; nodeId: string; label: string; icon: ReturnType<typeof nodeIcon> };

export function DndProvider({ children }: { children: ReactNode }) {
  const { t } = useT();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [active, setActive] = useState<ActiveDrag | null>(null);
  const activeRef = useRef<ActiveDrag | null>(null);
  const pointRef = useRef({ x: 0, y: 0 });

  const trackPointer = useCallback((e: PointerEvent) => {
    pointRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const clearDrag = useCallback(() => {
    activeRef.current = null;
    setActive(null);
    useBuilder.getState().setDropTarget(null);
    document.removeEventListener('pointermove', trackPointer);
  }, [trackPointer]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as
        | { type?: string; itemKey?: string; nodeId?: string }
        | undefined;
      const { root } = useBuilder.getState();
      let info: ActiveDrag | null = null;
      if (data?.type === 'palette' && data.itemKey) {
        const def = getItemDef(data.itemKey);
        if (def) info = { kind: 'palette', def };
      } else if (data?.type === 'node' && data.nodeId) {
        const node = findNode(root, data.nodeId);
        if (node) {
          info = { kind: 'node', nodeId: node.id, label: nodeLabel(node, t), icon: nodeIcon(node) };
        }
      }
      activeRef.current = info;
      setActive(info);
      const activator = event.activatorEvent as PointerEvent | undefined;
      if (activator && typeof activator.clientX === 'number') {
        pointRef.current = { x: activator.clientX, y: activator.clientY };
      }
      document.addEventListener('pointermove', trackPointer);
    },
    [t, trackPointer],
  );

  const updateDropTarget = useCallback(
    (event: DragOverEvent | DragMoveEvent) => {
      const info = activeRef.current;
      const store = useBuilder.getState();
      if (!info) return;
      const overId = event.over?.id;
      if (!overId) {
        if (store.dropTarget) store.setDropTarget(null);
        return;
      }
      const containerId = String(overId);
      const container = findNode(store.root, containerId);
      if (!container || container.kind !== 'layout') {
        if (store.dropTarget) store.setDropTarget(null);
        return;
      }
      if (
        info.kind === 'node' &&
        (info.nodeId === containerId || isAncestor(store.root, info.nodeId, containerId))
      ) {
        if (store.dropTarget) store.setDropTarget(null);
        return;
      }
      if (container.layoutType === 'tabs') {
        const isLayout =
          info.kind === 'palette'
            ? info.def.category === 'layout'
            : findNode(store.root, info.nodeId)?.kind === 'layout';
        if (!isLayout) {
          if (store.dropTarget) store.setDropTarget(null);
          return;
        }
      }
      const index = computeDropIndex(container, containerId, pointRef.current);
      store.setDropTarget({ containerId, index });
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    const info = activeRef.current;
    const store = useBuilder.getState();
    const target = store.dropTarget;
    if (info && target) {
      if (info.kind === 'palette') {
        const taken = new Set<string>();
        const node = createNodeForItem(info.def, t, taken);
        store.insertNode(node, target.containerId, target.index);
      } else {
        store.moveNode(info.nodeId, target.containerId, target.index);
      }
    }
    clearDrag();
  }, [clearDrag, t]);

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const { pointerCoordinates, droppableContainers, droppableRects } = args;
    if (!pointerCoordinates) return [];
    const { root } = useBuilder.getState();
    const depths = layoutDepthMap(root);
    let best: { id: string | number; depth: number } | null = null;
    droppableContainers.forEach((container) => {
      const data = container.data.current as { type?: string } | undefined;
      if (data?.type !== 'container') return;
      const rect = droppableRects.get(container.id);
      if (!rect) return;
      const p = pointerCoordinates;
      if (
        p.x < rect.left - 8 ||
        p.x > rect.right + 8 ||
        p.y < rect.top - 8 ||
        p.y > rect.bottom + 8
      ) {
        return;
      }
      const depth = depths.get(String(container.id)) ?? 0;
      if (!best || depth > best.depth) best = { id: container.id, depth };
    });
    const found = best as { id: string | number; depth: number } | null;
    return found ? [{ id: found.id, value: 0 }] : [];
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={updateDropTarget}
      onDragMove={updateDropTarget}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
            <Icon name={active.kind === 'palette' ? active.def.icon : active.icon} className="h-3.5 w-3.5" />
            <span className="max-w-48 truncate">
              {active.kind === 'palette' ? t(active.def.labelKey) : active.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function computeDropIndex(
  container: LayoutNode,
  containerId: string,
  point: { x: number; y: number },
): number {
  const element = document.querySelector(`[data-container-id="${CSS.escape(containerId)}"]`);
  if (!element) return container.children.length;
  const rects = Array.from(
    element.querySelectorAll(':scope > [data-node-id]'),
  ).map((child) => (child as HTMLElement).getBoundingClientRect());
  if (rects.length === 0) return container.children.length;
  const horizontal = container.layoutType === 'horizontal';
  let index = 0;
  rects.forEach((rect) => {
    const center = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
    const pointer = horizontal ? point.x : point.y;
    if (pointer > center) index += 1;
  });
  return index;
}
