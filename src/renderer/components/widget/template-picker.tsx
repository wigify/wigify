import { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { templates } from '@/templates';
import type { Template } from '@/templates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/renderer/components/ui/dialog';
import WidgetPreview from '@/renderer/components/widget/widget-preview';

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: Template) => void;
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: (template: Template) => void;
}) {
  return (
    <button
      className="border-border bg-secondary hover:border-ring flex cursor-pointer flex-col overflow-hidden rounded-md border transition-all hover:shadow-md"
      onClick={() => onSelect(template)}
    >
      <div className="pointer-events-none relative h-24 w-full overflow-hidden">
        <WidgetPreview
          code={template.code}
          className="h-full w-full"
          scale={0.5}
        />
      </div>
      <div className="border-border w-full border-t px-3 py-2">
        <span className="text-foreground text-xs font-medium">
          {template.title}
        </span>
      </div>
    </button>
  );
}

export default function TemplatePicker({
  open,
  onOpenChange,
  onSelect,
}: TemplatePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const query = search.toLowerCase();
    return templates.filter(t => t.title.toLowerCase().includes(query));
  }, [search]);

  const handleSelect = useCallback(
    (template: Template) => {
      onSelect(template);
      onOpenChange(false);
      setSearch('');
    },
    [onSelect, onOpenChange],
  );

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value);
      if (!value) setSearch('');
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-dvh flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="space-y-0 p-4 pb-0">
          <DialogTitle className="text-sm">Templates</DialogTitle>
          <DialogDescription className="text-xs">
            Hover to preview. Click to apply.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pt-3 pb-2">
          <div className="border-border bg-secondary flex items-center rounded-md border px-3">
            <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="text-foreground placeholder:text-muted-foreground/70 h-8 w-full bg-transparent px-2 text-xs outline-none"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-4">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
              No templates found
            </div>
          ) : (
            <div className="grid grid-cols-2 justify-center gap-3 md:grid-cols-4">
              {filtered.map(template => (
                <TemplateCard
                  key={template.name}
                  template={template}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
