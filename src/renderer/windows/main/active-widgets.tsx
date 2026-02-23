import { useCallback, useMemo } from 'react';
import { Monitor, Trash2 } from 'lucide-react';
import type { WidgetInstance, WidgetState } from '@/types';
import WidgetPreview from '../../components/widget-preview';
import { Button } from '../../components/ui/button';
import { useWidgets } from '../../hooks/use-widgets';

interface ActiveInstanceCardProps {
  instance: WidgetInstance;
  widget: WidgetState | undefined;
  onRemove: () => void;
}

function ActiveInstanceCard({
  instance,
  widget,
  onRemove,
}: ActiveInstanceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border">
      <div className="bg-background aspect-video w-full transition-all duration-200 group-hover:scale-[1.02] group-hover:blur-[2px]">
        {widget ? (
          <WidgetPreview code={widget.sourceCode} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-xs">
              Widget not found
            </span>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          variant="default"
          size="sm"
          className="pointer-events-auto h-8 gap-1 text-xs"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
          Remove from Screen
        </Button>
      </div>

      <div className="bg-background/80 pointer-events-none absolute right-0 bottom-0 left-0 flex items-center gap-2 px-3 py-2 backdrop-blur-sm">
        <span className="text-foreground truncate text-xs font-medium">
          {instance.widgetName}
        </span>
        <span className="text-muted-foreground text-[10px]">
          {instance.size.width}x{instance.size.height}
        </span>
      </div>
    </div>
  );
}

export default function ActiveWidgets() {
  const { widgets, removeWidgetFromScreen } = useWidgets();

  const activeInstances = useMemo(() => {
    return widgets.flatMap(widget =>
      widget.instances.map(instance => ({
        instance,
        widget,
      })),
    );
  }, [widgets]);

  const handleRemove = useCallback(
    async (instanceId: string) => {
      await removeWidgetFromScreen(instanceId);
    },
    [removeWidgetFromScreen],
  );

  if (activeInstances.length === 0) {
    return (
      <div className="window-content flex h-full flex-col items-center justify-center gap-4">
        <div className="bg-secondary flex h-12 w-12 items-center justify-center rounded-xl">
          <Monitor className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-foreground text-base font-medium">
            No active widgets
          </span>
          <span className="text-muted-foreground text-center text-sm">
            Add widgets to your screen from the Available tab
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="window-content overflow-auto">
      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-3 lg:grid-cols-4">
        {activeInstances.map(({ instance, widget }) => (
          <ActiveInstanceCard
            key={instance.id}
            instance={instance}
            widget={widget}
            onRemove={() => handleRemove(instance.id)}
          />
        ))}
      </div>
    </div>
  );
}
