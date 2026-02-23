import { useState } from 'react';
import { Plus } from 'lucide-react';
import TitleBar from '../../components/title-bar';
import { Button } from '../../components/ui/button';
import { useWidgets } from '../../hooks/use-widgets';
import ActiveWidgets from './active-widgets';
import AddWidgetPage from './add-widget';
import EmptyPage from './empty';
import WidgetGrid from './widget-grid';

type MainRoute = 'home' | 'add-widget';
type HomeTab = 'active' | 'created';

const HOME_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'created', label: 'Created' },
];

export default function MainWindow() {
  const [route, setRoute] = useState<MainRoute>('home');
  const [activeTab, setActiveTab] = useState<HomeTab>('active');
  const { widgets, loading, refresh } = useWidgets();

  const handleSave = () => {
    refresh();
    setRoute('home');
  };

  if (route === 'add-widget') {
    return (
      <AddWidgetPage onBack={() => setRoute('home')} onSave={handleSave} />
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
    return <EmptyPage onAddWidget={() => setRoute('add-widget')} />;
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
            onClick={() => setRoute('add-widget')}
          >
            <Plus className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
        }
      />
      {activeTab === 'active' ? <ActiveWidgets /> : <WidgetGrid />}
    </>
  );
}
