import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface CollapsibleSectionProps {
  icon?: ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  icon,
  title,
  isOpen,
  onToggle,
  headerActions,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <div className={cn('flex flex-col', isOpen && 'flex-1', className)}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'hover:bg-secondary/50 flex h-9 shrink-0 cursor-pointer items-center justify-between px-3',
          isOpen && 'border-border border-b',
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-muted-foreground text-xs font-medium">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {headerActions && (
            <div
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
            >
              {headerActions}
            </div>
          )}
          <ChevronDown
            className={cn(
              'text-muted-foreground h-3.5 w-3.5 transition-transform duration-200',
              !isOpen && '-rotate-90',
            )}
          />
        </div>
      </button>
      {isOpen && <div className="flex flex-1 flex-col">{children}</div>}
    </div>
  );
}
