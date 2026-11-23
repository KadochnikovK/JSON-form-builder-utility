import { Canvas } from '@/features/canvas/Canvas';
import { DndProvider } from '@/features/canvas/DndProvider';
import { useBuilder } from '@/features/document-model/store';
import { Inspector } from '@/features/inspector/Inspector';
import { Palette } from '@/features/palette/Palette';
import { useAutosave } from '@/features/project/useAutosave';
import { I18nProvider } from '@/shared/i18n';
import { Toolbar } from './Toolbar';
import { useHotkeys } from './useHotkeys';

export default function App() {
  return (
    <I18nProvider>
      <DndProvider>
        <Shell />
      </DndProvider>
    </I18nProvider>
  );
}

function Shell() {
  useAutosave();
  useHotkeys();
  const mode = useBuilder((s) => s.mode);

  return (
    <div className="flex h-full flex-col">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {mode === 'edit' && (
          <aside className="w-60 shrink-0 border-r border-zinc-200 bg-white">
            <Palette />
          </aside>
        )}
        <main className="min-w-0 flex-1 bg-zinc-100">
          <Canvas />
        </main>
        {mode === 'edit' && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white">
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  );
}
