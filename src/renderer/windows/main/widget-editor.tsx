import { useCallback, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Eye,
  LayoutTemplate,
  PanelRight,
  Save,
  Settings,
} from 'lucide-react';
import { templates } from '@/templates';
import type { Template } from '@/templates';
import type { WidgetSourceFiles, WidgetState } from '@/types';
import { Button } from '@/renderer/components/ui/button';
import MonacoEditor from '@/renderer/components/widget/monaco-editor';
import WidgetPreview from '@/renderer/components/widget/widget-preview';
import TemplatePicker from '@/renderer/components/widget/template-picker';
import CollapsibleSection from '@/renderer/components/shared/collapsible-section';
import { useLocalStorage } from '@/renderer/hooks/use-local-storage';
import { useWidgets } from '@/renderer/hooks/use-widgets';
import { cn } from '@/renderer/lib/utils';

type EditorTab = 'html' | 'css' | 'js';

interface SidebarSections {
  settings: boolean;
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
  preview: true,
};

const WIDGET_NAME_REGEX = /^[a-z][a-z0-9-]*$/;

const TABS: {
  id: EditorTab;
  label: string;
  language: 'html' | 'css' | 'javascript';
}[] = [
  { id: 'html', label: 'widget.html', language: 'html' },
  { id: 'css', label: 'style.css', language: 'css' },
  { id: 'js', label: 'script.js', language: 'javascript' },
];

export default function WidgetEditor({
  widget,
  onBack,
  onSave,
}: WidgetEditorProps) {
  const isEditing = !!widget;

  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [html, setHtml] = useState(
    widget?.source.html ?? DEFAULT_TEMPLATE.source.html,
  );
  const [css, setCss] = useState(
    widget?.source.css ?? DEFAULT_TEMPLATE.source.css,
  );
  const [js, setJs] = useState(widget?.source.js ?? DEFAULT_TEMPLATE.source.js);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sections, setSections] = useLocalStorage<SidebarSections>(
    'widget-editor:sidebar-sections',
    DEFAULT_SECTIONS,
  );

  const [widgetName, setWidgetName] = useState(widget?.manifest.name ?? '');
  const [widgetWidth, setWidgetWidth] = useState(
    widget?.manifest.size.width ?? 200,
  );
  const [widgetHeight, setWidgetHeight] = useState(
    widget?.manifest.size.height ?? 100,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    createWidget,
    updateWidgetSource,
    updateWidgetSize,
    addWidgetToScreen,
  } = useWidgets();

  const source: WidgetSourceFiles = useMemo(
    () => ({ html, css, js }),
    [html, css, js],
  );

  const toggleSection = (section: keyof SidebarSections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTemplateSelect = useCallback((template: Template) => {
    setHtml(template.source.html);
    setCss(template.source.css);
    setJs(template.source.js);
  }, []);

  const isValidName = useMemo(() => {
    return widgetName.length > 0 && WIDGET_NAME_REGEX.test(widgetName);
  }, [widgetName]);

  const sizeChanged = useMemo(() => {
    if (!isEditing) return false;
    return (
      widgetWidth !== widget.manifest.size.width ||
      widgetHeight !== widget.manifest.size.height
    );
  }, [isEditing, widget, widgetWidth, widgetHeight]);

  const sourceChanged = useMemo(() => {
    if (!isEditing) return false;
    return (
      html !== widget.source.html ||
      css !== widget.source.css ||
      js !== widget.source.js
    );
  }, [isEditing, widget, html, css, js]);

  const canSave = useMemo(() => {
    if (saving) return false;
    if (widgetWidth < 1 || widgetHeight < 1) return false;

    if (isEditing) return sourceChanged || sizeChanged;

    return isValidName;
  }, [
    saving,
    isEditing,
    isValidName,
    widgetWidth,
    widgetHeight,
    sourceChanged,
    sizeChanged,
  ]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    const size = { width: widgetWidth, height: widgetHeight };

    try {
      if (isEditing) {
        if (sourceChanged) {
          await updateWidgetSource(widget.manifest.name, source);
        }
        if (sizeChanged) {
          await updateWidgetSize(widget.manifest.name, size);
        }
      } else {
        await createWidget({ name: widgetName, source, size });
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
    widgetWidth,
    widgetHeight,
    source,
    sourceChanged,
    sizeChanged,
    createWidget,
    updateWidgetSource,
    updateWidgetSize,
    addWidgetToScreen,
    onSave,
  ]);

  const isMac = useMemo(() => {
    return navigator.platform.toLowerCase().includes('mac');
  }, []);

  const title = isEditing ? widget.manifest.title : 'Add Widget';

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;
  const tabValues: Record<EditorTab, string> = { html, css, js };
  const tabSetters: Record<EditorTab, (v: string) => void> = {
    html: setHtml,
    css: setCss,
    js: setJs,
  };

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
            onClick={() => setTemplatePickerOpen(true)}
          >
            <LayoutTemplate className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
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
          <div className="border-border flex shrink-0 border-b">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-foreground border-foreground border-b-2'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <MonacoEditor
            value={tabValues[activeTab]}
            onChange={tabSetters[activeTab]}
            language={activeTabConfig.language}
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    Default Size
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={widgetWidth}
                      onChange={e =>
                        setWidgetWidth(Math.max(1, Number(e.target.value)))
                      }
                      min={1}
                      placeholder="Width"
                      className="border-border bg-secondary text-foreground placeholder:text-muted-foreground/70 focus:ring-ring h-8 w-full rounded-md border px-2.5 text-xs outline-none focus:ring-1"
                    />
                    <span className="text-muted-foreground text-xs">x</span>
                    <input
                      type="number"
                      value={widgetHeight}
                      onChange={e =>
                        setWidgetHeight(Math.max(1, Number(e.target.value)))
                      }
                      min={1}
                      placeholder="Height"
                      className="border-border bg-secondary text-foreground placeholder:text-muted-foreground/70 focus:ring-ring h-8 w-full rounded-md border px-2.5 text-xs outline-none focus:ring-1"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-md px-2.5 py-2 text-xs">
                    {error}
                  </div>
                )}
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
                  source={source}
                  debounce={300}
                  className="h-full w-full overflow-hidden rounded-lg"
                />
              </div>
            </CollapsibleSection>
          </aside>
        )}
      </div>
      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
