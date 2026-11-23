import { useT } from '@/shared/i18n';
import { useBuilder } from '@/features/document-model/store';
import type { ControlNode, DataBinding } from '@/features/document-model/types';

const inputCls = 'h-9 w-full rounded-md border border-zinc-300 px-2.5 text-xs outline-none focus:border-blue-400';
const labelCls = 'mb-1 block text-[11px] font-medium text-zinc-500';

export function BindingEditor({ node }: { node: ControlNode }) {
  const { t } = useT();
  const updateControl = useBuilder((s) => s.updateControl);
  const binding = node.dataBinding;

  const setBinding = (patch: Partial<DataBinding>) => {
    updateControl(node.id, {
      dataBinding: { ...(binding ?? defaults), ...patch },
    });
  };

  return (
    <details className="mb-2 rounded-md border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-700 select-none">
        {t('binding.title')}
        {binding?.url && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
      </summary>
      <div className="border-t border-zinc-200 p-2.5">
        {!binding ? (
          <button
            onClick={() => setBinding({})}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50"
          >
            {t('binding.add')}
          </button>
        ) : (
          <>
            <div className="mb-3">
              <label className={labelCls}>{t('binding.url')}</label>
              <input
                value={binding.url}
                onChange={(e) => setBinding({ url: e.target.value })}
                placeholder="https://api.example.com/items"
                className={inputCls}
              />
            </div>
            <div className="mb-3">
              <label className={labelCls}>{t('binding.itemsPath')}</label>
              <input
                value={binding.itemsPath}
                onChange={(e) => setBinding({ itemsPath: e.target.value })}
                placeholder="$.data.items"
                className={inputCls}
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>{t('binding.labelKey')}</label>
                <input
                  value={binding.labelKey}
                  onChange={(e) => setBinding({ labelKey: e.target.value })}
                  placeholder="name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('binding.valueKey')}</label>
                <input
                  value={binding.valueKey}
                  onChange={(e) => setBinding({ valueKey: e.target.value })}
                  placeholder="id"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className={labelCls}>{t('binding.mock')}</label>
              <textarea
                value={binding.mock}
                onChange={(e) => setBinding({ mock: e.target.value })}
                placeholder={'[{ "id": 1, "name": "Item 1" }]'}
                rows={4}
                spellCheck={false}
                className="w-full resize-y rounded-md border border-zinc-300 px-2 py-1.5 font-mono text-[11px] outline-none focus:border-blue-400"
              />
              <div className="mt-1 text-[10px] text-zinc-400">{t('binding.mockHint')}</div>
            </div>
            <button
              onClick={() => updateControl(node.id, { dataBinding: undefined })}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600"
            >
              {t('binding.remove')}
            </button>
          </>
        )}
      </div>
    </details>
  );
}

const defaults: DataBinding = {
  url: '',
  itemsPath: '$',
  labelKey: 'name',
  valueKey: 'id',
  mock: '',
};
