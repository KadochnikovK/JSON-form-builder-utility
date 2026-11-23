import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import { JsonForms } from '@jsonforms/react';
import { useMemo, useState } from 'react';
import { buildPreviewSchema } from '@/features/databinding/applyBindings';
import { defaultsFromSchema, toUiSchema } from '@/features/document-model/serialize';
import { useBuilder } from '@/features/document-model/store';
import { useT } from '@/shared/i18n';
import { RENDERER_SETS } from '@/features/renderer-sets/registry';
import { ThemePanel } from '@/features/theme/ThemePanel';
import { themeVars } from '@/features/theme/themeVars';

interface PreviewError {
  instancePath: string;
  message?: string;
}

interface LoadedSet {
  renderers: unknown[];
  cells?: unknown[];
}

export function Preview() {
  const { t } = useT();
  const root = useBuilder((s) => s.root);
  const theme = useBuilder((s) => s.theme);
  const schema = useMemo(() => buildPreviewSchema(root), [root]);
  const uischema = useMemo(() => toUiSchema(root), [root]);
  const [data, setData] = useState<Record<string, unknown>>(() => defaultsFromSchema(schema));
  const [errors, setErrors] = useState<PreviewError[]>([]);
  const [rendererSetId, setRendererSetId] = useState('vanilla');
  const [activeSet, setActiveSet] = useState<LoadedSet>({
    renderers: vanillaRenderers as unknown[],
    cells: vanillaCells as unknown[],
  });
  const [loadingSet, setLoadingSet] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isEmpty = Object.keys(schema.properties ?? {}).length === 0;

  const switchSet = async (id: string) => {
    setRendererSetId(id);
    setLoadError(null);
    const def = RENDERER_SETS.find((s) => s.id === id);
    if (!def) return;
    setLoadingSet(true);
    try {
      const loaded = await def.load();
      setActiveSet(loaded);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingSet(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-zinc-400">
        {t('preview.emptyForm')}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
          <span className="text-xs font-medium text-zinc-500">{t('preview.uiLibrary')}:</span>
          <select
            value={rendererSetId}
            onChange={(e) => void switchSet(e.target.value)}
            disabled={loadingSet}
            className="h-8 rounded-md border border-zinc-300 px-2 text-xs outline-none"
          >
            {RENDERER_SETS.map((set) => (
              <option key={set.id} value={set.id}>
                {t(set.labelKey)}
              </option>
            ))}
          </select>
          {loadingSet && <span className="text-xs text-zinc-400">{t('common.loading')}</span>}
          {loadError && <span className="text-xs text-red-600">{t('preview.loadError')}: {loadError}</span>}
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <div
            className={`jsf-theme renderer-${rendererSetId} mx-auto max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm`}
            style={themeVars(theme)}
          >
            <JsonForms
              key={rendererSetId}
              schema={schema as never}
              uischema={uischema as never}
              data={data}
              renderers={activeSet.renderers as never}
              cells={activeSet.cells as never}
              onChange={(event: { data?: Record<string, unknown>; errors?: PreviewError[] }) => {
                setErrors(event.errors ?? []);
                setData(event.data ?? {});
              }}
            />
          </div>
        </div>
      </div>
      <aside className="flex w-96 shrink-0 flex-col overflow-y-auto border-l border-zinc-200 bg-white p-4">
        <ThemePanel />
        <div className="my-3 h-px bg-zinc-200" />
        <div className="mb-2">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {t('preview.errors')}
          </div>
          {errors.length === 0 ? (
            <div className="text-xs text-zinc-400">{t('preview.noErrors')}</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {errors.map((error, i) => (
                <li key={i} className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">
                  <span className="font-mono">{error.instancePath || '/'}</span>
                  {error.message ? ` — ${error.message}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {t('preview.data')}
          </div>
          <pre className="min-h-0 flex-1 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700">
            {JSON.stringify(data, null, 2)}</pre>
        </div>
        <button
          onClick={() => {
            setData(defaultsFromSchema(schema));
            setErrors([]);
          }}
          className="mt-3 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          {t('preview.reset')}
        </button>
      </aside>
    </div>
  );
}
