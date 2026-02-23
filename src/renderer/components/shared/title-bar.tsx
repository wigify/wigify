import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { cn } from '@/renderer/lib/utils';

interface TitleBarTab {
  id: string;
  label: string;
}

interface TitleBarProps {
  tabs?: TitleBarTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  title?: string;
  trailing?: ReactNode;
}

export default function TitleBar({
  tabs,
  activeTab,
  onTabChange,
  title,
  trailing,
}: TitleBarProps) {
  const isMac = useMemo(() => {
    return navigator.platform.toLowerCase().includes('mac');
  }, []);

  return (
    <div
      className={cn(
        'titlebar border-border bg-background flex items-center justify-between border-b',
        isMac ? 'pr-3 pl-20' : 'px-3',
      )}
    >
      {tabs && tabs.length > 0 ? (
        <div className="titlebar-no-drag flex items-center">
          <div className="bg-secondary/50 flex items-center gap-0.5 rounded-lg p-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <span className="text-foreground text-sm font-medium">{title}</span>
      )}

      {trailing && (
        <div className="titlebar-no-drag flex items-center gap-1">
          {trailing}
        </div>
      )}
    </div>
  );
}
