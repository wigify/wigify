import { useState } from 'react';
import AddWidgetPage from './add-widget';
import EmptyPage from './empty';

type MainRoute = 'home' | 'add-widget';

export default function MainWindow() {
  const [route, setRoute] = useState<MainRoute>('home');

  if (route === 'home') {
    return <EmptyPage onAddWidget={() => setRoute('add-widget')} />;
  }

  return <AddWidgetPage onBack={() => setRoute('home')} />;
}
