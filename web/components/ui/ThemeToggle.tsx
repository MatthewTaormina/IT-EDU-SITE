'use client';

import { useTheme, type ThemeMode } from './ThemeProvider';

const cycle: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light:  'dark',
  dark:   'system',
};

const icons: Record<ThemeMode, string> = {
  system: '💻',
  light:  '☀️',
  dark:   '🌙',
};

const labels: Record<ThemeMode, string> = {
  system: 'System',
  light:  'Light',
  dark:   'Dark',
};

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const next = cycle[mode];

  return (
    <button
      onClick={() => setMode(next)}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
      aria-label={`Theme: ${labels[mode]}. Click to switch to ${labels[next]}`}
      title={`Theme: ${labels[mode]} — click for ${labels[next]}`}
    >
      <span aria-hidden="true">{icons[mode]}</span>
      <span className="hidden sm:inline text-xs font-medium">{labels[mode]}</span>
    </button>
  );
}
