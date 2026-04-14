import type { ReactNode } from 'react';

type CalloutType = 'tip' | 'warning' | 'danger' | 'info' | 'research';

const styles: Record<CalloutType, { wrapper: string; icon: string; label: string }> = {
  tip: {
    wrapper:
      'border-l-4 border-green-600 bg-green-50 text-green-900 ' +
      'dark:border-green-400 dark:bg-green-950 dark:text-green-100',
    icon: '💡',
    label: 'Tip',
  },
  warning: {
    wrapper:
      'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-900 ' +
      'dark:border-yellow-400 dark:bg-yellow-950 dark:text-yellow-100',
    icon: '⚠️',
    label: 'Warning',
  },
  danger: {
    wrapper:
      'border-l-4 border-red-600 bg-red-50 text-red-900 ' +
      'dark:border-red-400 dark:bg-red-950 dark:text-red-100',
    icon: '🚨',
    label: 'Important',
  },
  info: {
    wrapper:
      'border-l-4 border-sky-500 bg-sky-50 text-sky-900 ' +
      'dark:border-sky-400 dark:bg-sky-950 dark:text-sky-100',
    icon: 'ℹ️',
    label: 'Info',
  },
  research: {
    wrapper:
      'border-l-4 border-purple-600 bg-purple-50 text-purple-900 ' +
      'dark:border-purple-400 dark:bg-purple-950 dark:text-purple-100',
    icon: '🔬',
    label: 'Research',
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export default function Callout({ type = 'tip', title, children }: CalloutProps) {
  const { wrapper, icon, label } = styles[type];
  return (
    <div className={`my-4 p-4 rounded-r-lg not-prose ${wrapper}`} role="note">
      <p className="font-semibold text-sm mb-1">
        {icon} {title ?? label}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
