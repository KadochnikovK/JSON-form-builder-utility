import { useMemo } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { useT } from '@/shared/i18n';
import { formatProblem, lintDocument } from './lint';

export function ProblemsPanel() {
  const { t } = useT();
  const root = useBuilder((s) => s.root);
  const select = useBuilder((s) => s.select);
  const problems = useMemo(() => lintDocument(root), [root]);

  const errors = problems.filter((p) => p.severity === 'error');
  const warnings = problems.filter((p) => p.severity === 'warning');
  const total = problems.length;

  return (
    <details className="mt-4 rounded-md border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-700 select-none">
        {t('lint.title')}
        <span
          className={
            total === 0
              ? 'rounded-full bg-zinc-100 px-1.5 text-[10px] text-zinc-500'
              : errors.length > 0
                ? 'rounded-full bg-red-100 px-1.5 text-[10px] font-medium text-red-700'
                : 'rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-amber-700'
          }
        >
          {total}
        </span>
      </summary>
      <div className="border-t border-zinc-200 p-2">
        {total === 0 ? (
          <div className="px-1 py-2 text-center text-[11px] text-zinc-400">{t('lint.noProblems')}</div>
        ) : (
          <ul className="flex flex-col gap-1">
            {problems.map((problem, i) => (
              <li key={i}>
                <button
                  onClick={() => select(problem.nodeId)}
                  className={`w-full rounded px-2 py-1 text-left text-[11px] leading-snug hover:bg-zinc-50 ${
                    problem.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  <span className="mr-1">{problem.severity === 'error' ? '✕' : '⚠'}</span>
                  {formatProblem(problem, t)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
