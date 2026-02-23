import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import type { WidgetState } from '@/types';
import TitleBar from '../../components/title-bar';
import { Button } from '../../components/ui/button';
import { useWidgets } from '../../hooks/use-widgets';
import ActiveWidgets from './active-widgets';
import EmptyPage from './empty';
import WidgetEditor from './widget-editor';
import WidgetGrid from './widget-grid';

type MainRoute = 'home' | 'editor';
type HomeTab = 'active' | 'created';

const HOME_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'created', label: 'Created' },
];

export default function MainWindow() {
  const [route, setRoute] = useState<MainRoute>('home');
  const [activeTab, setActiveTab] = useState<HomeTab>('active');
  const [editingWidget, setEditingWidget] = useState<WidgetState | null>(null);
  const { widgets, loading, refresh } = useWidgets();

  const handleSave = () => {
    refresh();
    setRoute('home');
  };

  const handleAddWidget = useCallback(() => {
    setEditingWidget(null);
    setRoute('editor');
  }, []);

  const handleEditWidget = useCallback((widget: WidgetState) => {
    setEditingWidget(widget);
    setRoute('editor');
  }, []);

  if (route === 'editor') {
    return (
      <WidgetEditor
        widget={editingWidget ?? undefined}
        onBack={() => setRoute('home')}
        onSave={handleSave}
      />
    );
  }

  if (loading) {
    return (
      <div className="window-content flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  if (widgets.length === 0) {
    return <EmptyPage onAddWidget={handleAddWidget} />;
  }

  return (
    <>
      <TitleBar
        tabs={HOME_TABS}
        activeTab={activeTab}
        onTabChange={id => setActiveTab(id as HomeTab)}
        trailing={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddWidget}
          >
            <Plus className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
        }
      />
      {activeTab === 'active' ? (
        <ActiveWidgets />
      ) : (
        <WidgetGrid onEditWidget={handleEditWidget} />
      )}
    </>
  );
}
