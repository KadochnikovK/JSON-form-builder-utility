export const cx = (...parts: (string | false | undefined | null)[]): string =>
  parts.filter(Boolean).join(' ');
