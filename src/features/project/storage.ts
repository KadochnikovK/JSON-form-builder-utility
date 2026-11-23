import { newId } from '@/shared/lib/id';
import type { LayoutNode, ThemeSettings } from '@/features/document-model/types';

export interface ProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
}

export interface ProjectFile {
  schemaVersion: 1;
  id: string;
  name: string;
  updatedAt: number;
  root: LayoutNode;
  theme?: ThemeSettings;
}

export interface StorageAdapter {
  list(): ProjectMeta[];
  load(id: string): ProjectFile | null;
  save(file: ProjectFile): void;
  delete(id: string): void;
}

const PREFIX = 'jfb:project:';
export const AUTOSAVE_ID = 'autosave';

export const localStorageAdapter: StorageAdapter = {
  list() {
    const metas: ProjectMeta[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const file = JSON.parse(raw) as ProjectFile;
        metas.push({ id: file.id, name: file.name, updatedAt: file.updatedAt });
      } catch {
        // skip corrupted entries
      }
    }
    return metas.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  load(id) {
    const raw = localStorage.getItem(PREFIX + id);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProjectFile;
    } catch {
      return null;
    }
  },
  save(file) {
    localStorage.setItem(PREFIX + file.id, JSON.stringify(file));
  },
  delete(id) {
    localStorage.removeItem(PREFIX + id);
  },
};

export function listUserProjects(): ProjectMeta[] {
  return localStorageAdapter.list().filter((meta) => meta.id !== AUTOSAVE_ID);
}

export function loadProjectById(id: string): ProjectFile | null {
  return localStorageAdapter.load(id);
}

export function saveProjectNow(
  root: LayoutNode,
  meta: { id: string | null; name: string },
  fallbackName: string,
  theme: ThemeSettings,
): { id: string; name: string } {
  const id = meta.id ?? newId();
  const name = meta.name || fallbackName;
  localStorageAdapter.save({
    schemaVersion: 1,
    id,
    name,
    updatedAt: Date.now(),
    root: structuredClone(root),
    theme,
  });
  return { id, name };
}

export function saveAutosave(
  root: LayoutNode,
  name: string,
  fallbackName: string,
  theme: ThemeSettings,
): void {
  localStorageAdapter.save({
    schemaVersion: 1,
    id: AUTOSAVE_ID,
    name: name || fallbackName,
    updatedAt: Date.now(),
    root: structuredClone(root),
    theme,
  });
}

export function deleteUserProject(id: string): void {
  localStorageAdapter.delete(id);
}
