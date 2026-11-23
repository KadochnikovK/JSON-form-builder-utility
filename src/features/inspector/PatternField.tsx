import { useState } from 'react';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';

interface PatternFieldProps {
  pattern: string | undefined;
  onChange: (pattern: string | undefined) => void;
}

export function PatternField({ pattern, onChange }: PatternFieldProps) {
  const { t } = useT();
  const [sample, setSample] = useState('');

  let regex: RegExp | null = null;
  let regexInvalid = false;
  if (pattern) {
    try {
      regex = new RegExp(pattern);
    } catch {
      regexInvalid = true;
    }
  }
  const verdict =
    regex && sample !== '' ? (regex.test(sample) ? 'ok' : 'fail') : null;

  const status = regexInvalid
    ? { text: t('inspector.patternInvalid'), cls: 'text-amber-600' }
    : verdict === 'ok'
      ? { text: t('inspector.patternOk'), cls: 'text-green-600' }
      : verdict === 'fail'
        ? { text: t('inspector.patternFail'), cls: 'text-red-600' }
        : null;

  return (
    <div className="mb-3">
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{t('inspector.pattern')}</label>
      <input
        value={pattern ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder="^[A-Za-z0-9]+$"
        className="h-9 w-full rounded-md border border-zinc-300 px-2.5 font-mono text-sm outline-none focus:border-blue-400"
      />
      <input
        value={sample}
        onChange={(e) => setSample(e.target.value)}
        placeholder={t('inspector.patternSample')}
        className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 text-sm outline-none focus:border-blue-400"
      />
      {status && (
        <div className={`mt-1 flex items-center gap-1 text-[10px] ${status.cls}`}>
          {verdict === 'ok' && <Icon name="check" className="h-3 w-3" />}
          {status.text}
        </div>
      )}
    </div>
  );
}
