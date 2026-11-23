import { newId } from '@/shared/lib/id';
import type { DocumentNode, LayoutNode } from './types';

export function findNode(node: DocumentNode, id: string): DocumentNode | null {
  if (node.id === id) return node;
  if (node.kind === 'layout') {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParent(node: LayoutNode, id: string): LayoutNode | null {
  for (const child of node.children) {
    if (child.id === id) return node;
    if (child.kind === 'layout') {
      const parent = findParent(child, id);
      if (parent) return parent;
    }
  }
  return null;
}

export function isAncestor(root: DocumentNode, ancestorId: string, id: string): boolean {
  if (ancestorId === id) return false;
  const ancestor = findNode(root, ancestorId);
  if (!ancestor || ancestor.kind !== 'layout') return false;
  return findNode(ancestor, id) !== null;
}

export function collectControlNames(
  node: DocumentNode,
  excludeId?: string,
  acc: Set<string> = new Set(),
): Set<string> {
  if (node.kind === 'control') {
    if (node.id !== excludeId) acc.add(node.name);
  } else if (node.kind === 'layout') {
    node.children.forEach((child) => collectControlNames(child, excludeId, acc));
  }
  return acc;
}

export function collectIds(node: DocumentNode, acc: string[] = []): string[] {
  acc.push(node.id);
  if (node.kind === 'layout') {
    node.children.forEach((child) => collectIds(child, acc));
  }
  return acc;
}

export function reassignIds(node: DocumentNode, forcedId?: string): void {
  node.id = forcedId ?? newId();
  if (node.kind === 'layout') {
    node.children.forEach((child) => reassignIds(child));
  }
}

export function layoutDepthMap(root: DocumentNode): Map<string, number> {
  const map = new Map<string, number>();
  const walk = (node: DocumentNode, depth: number) => {
    if (node.kind === 'layout') {
      map.set(node.id, depth);
      node.children.forEach((child) => walk(child, depth + 1));
    }
  };
  walk(root, 0);
  return map;
}
