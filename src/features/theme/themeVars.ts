import type { ThemeSettings } from '@/features/document-model/types';

const FALLBACK = '#2563eb';

export function themeVars(theme: ThemeSettings): Record<string, string> {
  return {
    '--jfb-accent': theme.accent || FALLBACK,
    '--jfb-radius': `${theme.radius ?? 6}px`,
    '--jfb-input-pad': theme.density === 'compact' ? '0.1875rem' : '0.4375rem',
  };
}
