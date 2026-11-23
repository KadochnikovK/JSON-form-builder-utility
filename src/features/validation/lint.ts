import { collectControlNames } from '@/features/document-model/ops';
import type { ControlNode, DocumentNode, LayoutNode } from '@/features/document-model/types';
import type { Translate } from '@/shared/i18n';

export type ProblemSeverity = 'error' | 'warning';

export interface Problem {
  severity: ProblemSeverity;
  nodeId: string;
  messageKey: string;
  params?: Record<string, string>;
}

export function lintDocument(root: LayoutNode): Problem[] {
  const problems: Problem[] = [];
  const names = collectControlNames(root);

  const visit = (node: DocumentNode) => {
    if (node.kind === 'static') return;
    if (node.kind === 'layout') {
      node.children.forEach(visit);
      return;
    }
    lintControl(node, names, problems);
  };
  root.children.forEach(visit);
  return problems;
}

function lintControl(node: ControlNode, names: Set<string>, problems: Problem[]) {
  if (node.schema.pattern) {
    try {
      new RegExp(node.schema.pattern);
    } catch {
      problems.push({
        severity: 'error',
        nodeId: node.id,
        messageKey: 'lint.invalidPattern',
        params: { label: node.label || node.name },
      });
    }
  }

  const isChoice = node.controlType === 'select' || node.controlType === 'radio';
  if (isChoice && !node.dataBinding?.url && (node.schema.enum ?? []).length === 0) {
    problems.push({
      severity: 'warning',
      nodeId: node.id,
      messageKey: 'lint.emptyEnum',
      params: { label: node.label || node.name },
    });
  }

  if (node.rule) {
    if (!node.rule.field || !names.has(node.rule.field)) {
      problems.push({
        severity: 'error',
        nodeId: node.id,
        messageKey: 'lint.ruleFieldMissing',
        params: { label: node.label || node.name, field: node.rule.field || '—' },
      });
    }
  }

  if (node.dataBinding?.url) {
    if (node.dataBinding.mock.trim()) {
      try {
        JSON.parse(node.dataBinding.mock);
      } catch {
        problems.push({
          severity: 'warning',
          nodeId: node.id,
          messageKey: 'lint.invalidMock',
          params: { label: node.label || node.name },
        });
      }
    } else {
      problems.push({
        severity: 'warning',
        nodeId: node.id,
        messageKey: 'lint.noMock',
        params: { label: node.label || node.name },
      });
    }
  }
}

export function formatProblem(problem: Problem, t: Translate): string {
  const template = t(problem.messageKey);
  return template.replace(/\{(\w+)\}/g, (_, key: string) => problem.params?.[key] ?? `{${key}}`);
}
