import { produce } from 'immer';
import { deepClone } from '@/shared/lib/clone';
import { newId } from '@/shared/lib/id';
import { slugify, uniqueName } from '@/shared/lib/slug';
import { create } from 'zustand';
import {
  collectControlNames,
  collectIds,
  findNode,
  findParent,
  isAncestor,
  reassignIds,
} from './ops';
import type {
  ControlNode,
  DocumentNode,
  DropTarget,
  LayoutNode,
  SchemaFragment,
  StaticNode,
  ThemeSettings,
} from './types';
import { DEFAULT_THEME } from './types';

const HISTORY_LIMIT = 50;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const createEmptyRoot = (): LayoutNode => ({
  id: newId(),
  kind: 'layout',
  layoutType: 'vertical',
  children: [],
});

export interface ProjectMeta {
  id: string | null;
  name: string;
}

export type BuilderMode = 'edit' | 'preview';

interface BuilderState {
  root: LayoutNode;
  selectedId: string | null;
  past: LayoutNode[];
  future: LayoutNode[];
  mode: BuilderMode;
  codePanelOpen: boolean;
  dropTarget: DropTarget | null;
  projectMeta: ProjectMeta;
  theme: ThemeSettings;
  select: (id: string | null) => void;
  setMode: (mode: BuilderMode) => void;
  toggleCodePanel: () => void;
  setDropTarget: (target: DropTarget | null) => void;
  setProjectMeta: (meta: ProjectMeta) => void;
  setTheme: (theme: ThemeSettings) => void;
  applyDocument: (next: LayoutNode) => void;
  insertNode: (node: DocumentNode, containerId: string, index: number) => void;
  moveNode: (id: string, containerId: string, index: number) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  updateControl: (id: string, patch: Partial<ControlNode>) => void;
  updateSchema: (id: string, patch: Partial<SchemaFragment>) => void;
  updateLayout: (id: string, patch: Partial<LayoutNode>) => void;
  updateStatic: (id: string, patch: Partial<StaticNode>) => void;
  renameControl: (id: string, rawName: string) => void;
  newProject: () => void;
  loadProject: (root: LayoutNode, name: string, id: string | null, theme?: ThemeSettings) => void;
  undo: () => void;
  redo: () => void;
}

export const useBuilder = create<BuilderState>()((set, get) => {
  const commit = (recipe: (draft: LayoutNode) => void) =>
    set((state) => ({
      root: produce(state.root, recipe),
      past: [...state.past, structuredClone(state.root)].slice(-HISTORY_LIMIT),
      future: [],
    }));

  return {
    root: createEmptyRoot(),
    selectedId: null,
    past: [],
    future: [],
    mode: 'edit',
    codePanelOpen: false,
    dropTarget: null,
    projectMeta: { id: null, name: '' },
    theme: DEFAULT_THEME,

    select: (id) => set({ selectedId: id }),
    setMode: (mode) => set({ mode }),
    toggleCodePanel: () => set((s) => ({ codePanelOpen: !s.codePanelOpen })),
    setDropTarget: (target) => set({ dropTarget: target }),
    setProjectMeta: (meta) => set({ projectMeta: meta }),
    setTheme: (theme) => set({ theme }),

    insertNode: (node, containerId, index) => {
      commit((draft) => {
        const target = findNode(draft, containerId);
        if (!target || target.kind !== 'layout') return;
        if (target.layoutType === 'tabs' && node.kind !== 'layout') return;
        if (node.kind === 'control') {
          node.name = uniqueName(node.name || 'field', collectControlNames(draft));
        }
        target.children.splice(clamp(index, 0, target.children.length), 0, deepClone(node));
      });
      set({ selectedId: node.id });
    },

    moveNode: (id, containerId, index) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (!node) return;
        if (id === containerId || isAncestor(draft, id, containerId)) return;
        const parent = findParent(draft, id);
        if (!parent) return;
        const oldIndex = parent.children.findIndex((child) => child.id === id);
        parent.children.splice(oldIndex, 1);
        const target = findNode(draft, containerId);
        if (!target || target.kind !== 'layout') return;
        if (target.layoutType === 'tabs' && node.kind !== 'layout') return;
        let targetIndex = index;
        if (parent.id === containerId && oldIndex < index) targetIndex = index - 1;
        target.children.splice(clamp(targetIndex, 0, target.children.length), 0, node);
      });
    },

    removeNode: (id) => {
      const removed = findNode(get().root, id);
      const removedIds = removed ? collectIds(removed) : [];
      commit((draft) => {
        const parent = findParent(draft, id);
        if (!parent) return;
        parent.children = parent.children.filter((child) => child.id !== id);
      });
      set((state) => ({
        selectedId:
          state.selectedId && removedIds.includes(state.selectedId) ? null : state.selectedId,
      }));
    },

    duplicateNode: (id) => {
      const cloneId = newId();
      commit((draft) => {
        const parent = findParent(draft, id);
        const node = findNode(draft, id);
        if (!parent || !node) return;
        const oldIndex = parent.children.findIndex((child) => child.id === id);
        const clone = deepClone(node);
        reassignIds(clone, cloneId);
        if (clone.kind === 'control') {
          clone.name = uniqueName(clone.name, collectControlNames(draft));
        }
        parent.children.splice(oldIndex + 1, 0, clone);
      });
      set({ selectedId: cloneId });
    },

    updateControl: (id, patch) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (node && node.kind === 'control') Object.assign(node, patch);
      });
    },

    updateSchema: (id, patch) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (node && node.kind === 'control') Object.assign(node.schema, patch);
      });
    },

    updateLayout: (id, patch) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (node && node.kind === 'layout') Object.assign(node, patch);
      });
    },

    updateStatic: (id, patch) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (node && node.kind === 'static') Object.assign(node, patch);
      });
    },

    renameControl: (id, rawName) => {
      commit((draft) => {
        const node = findNode(draft, id);
        if (!node || node.kind !== 'control') return;
        const taken = collectControlNames(draft, id);
        node.name = uniqueName(slugify(rawName), taken);
      });
    },

    newProject: () => {
      commit((draft) => {
        draft.children = [];
      });
      set({
        selectedId: null,
        mode: 'edit',
        projectMeta: { id: null, name: '' },
        theme: DEFAULT_THEME,
      });
    },

    loadProject: (root, name, id, theme) => {
      set({
        root: structuredClone(root),
        selectedId: null,
        past: [],
        future: [],
        mode: 'edit',
        projectMeta: { id, name },
        theme: theme ?? DEFAULT_THEME,
      });
    },

    applyDocument: (next) => {
      commit((draft) => {
        draft.children = structuredClone(next.children);
      });
    },

    undo: () =>
      set((state) => {
        if (state.past.length === 0) return {};
        const past = [...state.past];
        const root = past.pop() as LayoutNode;
        return { root, past, future: [...state.future, state.root] };
      }),

    redo: () =>
      set((state) => {
        if (state.future.length === 0) return {};
        const future = [...state.future];
        const root = future.pop() as LayoutNode;
        return { root, future, past: [...state.past, state.root] };
      }),
  };
});
