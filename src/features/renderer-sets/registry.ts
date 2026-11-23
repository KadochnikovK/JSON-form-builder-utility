import { vanillaRenderers, vanillaCells } from '@jsonforms/vanilla-renderers';

export interface LoadedRendererSet {
  renderers: unknown[];
  cells?: unknown[];
}

export interface RendererSetDef {
  id: string;
  labelKey: string;
  load: () => Promise<LoadedRendererSet>;
}

export const RENDERER_SETS: RendererSetDef[] = [
  {
    id: 'vanilla',
    labelKey: 'rendererSet.vanilla',
    load: async () => ({ renderers: vanillaRenderers as unknown[], cells: vanillaCells as unknown[] }),
  },
  {
    id: 'material',
    labelKey: 'rendererSet.material',
    load: async () => {
      const m = await import('@jsonforms/material-renderers');
      return { renderers: m.materialRenderers as unknown[], cells: m.materialCells as unknown[] };
    },
  },
  {
    id: 'antd',
    labelKey: 'rendererSet.antd',
    load: async () => {
      const m = await import('@great-expectations/jsonforms-antd-renderers');
      return {
        renderers: m.rendererRegistryEntries as unknown[],
        cells: m.cellRegistryEntries as unknown[],
      };
    },
  },
];
