import { useBuilder } from '@/features/document-model/store';
import { DEFAULT_THEME } from '@/features/document-model/types';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { themeVars } from './themeVars';

export function ThemePanel() {
  const { t } = useT();
  const theme = useBuilder((s) => s.theme);
  const setTheme = useBuilder((s) => s.setTheme);

  return (
    <details className="mb-3 rounded-md border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-700 select-none">
        <Icon name="pencil" className="h-3.5 w-3.5 text-zinc-400" />
        {t('theme.title')}
      </summary>
      <div className="border-t border-zinc-200 p-2.5">
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">{t('theme.accent')}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accent || DEFAULT_THEME.accent}
              onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-md border border-zinc-300"
            />
            <input
              type="text"
              value={theme.accent || ''}
              onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              className="h-9 w-full rounded-md border border-zinc-300 px-2.5 font-mono text-sm text-zinc-700 outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">{t('theme.radius')}</label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0} max={16}
              value={theme.radius ?? 6}
              onChange={(e) => setTheme({ ...theme, radius: Number(e.target.value) })}
              className="h-9 w-full accent-blue-500"
            />
            <span className="w-10 text-right font-mono text-xs text-zinc-500">{theme.radius ?? 6}px</span>
          </div>
</div>
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">{t('theme.density')}</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setTheme({ ...theme, density: 'comfortable' })}
              className={
                theme.density === 'comfortable'
                  ? 'rounded-md border border-blue-500 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700'
                  : 'rounded-md border border-zinc-300 px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50'
              }
            >
              {t('theme.density.comfortable')}
            </button>
            <button
              onClick={() => setTheme({ ...theme, density: 'compact' })
              }
              className={
                theme.density === 'compact'
                  ? 'rounded-md border border-blue-500 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700'
                : 'rounded-md border border-zinc-300 px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50'
              }
            >
              {t('theme.density.compact')}
            </button>
          </div>
        </div>
        <button
          onClick={() => setTheme(DEFAULT_THEME)}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          <Icon name="undo" className="h-3.5 w-3.5" />
          {t('theme.reset')}
        </button>
      </div>
    </details>
  );
}
