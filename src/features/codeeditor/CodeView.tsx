import { useEffect, useMemo, useState } from 'react';
import { fromSchemas, type LooseSchema, type LooseUiSchema } from '@/features/document-model/import';
import { toJsonSchema, toUiSchema } from '@/features/document-model/serialize';
import { useBuilder } from '@/features/document-model/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { HSplit } from '@/shared/ui/Split';

export function CodeView({ onClose }: { onClose?: () => void }) {
  const { t } = useT();
  const root = useBuilder((s) => s.root);
  const applyDocument = useBuilder((s) => s.applyDocument);

  const generatedSchema = useMemo(() => JSON.stringify(toJsonSchema(root), null, 2), [root]);
  const generatedUi = useMemo(() => JSON.stringify(toUiSchema(root), null, 2), [root]);

  const [schemaText, setSchemaText] = useState(generatedSchema);
  const [uiText, setUiText] = useState(generatedUi);
  const [schemaEdited, setSchemaEdited] = useState(false);
  const [uiEdited, setUiEdited] = useState(false);
  const [schemaError, setSchemaError] = useState(false);
  const [uiError, setUiError] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!schemaEdited) setSchemaText(generatedSchema);
  }, [generatedSchema, schemaEdited]);

  useEffect(() => {
    if (!uiEdited) setUiText(generatedUi);
  }, [generatedUi, uiEdited]);

  const apply = () => {
    let schema: LooseSchema;
    let ui: LooseUiSchema;
    try {
      schema = JSON.parse(schemaText);
    } catch {
      setSchemaError(true);
      return;
    }
    try {
      ui = JSON.parse(uiText);
    } catch {
      setUiError(true);
      return;
    }
    setSchemaError(false);
    setUiError(false);
    applyDocument(fromSchemas(schema, ui));
    setApplied(true);
    window.setTimeout(() => setApplied(false), 1500);
  };

  const syncFromBuilder = () => {
    setSchemaEdited(false);
    setUiEdited(false);
    setSchemaError(false);
    setUiError(false);
  };

  const dirty = schemaEdited || uiEdited;

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 border-t border-zinc-200 bg-white p-2">
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs font-semibold text-zinc-700">{t('code.title')}</span>
        {dirty && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            {t('code.dirty')}
          </span>
        )}
        {applied && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            {t('code.applied')}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={syncFromBuilder}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {t('code.syncFromBuilder')}
          </button>
          <button
            onClick={apply}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
          >
            {t('code.apply')}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title={t('common.close')}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <HSplit
          first={
            <EditorColumn
              label={t('code.schema')}
              value={schemaText}
              error={schemaError}
              onChange={(v) => {
                setSchemaText(v);
                setSchemaEdited(true);
                setSchemaError(false);
              }}
            />
          }
          second={
            <EditorColumn
              label={t('code.uiSchema')}
              value={uiText}
              error={uiError}
              onChange={(v) => {
                setUiText(v);
                setUiEdited(true);
                setUiError(false);
              }}
            />
          }
        />
      </div>
    </div>
  );
}

function EditorColumn({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        {error && <span className="text-[11px] font-medium text-red-600">{t('code.invalidJson')}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="min-h-0 w-full flex-1 resize-none rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-blue-400"
      />
    </div>
  );
}
