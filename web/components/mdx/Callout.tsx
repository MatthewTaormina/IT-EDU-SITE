import type { ReactNode } from 'react';

type CalloutType = 'tip' | 'warning' | 'danger';

const styles: Record<CalloutType, { wrapper: string; icon: string; label: string }> = {
  tip: {
    wrapper: 'border-l-4 border-green-500 bg-green-50 text-green-900',
    icon: '💡',
    label: 'Tip',
  },
  warning: {
    wrapper: 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-900',
    icon: '⚠️',
    label: 'Warning',
  },
  danger: {
    wrapper: 'border-l-4 border-red-500 bg-red-50 text-red-900',
    icon: '🚨',
    label: 'Important',
  },
};

// Dark mode handled via CSS custom property
const darkOverrides: Record<CalloutType, string> = {
  tip: '@media(prefers-color-scheme:dark){background:#052e16;color:#bbf7d0}',
  warning: '',
  danger: '',
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
