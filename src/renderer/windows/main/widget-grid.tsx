import { useCallback } from 'react';
import {
  Folder,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { WidgetState } from '@/types';
import WidgetPreview from '@/renderer/components/widget/widget-preview';
import { Button } from '@/renderer/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/renderer/components/ui/popover';
import { useWidgets } from '@/renderer/hooks/use-widgets';

interface WidgetCardProps {
  widget: WidgetState;
  onAddToScreen: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onOpenFolder: () => void;
}

function WidgetCard({
  widget,
  onAddToScreen,
  onEdit,
  onRemove,
  onOpenFolder,
}: WidgetCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border">
      <div className="bg-background aspect-video w-full transition-all duration-200 group-hover:scale-[1.02] group-hover:blur-[2px]">
        <WidgetPreview code={widget.sourceCode} className="h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          variant="default"
          size="sm"
          className="pointer-events-auto h-8 gap-1 text-xs"
          onClick={onAddToScreen}
        >
          <Plus className="h-3 w-3" />
          Add to Screen
        </Button>
      </div>

      <div className="pointer-events-none absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto h-7 w-7 rounded-lg"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="end">
            <button
              onClick={onEdit}
              className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={onOpenFolder}
              className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs"
            >
              <Folder className="h-3 w-3" />
              Open Folder
            </button>
            <button
              onClick={onRemove}
              className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface WidgetGridProps {
  onEditWidget: (widget: WidgetState) => void;
  onAddWidget: () => void;
}

export default function WidgetGrid({
  onEditWidget,
  onAddWidget,
}: WidgetGridProps) {
  const { widgets, deleteWidget, openWidgetFolder, addWidgetToScreen } =
    useWidgets();

  const handleAddToScreen = useCallback(
    async (widgetName: string) => {
      await addWidgetToScreen(widgetName);
    },
    [addWidgetToScreen],
  );

  const handleRemove = useCallback(
    async (widget: WidgetState) => {
      await deleteWidget(widget.manifest.name);
    },
    [deleteWidget],
  );

  const handleOpenFolder = useCallback(
    async (widget: WidgetState) => {
      await openWidgetFolder(widget.manifest.name);
    },
    [openWidgetFolder],
  );

  if (widgets.length === 0) {
    return (
      <div className="window-content flex h-full flex-col items-center justify-center gap-4">
        <div className="bg-secondary flex h-12 w-12 items-center justify-center rounded-xl">
          <LayoutGrid className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-foreground text-base font-medium">
            No widgets yet
          </span>
          <span className="text-muted-foreground text-center text-sm">
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
      </div>
    );
  }

  return (
    <div className="window-content overflow-auto">
      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-3 lg:grid-cols-4">
        {widgets.map(widget => (
          <WidgetCard
            key={widget.manifest.name}
            widget={widget}
            onAddToScreen={() => handleAddToScreen(widget.manifest.name)}
            onEdit={() => onEditWidget(widget)}
            onRemove={() => handleRemove(widget)}
            onOpenFolder={() => handleOpenFolder(widget)}
          />
        ))}
      </div>
    </div>
  );
}
