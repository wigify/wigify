import { useCallback, useMemo, useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  ChevronLeft,
  Eye,
  LayoutTemplate,
  PanelRight,
  Save,
  Settings,
} from 'lucide-react';
import { templates } from '@/templates';
import type { Template } from '@/templates';
import type { WidgetState } from '@/types';
import { Button } from '@/renderer/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/renderer/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/renderer/components/ui/popover';
import MonacoEditor from '@/renderer/components/widget/monaco-editor';
import WidgetPreview from '@/renderer/components/widget/widget-preview';
import CollapsibleSection from '@/renderer/components/shared/collapsible-section';
import { useLocalStorage } from '@/renderer/hooks/use-local-storage';
import { useWidgets } from '@/renderer/hooks/use-widgets';
import { cn } from '@/renderer/lib/utils';

interface SidebarSections {
  settings: boolean;
  templates: boolean;
  preview: boolean;
}

interface WidgetEditorProps {
  widget?: WidgetState;
  onBack: () => void;
  onSave?: () => void;
}

const DEFAULT_TEMPLATE = templates[0];

const DEFAULT_SECTIONS: SidebarSections = {
  settings: true,
  templates: true,
  preview: true,
};

const WIDGET_NAME_REGEX = /^[a-z][a-z0-9-]*$/;

export default function WidgetEditor({
  widget,
  onBack,
  onSave,
}: WidgetEditorProps) {
  const isEditing = !!widget;

  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [code, setCode] = useState(widget?.sourceCode ?? DEFAULT_TEMPLATE.code);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [sections, setSections] = useLocalStorage<SidebarSections>(
    'widget-editor:sidebar-sections',
    DEFAULT_SECTIONS,
  );

  const [widgetName, setWidgetName] = useState(widget?.manifest.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createWidget, updateWidgetSource, addWidgetToScreen } = useWidgets();

  const toggleSection = (section: keyof SidebarSections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (!template) return;
    setPendingTemplate(template);
    setComboboxOpen(false);
  };

  const handleApplyTemplate = () => {
    if (!pendingTemplate) return;
    setCode(pendingTemplate.code);
    setPendingTemplate(null);
  };

  const isValidName = useMemo(() => {
    return widgetName.length > 0 && WIDGET_NAME_REGEX.test(widgetName);
  }, [widgetName]);

  const canSave = useMemo(() => {
    if (saving || code.trim().length === 0) return false;

    if (isEditing) return code !== widget.sourceCode;

    return isValidName;
  }, [saving, code, isEditing, widget, isValidName]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await updateWidgetSource(widget.manifest.name, code);
      } else {
        await createWidget({
          name: widgetName,
          code,
          size: DEFAULT_TEMPLATE.manifest.size,
        });
        await addWidgetToScreen(widgetName);
      }
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save widget');
    } finally {
      setSaving(false);
    }
  }, [
    canSave,
    isEditing,
    widget,
    widgetName,
    code,
    createWidget,
    updateWidgetSource,
    addWidgetToScreen,
    onSave,
  ]);

  const isMac = useMemo(() => {
    return navigator.platform.toLowerCase().includes('mac');
  }, []);

  const title = isEditing ? widget.manifest.title : 'Add Widget';

  return (
    <div className="bg-background flex h-screen w-screen flex-col overflow-hidden">
      <div
        className={cn(
          'titlebar border-border flex shrink-0 items-center justify-between border-b',
          isMac ? 'pr-3 pl-20' : 'px-3',
        )}
      >
        <div className="titlebar-no-drag flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onBack}
          >
            <ChevronLeft className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <span className="text-foreground text-sm font-medium">{title}</span>
        </div>

        <div className="titlebar-no-drag flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canSave}
            onClick={handleSave}
          >
            <Save
              className={cn(
                'h-3.5 w-3.5',
                canSave ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <PanelRight
              className={cn(
                'h-3.5 w-3.5',
                sidebarOpen ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
          </Button>
        </div>
      </div>

      <div className="window-content flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          <MonacoEditor
            value={code}
            onChange={setCode}
            className="min-h-0 flex-1"
          />
        </section>

        {sidebarOpen && (
          <aside className="border-border flex w-80 shrink-0 flex-col border-l">
            <CollapsibleSection
              icon={<Settings className="text-muted-foreground h-3.5 w-3.5" />}
              title="Settings"
              isOpen={sections.settings}
              onToggle={() => toggleSection('settings')}
            >
              <div className="flex flex-col gap-3 p-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    Name
                  </label>
                  <input
                    value={widgetName}
                    onChange={e => setWidgetName(e.target.value.toLowerCase())}
                    placeholder="my-widget"
                    className={cn(
                      'border-border bg-secondary text-foreground placeholder:text-muted-foreground/70 h-8 rounded-md border px-2.5 text-xs outline-none',
                      'focus:ring-ring focus:ring-1',
                      widgetName && !isValidName && 'border-destructive',
                    )}
                  />
                  {widgetName && !isValidName && (
                    <span className="text-destructive text-xs">
                      Use lowercase letters, numbers, and hyphens only
                    </span>
                  )}
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-md px-2.5 py-2 text-xs">
                    {error}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              icon={
                <LayoutTemplate className="text-muted-foreground h-3.5 w-3.5" />
              }
              title="Templates"
              isOpen={sections.templates}
              onToggle={() => toggleSection('templates')}
              className="border-border max-h-24 border-t"
            >
              <div className="flex items-center gap-1.5 p-2">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="h-8 flex-1 justify-between text-xs"
                    >
                      {pendingTemplate?.manifest.title ?? 'Select template...'}
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search templates..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No template found.</CommandEmpty>
                        <CommandGroup>
                          {templates.map(template => (
                            <CommandItem
                              key={template.name}
                              value={template.manifest.title}
                              onSelect={() =>
                                handleTemplateSelect(template.name)
                              }
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  pendingTemplate?.name === template.name
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {template.manifest.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8"
                  disabled={!pendingTemplate}
                  onClick={handleApplyTemplate}
                >
                  Apply
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              icon={<Eye className="text-muted-foreground h-3.5 w-3.5" />}
              title="Preview"
              isOpen={sections.preview}
              onToggle={() => toggleSection('preview')}
              className="border-border max-h-64 border-t"
            >
              <div className="flex flex-1 items-center justify-center overflow-hidden p-3">
                <WidgetPreview
                  code={code}
                  debounce={300}
                  className="h-full w-full overflow-hidden rounded-lg"
                />
              </div>
            </CollapsibleSection>
          </aside>
        )}
      </div>
    </div>
  );
}
