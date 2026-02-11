import { useMemo, useState } from 'react';
import {
  Braces,
  ChevronLeft,
  ChevronsLeft,
  Ellipsis,
  ExternalLink,
  FileCode,
  PanelLeft,
  Play,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
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

const CODE_LINES = [
  'export default function Widget() {',
  '  const { data } = useData();',
  '',
  '  return <div>{data}</div>;',
  '}',
];

export default function AddWidgetPage({ onBack }: AddWidgetPageProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState('');
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
    <div className="bg-background h-screen w-screen overflow-hidden">
      <div
        className={cn(
          'titlebar border-border bg-background flex items-center justify-between border-b',
          isMac ? 'pr-3 pl-20' : 'px-3',
        )}
      >
        <div className="titlebar-no-drag flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarCollapsed(previous => !previous)}
          >
            <PanelLeft className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
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

        <span className="text-muted-foreground text-xs font-medium">
          Widget Builder
        </span>

        <div className="titlebar-no-drag flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Play className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Ellipsis className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            Cancel
          </Button>
          <Button size="sm" className="h-7 px-2 text-xs">
            Save
          </Button>
        </div>
      </div>

      <div className="window-content h-full">
        <div className="flex h-full gap-2 p-3">
          <aside
            className={cn(
              'bg-card border-border flex h-full shrink-0 flex-col rounded-lg border',
              sidebarCollapsed ? 'w-12' : 'w-60',
            )}
          >
            <div className="border-border flex h-9 items-center justify-between border-b px-2.5">
              <div className="flex items-center gap-2">
                <Braces className="text-muted-foreground h-3.5 w-3.5" />
                {!sidebarCollapsed && (
                  <span className="text-muted-foreground text-xs font-medium">
                    Variables
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSidebarCollapsed(previous => !previous)}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="text-muted-foreground h-3.5 w-3.5" />
                ) : (
                  <ChevronsLeft className="text-muted-foreground h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            {sidebarCollapsed ? (
              <div className="flex flex-1 flex-col items-center gap-2 py-2">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <div className="border-border border-b p-2">
                  <div className="bg-secondary flex items-center gap-2 rounded-md px-2 py-1.5">
                    <Search className="text-muted-foreground h-3 w-3" />
                    <input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Search variable"
                      className="placeholder:text-muted-foreground/70 text-foreground w-full bg-transparent text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                  <span className="text-muted-foreground/80 text-xs font-semibold tracking-wide">
                    VARIABLES
                  </span>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="text-muted-foreground h-3 w-3" />
                  </Button>
                </div>

                <div className="flex flex-1 flex-col gap-2 overflow-auto px-2 pb-2">
                  {filteredVariables.map(variable => (
                    <div
                      key={variable.name}
                      className="bg-secondary rounded-md px-2.5 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground font-mono text-xs font-medium">
                          {variable.name}
                        </span>
                        <span className="bg-background text-muted-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
                          {variable.type}
                        </span>
                      </div>
                      <span className="text-muted-foreground mt-1 block font-mono text-xs">
                        {variable.value}
                      </span>
                    </div>
                  ))}

                  {!filteredVariables.length && (
                    <div className="text-muted-foreground flex h-20 items-center justify-center text-xs">
                      No matching variables
                    </div>
                  )}
                </div>

                <div className="p-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-8 w-full justify-start gap-1.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add new variable</span>
                  </Button>
                </div>
              </>
            )}
          </aside>

          <section className="bg-card border-border flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="border-border flex h-9 items-center justify-between border-b px-2.5">
              <div className="flex items-center gap-1.5">
                <div className="bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1">
                  <FileCode className="text-muted-foreground h-3 w-3" />
                  <span className="text-foreground font-mono text-xs font-medium">
                    widget.tsx
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="text-muted-foreground h-3 w-3" />
                </Button>
              </div>
              <span className="text-muted-foreground text-xs font-medium">
                TypeScript React
              </span>
            </div>

            <div className="flex min-h-0 flex-1">
              <div className="border-border w-9 shrink-0 border-r px-1.5 py-2">
                {CODE_LINES.map((_, index) => (
                  <div
                    key={`line-${index + 1}`}
                    className={cn(
                      'font-mono text-xs leading-6',
                      index === 3
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50',
                    )}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                <div className="min-h-0 flex-1 overflow-auto font-mono text-xs leading-6">
                  {CODE_LINES.map((line, index) => (
                    <div
                      key={`code-${index + 1}`}
                      className={cn(
                        'rounded-sm px-1.5',
                        index === 3
                          ? 'bg-secondary text-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {line || ' '}
                    </div>
                  ))}
                </div>

                <div className="bg-secondary border-border h-28 rounded-md border">
                  <div className="border-border flex h-8 items-center justify-between border-b px-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-foreground text-xs font-medium">
                        Preview Data
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Notes
                      </span>
                    </div>
                    <ExternalLink className="text-muted-foreground h-3 w-3" />
                  </div>

                  <div className="text-muted-foreground flex flex-col gap-1 px-2.5 py-2 font-mono text-xs">
                    <span>username: "john_doe"</span>
                    <span>count: 42</span>
                    <span>isActive: true</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
