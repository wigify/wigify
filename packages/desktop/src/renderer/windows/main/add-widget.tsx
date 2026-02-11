import { useMemo, useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  ChevronLeft,
  Eye,
  LayoutTemplate,
  PanelRight,
  Plus,
  Save,
  Search,
} from 'lucide-react';
import { templates } from '@wigify/templates';
import type { Template } from '@wigify/templates';
import { Button } from '../../components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import MonacoEditor from '../../components/monaco-editor';
import WidgetPreview from '../../components/widget-preview';
import { cn } from '../../lib/utils';

interface AddWidgetPageProps {
  onBack: () => void;
}

interface VariableItem {
  name: string;
  type: string;
  value: string;
}

const VARIABLE_ITEMS: VariableItem[] = [
  { name: 'username', type: 'string', value: '"john_doe"' },
  { name: 'count', type: 'number', value: '42' },
  { name: 'isActive', type: 'boolean', value: 'true' },
];

const DEFAULT_TEMPLATE = templates[0];

export default function AddWidgetPage({ onBack }: AddWidgetPageProps) {
  const [query, setQuery] = useState('');
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [code, setCode] = useState(DEFAULT_TEMPLATE.code);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (!template) {
      return;
    }
    setPendingTemplate(template);
    setComboboxOpen(false);
  };

  const handleApplyTemplate = () => {
    if (!pendingTemplate) {
      return;
    }
    setCode(pendingTemplate.code);
    setPendingTemplate(null);
  };
  const isMac = useMemo(() => {
    return navigator.platform.toLowerCase().includes('mac');
  }, []);

  const filteredVariables = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return VARIABLE_ITEMS;
    }

    return VARIABLE_ITEMS.filter(variable => {
      return (
        variable.name.toLowerCase().includes(normalizedQuery) ||
        variable.type.toLowerCase().includes(normalizedQuery) ||
        variable.value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

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
          <span className="text-foreground text-sm font-medium">
            Add Widget
          </span>
        </div>

        <div className="titlebar-no-drag flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Save className="text-muted-foreground h-3.5 w-3.5" />
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
            <div className="flex shrink-0 flex-col">
              <div className="border-border flex h-9 shrink-0 items-center border-b px-3">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Templates
                  </span>
                </div>
              </div>
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
            </div>

            <div className="border-border flex flex-1 flex-col border-t">
              <div className="border-border flex h-9 shrink-0 items-center justify-between border-b px-3">
                <div className="flex items-center gap-2">
                  <Eye className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Preview
                  </span>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center overflow-hidden p-3">
                <WidgetPreview
                  code={code}
                  className="h-full w-full overflow-hidden rounded-lg"
                />
              </div>
            </div>

            <div className="border-border flex flex-1 flex-col border-t">
              <div className="border-border flex h-9 shrink-0 items-center justify-between border-b px-3">
                <span className="text-muted-foreground text-xs font-medium">
                  Variables
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="p-2">
                <div className="bg-secondary flex items-center gap-2 rounded-md px-2 py-1.5">
                  <Search className="text-muted-foreground h-3 w-3" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search"
                    className="placeholder:text-muted-foreground/70 text-foreground w-full bg-transparent text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 overflow-auto px-2 pb-2">
                {filteredVariables.map(variable => (
                  <div
                    key={variable.name}
                    className="bg-secondary rounded-md px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground font-mono text-xs font-medium">
                        {variable.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {variable.type}
                      </span>
                    </div>
                    <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                      {variable.value}
                    </span>
                  </div>
                ))}

                {!filteredVariables.length && (
                  <div className="text-muted-foreground flex h-16 items-center justify-center text-xs">
                    No variables found
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
