import { LayoutGrid, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface EmptyPageProps {
  onAddWidget: () => void;
}

export default function EmptyPage({ onAddWidget }: EmptyPageProps) {
  return (
    <>
      <div className="titlebar border-border flex items-center justify-center border-b">
        <h1 className="text-muted-foreground text-sm font-medium">Wigify</h1>
      </div>

      <div className="window-content flex h-full flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-secondary flex h-12 w-12 items-center justify-center rounded-xl">
            <LayoutGrid className="text-muted-foreground h-6 w-6" />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-foreground text-base font-medium">
              No widgets yet
            </span>
            <span className="text-muted-foreground text-sm">
              Create your first widget to get started
            </span>
          </div>

          <Button
            size="sm"
            className="flex-row gap-1.5 rounded-lg px-4"
            onClick={onAddWidget}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Widget</span>
          </Button>

          <div className="flex flex-row items-center gap-1">
            <span className="text-muted-foreground/60 text-xs">or press</span>
            <kbd className="bg-secondary text-muted-foreground rounded border px-1.5 py-0.5 text-xs font-medium">
              CMD
            </kbd>
            <kbd className="bg-secondary text-muted-foreground rounded border px-1.5 py-0.5 text-xs font-medium">
              N
            </kbd>
          </div>
        </div>
      </div>
    </>
  );
}
